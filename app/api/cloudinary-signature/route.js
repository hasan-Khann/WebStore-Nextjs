import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { paramsToSign } = await req.json();

    if (!paramsToSign) {
      return NextResponse.json({ error: "No parameters to sign" }, { status: 400 });
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json({ signature });
  } catch (error) {
    console.error("[SIGN_ERROR]:", error);
    return NextResponse.json({ error: "Signature failed" }, { status: 500 });
  }
}