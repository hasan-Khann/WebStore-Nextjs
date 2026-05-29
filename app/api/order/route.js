import { NextResponse } from "next/server";
import { sql } from "@/lib/sql";
import { isAuthentic } from "@/utils/role";

export async function GET(request) {
  try {
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const start = parseInt(searchParams.get("start") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    
    const globalFilter = searchParams.get("globalFilter") || "";
    const filterPattern = `%${globalFilter}%`;

    const data = await sql`
      SELECT 
        id AS "_id", order_number AS "orderNumber", customer_full_name AS "customerFullName",
        customer_email AS "customerEmail", total, payment_method AS "paymentMethod",
        payment_status AS "paymentStatus", order_status AS "orderStatus", created_at AS "createdAt"
      FROM orders
      WHERE 
        order_number ILIKE ${filterPattern} OR 
        customer_full_name ILIKE ${filterPattern} OR 
        customer_email ILIKE ${filterPattern}
      ORDER BY created_at DESC
      LIMIT ${size} OFFSET ${start}
    `;

    const totalRes = await sql`
      SELECT COUNT(*)::int as count 
      FROM orders 
      WHERE 
        order_number ILIKE ${filterPattern} OR 
        customer_full_name ILIKE ${filterPattern} OR 
        customer_email ILIKE ${filterPattern}
    `;

    return NextResponse.json({ 
      type: "success", 
      data, 
      meta: { totalRowCount: totalRes[0].count } 
    });
  } catch (err) {
    console.error("Admin Fetch Error:", err);
    return NextResponse.json({ type: "error", msg: "Fetch failed" }, { status: 500 });
  }
}