import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Coupon } from "@/models";

export async function POST(req) {
  try {
    await connectDB();
    const { code } = await req.json();
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) return NextResponse.json({ type: "error", msg: "Invalid coupon" });
    if (new Date(coupon.validity) < new Date()) 
      return NextResponse.json({ type: "error", msg: "Coupon expired" });

    return NextResponse.json({ type: "success", data: { percent: coupon.percent } });
  } catch (err) {
    return NextResponse.json({ type: "error", msg: "Validation failed" });
  }
}
