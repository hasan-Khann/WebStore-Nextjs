import { NextResponse } from 'next/server';
import { sql } from '@/lib/sql';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      await sql`
        UPDATE users
        SET refresh_token = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${decoded.id}
      `;
    } catch {
    }
  }

  const response = NextResponse.json({ status: 200, msg: 'User logged out!', type: 'success' });

  const clearOptions = { httpOnly: true, sameSite: 'strict', path: '/', expires: new Date(0) };
  response.cookies.set('refreshToken', '', clearOptions);
  response.cookies.set('accessToken',  '', clearOptions);

  return response;
}