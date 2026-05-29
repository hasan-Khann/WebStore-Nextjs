import { NextResponse } from "next/server";
import { sql } from "@/lib/sql";
import { isAuthentic } from "@/utils/role";
import { redis } from "@/lib/rediscache";

export async function GET(request) {
  try {
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    // redis
    // const cacheKey = "categories:export:all";
    // const cachedData = await redis.get(cacheKey);

    // if (cachedData) {
    //   return NextResponse.json({ type: "success", source: "cache", data: JSON.parse(cachedData) });
    // }

    const categories = await sql`
      SELECT c.id as _id, c.name, c.slug, c.created_at, m.secure_url as img_url
      FROM categories c
      LEFT JOIN media m ON c.img_id = m.id
      WHERE c.deleted_at IS NULL
      ORDER BY c.created_at DESC
    `;

    if (categories.length > 0) {
      await redis.set(cacheKey, JSON.stringify(categories), { ex: 3600 });
    }

    return NextResponse.json({ type: "success", source: "database", data: categories });
  } catch (err) {
    console.error("Export Error:", err);
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}