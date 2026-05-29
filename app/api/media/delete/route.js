import { sql } from "@/lib/sql";
import { NextResponse } from "next/server";
import { isAuthentic } from "@/utils/role";

export async function PUT(req) {
  try {
    const auth = await isAuthentic("admin", req);
    if (!auth.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const { Ids, deleteType } = await req.json();

    const result = await sql`
      UPDATE media 
      SET deleted_at = ${deleteType === "SD" ? sql`NOW()` : null} 
      WHERE id = ANY(${Ids})
      RETURNING id
    `;

    return NextResponse.json({ 
      type: "success", 
      msg: deleteType === "SD" ? `${result.length} items moved to trash` : "Items restored" 
    });
  } catch (error) {
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}