import { sql } from "@/lib/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");
    if (!slug) return NextResponse.json({ type: "error", msg: "Slug required" }, { status: 400 });

    // const cacheKey = `productP:${slug}`; 
    // try {
    //   const cached = await redis.get(cacheKey);
    //   if (cached) return NextResponse.json({ type: "success", source: "cache", data: JSON.parse(cached) });
    // } catch (e) {}

    const [result] = await sql`
      SELECT product_data FROM mv_product_page_details WHERE slug = ${slug} LIMIT 1
    `;

    if (!result) return NextResponse.json({ type: "error", msg: "Not found" }, { status: 404 });

    const data = result.product_data;
    // try { await redis.set(cacheKey, JSON.stringify(data), { ex: 3600 }); } catch (e) {}

    return NextResponse.json({ type: "success", source: "database", data });
  } catch (err) {
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}