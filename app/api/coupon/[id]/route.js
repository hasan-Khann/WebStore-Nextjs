import { NextResponse } from "next/server";
import { sql } from "@/lib/sql";
import { isAuthentic } from "@/utils/role";

const isValidUUID = (id) => 
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    if (!id || !isValidUUID(id)) {
      return NextResponse.json({ type: "error", msg: "Invalid ID" }, { status: 400 });
    }

    const [coupon] = await sql`
      SELECT 
        id AS "_id", 
        code, 
        discount_percentage AS "discountPercentage", 
        min_shopping_amount AS "minShoppingAmount", 
        expiry, 
        max_redemptions AS "maxRedemptions",
        redeemed_count AS "redeemedCount",
        is_active AS "isActive",
        created_at AS "createdAt", 
        updated_at AS "updatedAt"
      FROM coupons 
      WHERE id = ${id}
    `;

    if (!coupon) return NextResponse.json({ type: "error", msg: "Not found" }, { status: 404 });

    return NextResponse.json({ type: "success", data: coupon });
  } catch (err) {
    console.error("GET COUPON ERROR:", err);
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const { code, discountPercentage, minShoppingAmount } = await request.json();

    if (!code || !isValidUUID(id)) {
      return NextResponse.json({ type: "error", msg: "Missing fields or invalid ID" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const [existing] = await sql`
      SELECT id FROM coupons WHERE code = ${cleanCode} AND id != ${id} LIMIT 1
    `;
    if (existing) return NextResponse.json({ type: "error", msg: "Code already exists" }, { status: 409 });

    const [updated] = await sql`
      UPDATE coupons 
      SET 
        code = ${cleanCode}, 
        discount_percentage = ${discountPercentage}, 
        min_shopping_amount = ${minShoppingAmount},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING 
        id AS "_id", 
        code, 
        discount_percentage AS "discountPercentage", 
        min_shopping_amount AS "minShoppingAmount",
        created_at AS "createdAt", 
        updated_at AS "updatedAt"
    `;

    return NextResponse.json({ type: "success", msg: "Coupon updated", data: updated });
  } catch (err) {
    console.error("PUT COUPON ERROR:", err);
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    if (!isValidUUID(id)) return NextResponse.json({ type: "error", msg: "Invalid ID" }, { status: 400 });

    const result = await sql`DELETE FROM coupons WHERE id = ${id} RETURNING id`;
    
    if (result.length === 0) return NextResponse.json({ type: "error", msg: "Not found" }, { status: 404 });

    return NextResponse.json({ type: "success", msg: "Coupon deleted permanently" });
  } catch (err) {
    console.error("DELETE COUPON ERROR:", err);
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}