import { NextResponse } from "next/server";
import { generateAccessToken, generateRefreshToken } from "@/utils/auth";
import { sql } from "@/lib/sql";

export async function GET(req) {
  const code = req.nextUrl.searchParams.get("code");

  // Exchange code → tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`,
      grant_type: "authorization_code"
    })
  });

  const tokenData = await tokenRes.json();

  const profile = await fetch(
    "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
    { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
  ).then(r => r.json());

  const [user] = await sql`
    INSERT INTO users (username, email, password, role, login_method)
    VALUES (${profile.name}, ${profile.email}, NULL, 'admin', 'google')
    ON CONFLICT (email) DO UPDATE 
    SET email = EXCLUDED.email
    RETURNING id, username, email, role
  `;

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  await sql`UPDATE users SET refresh_token = ${refreshToken} WHERE id = ${user.id}`;

  const res = NextResponse.json({
    status: 200,
    msg: "Login successful",
    type: "success",
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    },
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL},`
  });

  res.cookies.set('accessToken', accessToken, { httpOnly: true, path: '/', maxAge: 900 });
  res.cookies.set('refreshToken', refreshToken, { httpOnly: true, path: '/', maxAge: 2592000 });

  return res;
}