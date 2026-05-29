import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { isAuthentic } from "@/utils/role";

if (!process.env.NEON_URL) throw new Error('DATABASE_URL is not defined');
const sql = neon(process.env.NEON_URL);

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json({ type: "error", msg: "Invalid ID" }, { status: 400 });
    }

    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const variant = await sql`
      SELECT 
        pv.id AS "_id", pv.product_id AS product, pv.size, pv.color, 
        pv.price, pv.discount, pv.sku, pv.stock,
        pv.created_at AS "createdAt", pv.updated_at AS "updatedAt",
        COALESCE(
          (
            SELECT json_agg(json_build_object(
              '_id', m.id,
              'secure_url', m.secure_url,
              'url', m.secure_url
            ))
            FROM variant_images vi
            JOIN media m ON vi.media_id = m.id
            WHERE vi.variant_id = pv.id AND m.deleted_at IS NULL
          ), '[]'::json
        ) AS "mediaData"
      FROM product_variants pv
      WHERE pv.id = ${id}
      LIMIT 1
    `;

    if (!variant.length) {
      return NextResponse.json({ type: "error", msg: "Variant not found" }, { status: 404 });
    }

    return NextResponse.json({ type: "success", data: variant[0] });
  } catch (err) {
    console.error("GET_VARIANT_ERROR:", err);
    return NextResponse.json({ type: "error", msg: "Server Error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id || id.length !== 36) return NextResponse.json({ type: "error", msg: "Invalid ID" }, { status: 400 });

    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const { productId, size, color, price, discount, sku, stock, media } = await request.json();

    if (!sku || !size || !productId) {
      return NextResponse.json({ type: "error", msg: "Missing SKU, Size or Product Reference" }, { status: 400 });
    }

    const mediaArray = Array.isArray(media) ? media : [];

    const updated = await sql`
      UPDATE product_variants 
      SET 
        product_id = ${productId}, size = ${size}, color = ${color}, 
        price = ${Number(price) || 0}, discount = ${Number(discount) || 0}, 
        sku = ${sku}, stock = ${Number(stock) || 0}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id AS "_id", product_id AS product, size, color, price, discount, sku, stock
    `;

    if (!updated.length) return NextResponse.json({ type: "error", msg: "Variant not found" }, { status: 404 });

    await sql`DELETE FROM variant_images WHERE variant_id = ${id}`;

    if (mediaArray.length > 0) {
      await sql`
        INSERT INTO variant_images (variant_id, media_id) 
        SELECT ${id}, unnest(${mediaArray}::uuid[])
      `;
    }
    return NextResponse.json({ type: "success", msg: "Variant updated", data: updated[0] });
  } catch (err) {
    if (err.code === '23505') return NextResponse.json({ type: "error", msg: "SKU already exists" }, { status: 400 });
    console.error("UPDATE_VARIANT_ERROR:", err);
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!id || id.length !== 36) return NextResponse.json({ type: "error", msg: "Invalid ID" }, { status: 400 });

    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const deleted = await sql`DELETE FROM product_variants WHERE id = ${id} RETURNING id`;
    
    if (!deleted.length) return NextResponse.json({ type: "error", msg: "Variant not found" }, { status: 404 });

    return NextResponse.json({ type: "success", msg: "Variant permanently deleted" });
  } catch (err) {
    console.error("DELETE_VARIANT_ERROR:", err);
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}