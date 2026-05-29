import { NextResponse } from 'next/server';
import { sql } from '@/lib/sql';
import { comparePassword, generateAccessToken, generateRefreshToken } from '@/utils/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ status: 400, msg: 'All fields required', type: 'error' });
    }

    const [user] = await sql`
      SELECT id, username, email, role, password, is_verified
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;

    if (!user) {
      return NextResponse.json({ status: 404, msg: 'User does not exist', type: 'error' });
    }

    if (!user.is_verified) {
      return NextResponse.json({ status: 403, msg: 'Please verify your email first', type: 'error' });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ status: 401, msg: 'Invalid credentials', type: 'error' });
    }

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await sql`
      UPDATE users
      SET refresh_token = ${refreshToken}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
    `;

    const res = NextResponse.json({
      status: 200,
      msg: 'Login successful',
      type: 'success',
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });

    const cookieOptions = {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    };

    res.cookies.set('refreshToken', refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 });
    res.cookies.set('accessToken',  accessToken,  { ...cookieOptions, maxAge: 15 * 60 });

    return res;
  } catch (error) {
    console.error('LOGIN_ERROR:', error);
    return NextResponse.json({ status: 500, msg: 'Login Error', type: 'error' });
  }
}