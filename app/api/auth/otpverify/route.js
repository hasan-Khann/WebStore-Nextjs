import { NextResponse } from 'next/server';
import { sql } from '@/lib/sql';
import { generateAccessToken, generateRefreshToken } from '@/utils/auth';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    await sql`DELETE FROM otps WHERE expires_at < CURRENT_TIMESTAMP`;

    const { otp, email } = await request.json();
    const [otpDoc] = await sql`SELECT * FROM otps WHERE email = ${email} LIMIT 1`;

    if (!otpDoc) return NextResponse.json({ status: 404, msg: 'OTP expired', type: 'error' });

    if (otpDoc.otp !== otp) {
      await sql`UPDATE otps SET attempts = attempts + 1 WHERE email = ${email}`;
      return NextResponse.json({ status: 400, msg: 'Invalid code', type: 'error' });
    }

    const pendingToken = request.cookies.get('pending_user')?.value;
    if (!pendingToken) return NextResponse.json({ status: 400, msg: 'Session expired', type: 'error' });

    const decoded = jwt.verify(pendingToken, process.env.JWT_SECRET);
    
    const [user] = await sql`
      INSERT INTO users (username, email, password, role, is_verified)
      VALUES (${decoded.username}, ${decoded.email}, ${decoded.hashedPassword}, 'admin', true)
      RETURNING id, username, email, role
    `;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await sql`UPDATE users SET refresh_token = ${refreshToken} WHERE id = ${user.id}`;
    await sql`DELETE FROM otps WHERE email = ${email}`;

    const res = NextResponse.json({ status: 200, msg: 'Verified!', type: 'success', user });
    res.cookies.set('accessToken', accessToken, { httpOnly: true, path: '/', maxAge: 900 });
    res.cookies.set('refreshToken', refreshToken, { httpOnly: true, path: '/', maxAge: 2592000 });
    res.cookies.delete('pending_user');
    return res;
  } catch (err) {
    return NextResponse.json({ status: 400, msg: 'Invalid session', type: 'error' });
  }
}