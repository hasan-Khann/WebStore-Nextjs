import { sql } from "@/lib/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const slug = new URL(request.url).searchParams.get("slug");
    if (!slug)
      return NextResponse.json({ type: "error", msg: "Slug required" }, { status: 400 });

    const [row] = await sql`
      SELECT
        p.id          AS "productId",
        p.name,
        p.description,
        variants.data AS variants,
        gallery.data  AS gallery
      FROM products p

      -- variants: one lateral pass over product_variants
      LEFT JOIN LATERAL (
        SELECT jsonb_agg(
          jsonb_build_object(
            '_id',      pv.id,
            'color',    pv.color,
            'size',     pv.size,
            'price',    pv.price,
            'discount', pv.discount,
            'stock',    pv.stock,
            'sku',      pv.sku
          ) ORDER BY pv.created_at ASC
        ) AS data
        FROM product_variants pv
        WHERE pv.product_id = p.id
          AND pv.deleted_at IS NULL
      ) variants ON true

      -- gallery: deduplicate in a derived table, then aggregate
      LEFT JOIN LATERAL (
        SELECT jsonb_agg(jsonb_build_object('secure_url', sq.secure_url)) AS data
        FROM (
          SELECT DISTINCT m.secure_url
          FROM product_variants pv
          JOIN variant_images vi ON vi.variant_id = pv.id
          JOIN media           m  ON m.id          = vi.media_id
          WHERE pv.product_id = p.id
            AND pv.deleted_at IS NULL
        ) sq
      ) gallery ON true

      WHERE p.slug      = ${slug}
        AND p.deleted_at IS NULL
      LIMIT 1
    `;

    if (!row)
      return NextResponse.json({ type: "error", msg: "Not found" }, { status: 404 });

    const data = {
      ...row,
      variants: row.variants ?? [],
      gallery:  row.gallery  ?? [],
    };

    return NextResponse.json({ type: "success", source: "database", data });
  } catch (err) {
    console.error("PRODUCT_API_ERROR:", err);
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}