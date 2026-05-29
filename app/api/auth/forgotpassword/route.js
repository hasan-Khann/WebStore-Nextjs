import { NextResponse } from 'next/server';
import { sql } from '@/lib/sql';
import { sendEmail } from '@/lib/nodemailer';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ status: 400, msg: 'Email is required', type: 'error' });
    }

    const [userExists] = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `;

    if (!userExists) {
      return NextResponse.json({ status: 404, msg: 'No account found with this email', type: 'error' });
    }

    const otpCode  = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await sql`DELETE FROM otps WHERE expires_at < NOW()`;

    await sql`
      INSERT INTO otps (email, otp, attempts, expires_at)
      VALUES (${email}, ${otpCode}, 0, ${expiresAt})
      ON CONFLICT (email) DO UPDATE
        SET otp        = EXCLUDED.otp,
            attempts   = 0,
            expires_at = EXCLUDED.expires_at,
            created_at = CURRENT_TIMESTAMP
    `;

    await sendEmail(
      { 
        to: email,
        subject: 'Your Password Reset OTP',
        code: otpCode
      }
    );

    return NextResponse.json({ status: 200, msg: 'Verification code sent to your email', type: 'success' });

  } catch (error) {
    console.error('FORGOT_PASSWORD_ERROR:', error);
    return NextResponse.json({ status: 500, msg: 'Internal Server Error', type: 'error' });
  }
}