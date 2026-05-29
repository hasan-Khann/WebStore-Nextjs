import { NextResponse } from 'next/server';
import { sql } from '@/lib/sql';
import { hashPassword, generateAccessToken, generateRefreshToken } from '@/utils/auth';

export async function POST(request) {
  try {
    await sql`DELETE FROM otps WHERE expires_at < CURRENT_TIMESTAMP`;

    const { otp, email, password } = await request.json();
    const [otpDoc] = await sql`SELECT * FROM otps WHERE email = ${email} LIMIT 1`;

    if (!otpDoc) return NextResponse.json({ status: 404, msg: 'OTP not found', type: 'error' });

    if (otpDoc.otp !== otp) {
      await sql`UPDATE otps SET attempts = attempts + 1 WHERE email = ${email}`;
      return NextResponse.json({ status: 400, msg: 'Invalid OTP', type: 'error' });
    }

    const newHashedPassword = await hashPassword(password);

    const [user] = await sql`
      UPDATE users 
      SET password = ${newHashedPassword}, is_verified = true, updated_at = CURRENT_TIMESTAMP
      WHERE email = ${email}
      RETURNING id, username, email, role
    `;

    if (!user) return NextResponse.json({ status: 404, msg: 'User not found', type: 'error' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await sql`UPDATE users SET refresh_token = ${refreshToken} WHERE id = ${user.id}`;
    await sql`DELETE FROM otps WHERE email = ${email}`;

    const res = NextResponse.json({ status: 200, msg: 'Password reset successful', type: 'success', user });
    res.cookies.set('accessToken', accessToken, { httpOnly: true, path: '/', maxAge: 900 });
    res.cookies.set('refreshToken', refreshToken, { httpOnly: true, path: '/', maxAge: 2592000 });

    return res;
  } catch (error) {
    return NextResponse.json({ status: 500, msg: 'Internal Error', type: 'error' });
  }
}