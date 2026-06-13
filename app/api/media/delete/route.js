import { sql } from "@/lib/sql";
import { NextResponse } from "next/server";
import { isAuthentic } from "@/utils/role";

export async function DELETE(req) {
  try {
    const auth = await isAuthentic("admin", req);
    if (!auth.isAuth) {
      return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });
    }

    const { Ids, deleteType } = await req.json();

    if (!Ids || !Array.isArray(Ids) || Ids.length === 0) {
      return NextResponse.json({ type: "error", msg: "No asset IDs provided" }, { status: 400 });
    }

    let result;
    let successMessage = "";

    if (deleteType === "SD") {
      result = await sql`
        UPDATE media 
        SET deleted_at = NOW() 
        WHERE id = ANY(${Ids})
        RETURNING id
      `;
      successMessage = `${result.length} items moved to trash`;
    } else if (deleteType === "PD") {
      result = await sql`
        DELETE FROM media 
        WHERE id = ANY(${Ids})
        RETURNING id
      `;
      successMessage = `${result.length} items permanently deleted`;
    } else {
      return NextResponse.json({ type: "error", msg: "Invalid delete type specified" }, { status: 400 });
    }

    return NextResponse.json({ 
      type: "success", 
      msg: successMessage 
    });

  } catch (error) {
    console.error("Delete handler error:", error);
    return NextResponse.json({ type: "error", msg: "Server error during deletion" }, { status: 500 });
  }
}