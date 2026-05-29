import { sql } from "@/lib/sql";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // redis
    // const cacheKey = "categories:all";
    // const cached = await redis.get(cacheKey);

    // if (cached) {
    //   try {
    //     const parsedData = typeof cached === "string" ? JSON.parse(cached) : cached;
    //     if (parsedData && parsedData !== "[object Object]") {
    //       return NextResponse.json(parsedData);
    //     }
    //   } catch (parseError) {
    //     console.warn("Redis cache corrupted, fetching fresh data...");
    //   }
    // } 
    
    const categories = await sql`
      SELECT 
        id as _id, 
        name, 
        slug, 
        img_id as img, 
        created_at as "createdAt", 
        updated_at as "updatedAt", 
        deleted_at as "deletedAt"
      FROM categories 
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `;

    const data = { 
      type: "success", 
      count: categories.length, 
      data: categories.map(cat => ({
        ...cat,
        _id: cat._id.toString(),
        img: cat.img ? cat.img.toString() : null 
      }))
    };

    // await redis.set(cacheKey, JSON.stringify(data), { ex: 3600 });
    return NextResponse.json(data);

  } catch (err) {
    console.error("GET categories error:", err);
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}