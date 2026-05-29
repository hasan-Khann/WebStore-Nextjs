import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Variant } from "@/models";

export async function POST(req) {
  try {
    await connectDB();
    const { cart } = await req.json();

    const verified = await Promise.all(
      cart.map(async (c) => {
        const variant = await Variant.findById(c.variantId || c.id);
        if (!variant) return null;
        return {
          variantId: variant._id,
          name: variant.name,
          price: variant.price,
          media: variant.media,
          quantity: c.quantity,
          total: variant.price * c.quantity
        };
      })
    );

    return NextResponse.json({ type: "success", data: verified.filter(Boolean) });
  } catch (err) {
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}