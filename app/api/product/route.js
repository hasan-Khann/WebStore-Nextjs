import { NextResponse } from "next/server";
import { sql } from "@/lib/sql";
import { isAuthentic } from "@/utils/role";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const start = parseInt(searchParams.get("start") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const globalFilter = searchParams.get("globalFilter") || "";
    const deleteType = searchParams.get("deleteType") || "SD";

    const filterPattern = `%${globalFilter}%`;
    const rows = await sql`
      SELECT 
        p.id AS "_id", p.name, p.slug, p.description, p.starting_price AS "startingPrice",
        p.created_at AS "createdAt", p.deleted_at AS "deletedAt",
        json_build_object('_id', c.id, 'name', c.name, 'slug', c.slug) AS category,
        COUNT(*) OVER() as total_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 
        ((${deleteType} = 'SD' AND p.deleted_at IS NULL) OR (${deleteType} != 'SD' AND p.deleted_at IS NOT NULL))
        AND (${globalFilter} = '' OR p.name ILIKE ${filterPattern} OR p.slug ILIKE ${filterPattern})
      ORDER BY p.created_at DESC
      LIMIT ${size} OFFSET ${start}
    `;

    const totalRowCount = rows.length > 0 ? parseInt(rows[0].total_count) : 0;

    return NextResponse.json({ type: "success", data: rows, meta: { totalRowCount } });
  } catch (err) {
    return NextResponse.json({ type: "error", msg: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const { name, slug, category, description, startingPrice } = await request.json();

    const [product] = await sql`
      INSERT INTO products (name, slug, category_id, description, starting_price)
      VALUES (${name}, ${slug}, ${category}, ${description}, ${startingPrice || 0})
      RETURNING id AS "_id", name, slug, description, starting_price AS "startingPrice"
    `;

    return NextResponse.json({ type: "success", msg: "Created", data: product }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}