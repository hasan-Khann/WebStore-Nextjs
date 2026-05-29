import { sql } from "@/lib/sql";
import { isAuthentic } from "@/utils/role";
import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const { Ids, deleteType } = await request.json();

    const validIds = Ids.filter(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
    if (validIds.length === 0) return NextResponse.json({ type: "error", msg: "No valid IDs provided" }, { status: 400 });

    if (deleteType === "SD") {
      await sql`UPDATE product_variants SET deleted_at = NOW() WHERE id = ANY(${validIds})`;
    } else if (deleteType === "RSD") {
      await sql`UPDATE product_variants SET deleted_at = NULL WHERE id = ANY(${validIds})`;
    } else if (deleteType === "PD") {
      await sql`DELETE FROM product_variants WHERE id = ANY(${validIds})`;
    } else {
      return NextResponse.json({ type: "error", msg: "Invalid delete type" }, { status: 400 });
    }

    return NextResponse.json({ type: "success", msg: "Operation successful" });
  } catch (err) {
    console.error("VARIANT_BULK_ERROR:", err);
    return NextResponse.json({ type: "error", msg: "Internal Server Error" }, { status: 500 });
  }
}