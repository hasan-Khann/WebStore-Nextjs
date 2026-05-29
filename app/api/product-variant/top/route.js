
import { sql } from "@/lib/sql";
import { NextResponse } from "next/server";


// const CACHE_KEY = "analytics:top_variants";
// const CACHE_TTL = 600;


export async function GET() {
  try {
    // try {
    //   const cachedData = await redis.get(CACHE_KEY);
    //   if (cachedData) return NextResponse.json({ source: "cache", data: typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData });
    // } catch (redisErr) {}

    const topVariants = await sql`
  SELECT 
    pv.id AS "variantId",
    p.name AS "productName",
    pv.sku AS "variantSku",
    pv.stock,
    pv.color,
    p.slug,
    pv.price,
    SUM(oi.quantity) AS "salesCount",
    SUM(oi.price * oi.quantity) AS "revenue",
    COALESCE(
      (
        SELECT json_agg(m.secure_url)
        FROM variant_images vi
        JOIN media m ON vi.media_id = m.id
        WHERE vi.variant_id = pv.id
      ), '[]'::json
    ) AS media
  FROM order_items oi
  INNER JOIN orders o ON oi.order_id = o.id
  INNER JOIN product_variants pv ON oi.variant_id = pv.id
  INNER JOIN products p ON pv.product_id = p.id
  WHERE o.order_status != 'cancelled' 
    AND o.payment_status = 'paid'
  GROUP BY pv.id, p.id
  ORDER BY "salesCount" DESC
  LIMIT 10
`;

    // try { await redis.set(CACHE_KEY, JSON.stringify(topVariants), { ex: CACHE_TTL }); } catch (e) {}

    return NextResponse.json({ source: "database", data: topVariants });
  } catch (error) {
    console.error("TOP_VARIANTS_ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}