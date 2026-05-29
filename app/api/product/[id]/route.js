import { NextResponse } from "next/server";
import { isAuthentic } from "@/utils/role";
import { sql } from "@/lib/sql";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!id || id.length !== 36) {
      return NextResponse.json({ type: "error", msg: "Invalid ID" }, { status: 400 });
    }

    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const products = await sql`
      SELECT 
        p.id AS "_id", p.name, p.slug, p.description, 
        p.starting_price AS "startingPrice", 
        p.category_id AS "category",
        p.created_at AS "createdAt",
        COALESCE(
          (SELECT json_agg(json_build_object(
            '_id', pv.id,
            'color', pv.color,
            'size', pv.size,
            'price', pv.price,
            'discount', pv.discount,
            'sku', pv.sku,
            'stock', pv.stock
          )) FROM product_variants pv WHERE pv.product_id = p.id AND pv.deleted_at IS NULL),
          '[]'
        ) AS variants
      FROM products p
      WHERE p.id = ${id} AND p.deleted_at IS NULL
      LIMIT 1
    `;

    if (products.length === 0) {
      return NextResponse.json({ type: "error", msg: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ type: "success", data: products[0] });
  } catch (err) {
    return NextResponse.json({ type: "error", msg: "Server Error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const { name, slug, category, description, startingPrice } = await request.json();

    const [updated] = await sql`
      UPDATE products 
      SET 
        name = ${name}, 
        slug = ${slug}, 
        category_id = ${category}, -- Use 'category' here
        description = ${description}, 
        starting_price = ${startingPrice || 0}, 
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id AS "_id", name, slug, description, starting_price AS "startingPrice"
    `;

    if (!updated) return NextResponse.json({ type: "error", msg: "Product not found" }, { status: 404 });

    return NextResponse.json({ type: "success", msg: "Product updated", data: updated });
  } catch (err) {
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const [deleted] = await sql`DELETE FROM products WHERE id = ${id} RETURNING id`;

    if (!deleted) return NextResponse.json({ type: "error", msg: "Not found" }, { status: 404 });

    return NextResponse.json({ type: "success", msg: "Permanently deleted with variants" });
  } catch (err) {
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}