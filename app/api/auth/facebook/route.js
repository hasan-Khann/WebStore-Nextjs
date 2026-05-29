
export async function GET() {
  const root = "https://www.facebook.com/v19.0/dialog/oauth";

  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID,
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/facebook/callback`,
    scope: "email public_profile",
    response_type: "code",
  });

  return Response.redirect(`${root}?${params.toString()}`);
}