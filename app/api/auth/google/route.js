export async function GET() {
  const root = "https://accounts.google.com/o/oauth2/v2/auth";

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    prompt: "consent",
    access_type: "offline"
  });

  return Response.redirect(`${root}?${params.toString()}`);
}

