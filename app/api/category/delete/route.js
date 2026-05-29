import { redis } from "@/lib/rediscache";
import { sql } from "@/lib/sql";
import { isAuthentic } from "@/utils/role";
import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const { Ids, deleteType } = await request.json();
    if (!Array.isArray(Ids) || Ids.length === 0) {
      return NextResponse.json({ type: "error", msg: "No valid IDs provided" }, { status: 400 });
    }

    let result;
    if (deleteType === "SD") {
      result = await sql`UPDATE categories SET deleted_at = NOW() WHERE id = ANY(${Ids}) RETURNING id`;
    } else if (deleteType === "RSD") {
      result = await sql`UPDATE categories SET deleted_at = NULL WHERE id = ANY(${Ids}) RETURNING id`;
    } else if (deleteType === "PD") {
      result = await sql`DELETE FROM categories WHERE id = ANY(${Ids}) RETURNING id`;
    } else {
      return NextResponse.json({ type: "error", msg: "Invalid delete type" }, { status: 400 });
    }

    const msg = deleteType === "SD" ? `${result.length} items moved to trash` : 
                deleteType === "RSD" ? "Items restored" : "Operation successful";

    // await Promise.all([redis.del("categories:all"), redis.del("categories:export:all")]);

    return NextResponse.json({ type: "success", msg });
  } catch (err) {
    console.error("BULK_ROUTE_ERROR:", err);
    return NextResponse.json({ type: "error", msg: "Internal Server Error" }, { status: 500 });
  }
}