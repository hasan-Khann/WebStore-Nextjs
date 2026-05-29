import { NextResponse } from "next/server";
import { sql } from "@/lib/sql";
import { isAuthentic } from "@/utils/role";

export async function GET(request) {
  try {
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const start = parseInt(searchParams.get("start") || "0", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);
    const filters = JSON.parse(searchParams.get("filters") || "[]");
    const globalFilter = searchParams.get("globalFilter") || "";
    const sorting = JSON.parse(searchParams.get("sorting") || "[]");
    const deleteType = searchParams.get("deleteType") || "SD";

    const codeFilter = filters.find(f => f.id === "code")?.value || "";
    const discountFilter = filters.find(f => f.id === "discountPercentage")?.value || "";
    const amountFilter = filters.find(f => f.id === "minShoppingAmount")?.value || "";

    const sortMapping = {
      code: "code",
      discountPercentage: "discount_percentage",
      minShoppingAmount: "min_shopping_amount",
      createdAt: "created_at",
    };
    const sortField = sortMapping[sorting[0]?.id] || "created_at";
    const sortDir = sorting[0]?.desc ? sql`DESC` : sql`ASC`;

    const [data, [{ total_count }]] = await Promise.all([
      sql`
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
          updated_at AS "updatedAt",
          deleted_at AS "deletedAt"
        FROM coupons
        WHERE 
          (
            (${deleteType} = 'SD' AND deleted_at IS NULL) OR 
            (${deleteType} = 'PD' AND deleted_at IS NOT NULL) OR
            (${deleteType} NOT IN ('SD', 'PD'))
          )
          AND (
            ${globalFilter} = '' OR 
            code ILIKE ${'%' + globalFilter + '%'} OR 
            CAST(discount_percentage AS TEXT) ILIKE ${'%' + globalFilter + '%'} OR 
            CAST(min_shopping_amount AS TEXT) ILIKE ${'%' + globalFilter + '%'}
          )
          AND (${codeFilter} = '' OR code ILIKE ${'%' + codeFilter + '%'})
          AND (${discountFilter} = '' OR CAST(discount_percentage AS TEXT) = ${discountFilter})
          AND (${amountFilter} = '' OR CAST(min_shopping_amount AS TEXT) = ${amountFilter})
        ORDER BY ${sql(sortField)} ${sortDir}
        LIMIT ${size} OFFSET ${start}
      `,
    
      sql`
        SELECT COUNT(*)::int AS total_count
        FROM coupons
        WHERE 
          (
            (${deleteType} = 'SD' AND deleted_at IS NULL) OR 
            (${deleteType} = 'PD' AND deleted_at IS NOT NULL) OR
            (${deleteType} NOT IN ('SD', 'PD'))
          )
          AND (
            ${globalFilter} = '' OR 
            code ILIKE ${'%' + globalFilter + '%'} OR 
            CAST(discount_percentage AS TEXT) ILIKE ${'%' + globalFilter + '%'} OR 
            CAST(min_shopping_amount AS TEXT) ILIKE ${'%' + globalFilter + '%'}
          )
          AND (${codeFilter} = '' OR code ILIKE ${'%' + codeFilter + '%'})
          AND (${discountFilter} = '' OR CAST(discount_percentage AS TEXT) = ${discountFilter})
          AND (${amountFilter} = '' OR CAST(min_shopping_amount AS TEXT) = ${amountFilter})
      `
    ]);

    return NextResponse.json({ type: "success", data, meta: { totalRowCount: total_count } });
  } catch (err) {
    console.error("GET MAIN COUPONS ERROR:", err);
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const { code, discountPercentage = 0, minShoppingAmount = 0 } = await request.json();

    if (!code) return NextResponse.json({ type: "error", msg: "Code is required" }, { status: 400 });

    const cleanCode = code.trim().toUpperCase();

    const [existing] = await sql`
      SELECT id FROM coupons WHERE code = ${cleanCode} LIMIT 1
    `;
    if (existing) return NextResponse.json({ type: "error", msg: "Coupon already exists" }, { status: 409 });

    const defaultExpiry = new Date();
    defaultExpiry.setMonth(defaultExpiry.getMonth() + 1);

    const [coupon] = await sql`
      INSERT INTO coupons (code, discount_percentage, min_shopping_amount, expiry)
      VALUES (${cleanCode}, ${discountPercentage}, ${minShoppingAmount}, ${defaultExpiry})
      RETURNING 
        id AS "_id", 
        code, 
        discount_percentage AS "discountPercentage", 
        min_shopping_amount AS "minShoppingAmount", 
        expiry, 
        created_at AS "createdAt", 
        updated_at AS "updatedAt"
    `;

    return NextResponse.json({ type: "success", msg: "Coupon created", data: coupon }, { status: 201 });
  } catch (err) {
    console.error("POST COUPON ERROR:", err);
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}