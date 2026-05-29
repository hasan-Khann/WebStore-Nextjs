import { NextResponse } from 'next/server';
import { sql } from '@/lib/sql';
import { generateAccessToken, generateRefreshToken } from '@/utils/auth';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const incomingRefreshToken = request.cookies.get('refreshToken')?.value;

    if (!incomingRefreshToken) {
      return NextResponse.json({ status: 401, msg: 'Unauthorized', type: 'error' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return NextResponse.json({ status: 401, msg: 'Session expired', type: 'error' }, { status: 401 });
    }

    const [user] = await sql`
      SELECT id::text, username, email, role, refresh_token
      FROM users
      WHERE id = ${decoded.id}
      LIMIT 1
    `;

    if (!user) {
      return NextResponse.json({ status: 404, msg: 'User not found', type: 'error' }, { status: 404 });
    }

    if (incomingRefreshToken !== user.refresh_token) {
      return NextResponse.json({ status: 401, msg: 'Invalid refresh token', type: 'error' }, { status: 401 });
    }

    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    await sql`
      UPDATE users
      SET refresh_token = ${newRefreshToken}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
    `;

    const response = NextResponse.json({
      status: 200,
      msg: 'Token refreshed',
      type: 'success',
      accessToken,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });

    // 6. Cookie Configuration
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
    };

    response.cookies.set('refreshToken', newRefreshToken, { 
      ...cookieOptions, 
      maxAge: 30 * 24 * 60 * 60 
    });

    response.cookies.set('accessToken', accessToken, { 
      ...cookieOptions, 
      maxAge: 30 * 60 
    });

    return response;

  } catch (error) {
    console.error('REFRESH_TOKEN_ERROR:', error);
    return NextResponse.json({ status: 500, msg: 'Server Error', type: 'error' }, { status: 500 });
  }
}