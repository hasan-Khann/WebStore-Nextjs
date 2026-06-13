import { NextResponse } from "next/server";
import { generateAccessToken, generateRefreshToken } from "@/utils/auth";
import { sql } from "@/lib/sql";

export async function GET(req) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const code = req.nextUrl.searchParams.get("code");
    if (!code) {
      return NextResponse.redirect(new URL("/auth/login?error=no_code", baseUrl));
    }

    const tokenUrl =
      "https://graph.facebook.com/v17.0/oauth/access_token?" +
      new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_CLIENT_SECRET,
        redirect_uri: `${baseUrl}/api/auth/facebook/callback`,
        code,
      });

    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL("/auth/login?error=invalid_token", baseUrl));
    }

    const profile = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokenData.access_token}`
    ).then((r) => r.json());

    if (!profile.email) {
      return NextResponse.redirect(new URL("/auth/login?error=no_email", baseUrl));
    }

    const [user] = await sql`
        INSERT INTO users (username, email, password, role, login_method)
        VALUES (${profile.name}, ${profile.email}, NULL, 'admin', 'facebook')
        ON CONFLICT (email) DO UPDATE 
        SET email = EXCLUDED.email
        RETURNING id, username, email, role
      `;
    
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    await sql`UPDATE users SET refresh_token = ${refreshToken} WHERE id = ${user.id}`;
  
    const res = NextResponse.redirect(new URL("/", baseUrl));
  
    res.cookies.set('accessToken', accessToken, { httpOnly: true, path: '/', maxAge: 900, secure: process.env.NODE_ENV === 'production' });
    res.cookies.set('refreshToken', refreshToken, { httpOnly: true, path: '/', maxAge: 2592000, secure: process.env.NODE_ENV === 'production' });
  
    return res;

  } catch (error) {
    console.error("Facebook auth error:", error);
    return NextResponse.redirect(new URL("/auth/login?error=server_error", baseUrl));
  }
}