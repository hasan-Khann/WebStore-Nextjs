import { sql } from "@/lib/sql";
import { isAuthentic } from "@/utils/role";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const products = await sql`
      SELECT 
        p.id AS "_id", 
        p.name, 
        p.slug, 
        p.starting_price AS "startingPrice",
        p.created_at AS "createdAt",
        json_build_object('_id', c.id, 'name', c.name) AS category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.deleted_at IS NULL
      ORDER BY p.created_at DESC
    `;

    return NextResponse.json({ type: "success", data: products });
  } catch (err) {
    console.error("GET products error:", err);
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}