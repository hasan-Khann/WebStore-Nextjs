import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User.models";

const generateAccessAndRefreshToken = async (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

export async function GET(req) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    if (!code) return NextResponse.redirect("/auth/login?error=no_code");

    // Get access token from Facebook
    const tokenUrl =
      "https://graph.facebook.com/v17.0/oauth/access_token?" +
      new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/facebook/callback`,
        code,
      });

    const tokenData = await (await fetch(tokenUrl)).json();

    if (!tokenData.access_token) return NextResponse.redirect("/auth/login?error=invalid_token");

    // Get user profile
    const profile = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokenData.access_token}`
    ).then((r) => r.json());

    if (!profile.email) return NextResponse.redirect("/auth/login?error=no_email");

    await connectDB();

    let user = await User.findOne({ email: profile.email });
    if (!user) {
      user = await User.create({
        name: profile.name,
        email: profile.email,
        provider: "facebook",
      });
    }

    const { accessToken } = await generateAccessAndRefreshToken(user);

    const res = NextResponse.json({
      status: 200,
      msg: "Login successful",
      type: "success",
      data: {
        username: user.username,
        phone: user.phone,
        address: user.address || null,
      },
      redirectTo: "/admin",
    });

    res.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.redirect("/auth/login?error=server_error");
  }
}
