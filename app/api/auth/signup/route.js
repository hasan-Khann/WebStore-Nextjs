import { NextResponse } from 'next/server';
import { sql } from '@/lib/sql';
import { hashPassword } from '@/utils/auth';
import jwt from 'jsonwebtoken';
import { sendEmail } from '@/lib/nodemailer';

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();

    if (!username?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({ msg: 'All fields are required' }, { status: 400 });
    }

    const [existing] = await sql`SELECT id FROM users WHERE email = ${email} OR username = ${username} LIMIT 1`;
    if (existing) {
      return NextResponse.json({ msg: 'User or Email already exists' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await sql`
      INSERT INTO otps (email, otp, attempts, expires_at)
      VALUES (${email}, ${otpCode}, 0, ${expiresAt})
      ON CONFLICT (email) DO UPDATE SET otp = EXCLUDED.otp, attempts = 0, expires_at = EXCLUDED.expires_at
    `;
    
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const pendingToken = jwt.sign(
      { username, email, hashedPassword },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const res = NextResponse.json({ msg: 'OTP sent to email', type: 'success' }, { status: 200 });

    res.cookies.set('pending_user', pendingToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 900,
    });

    await sendEmail(
      {
        to: email,
        subject: 'Your Password Reset OTP',
        code: otpCode
      }
    );

    return res;
  } catch (error) {
    console.error("SIGNUP_POST_ERROR:", error);
    return NextResponse.json({ msg: 'Internal Server Error' }, { status: 500 });
  }
}