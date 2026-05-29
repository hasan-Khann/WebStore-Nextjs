import { sql } from "@/lib/sql";
import { isAuthentic } from "@/utils/role";
import { NextResponse } from "next/server";


export async function PUT(request) {
  try {
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const { _id, alt, title } = await request.json();

    const [updatedMedia] = await sql`
      UPDATE media 
      SET alt = ${alt}, title = ${title}, updated_at = NOW() 
      WHERE id = ${_id} 
      RETURNING id as _id, alt, title
    `;

    if (!updatedMedia) {
      return NextResponse.json({ type: "error", msg: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({
      type: "success",
      title: "Metadata Synced",
      msg: "Image SEO details updated successfully",
    });
  } catch (error) {
    return NextResponse.json({ type: "error", msg: "Database sync failed" }, { status: 500 });
  }
}