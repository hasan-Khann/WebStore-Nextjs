import { NextResponse } from "next/server";
import { isAuthentic } from "@/utils/role";
import { sql } from "@/lib/sql";

export async function PUT(request) {
  try {
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const { Ids, deleteType } = await request.json();
    if (!Ids?.length) return NextResponse.json({ type: "error", msg: "No IDs" }, { status: 400 });

    if (deleteType === "SD") {
      await sql`UPDATE products SET deleted_at = NOW() WHERE id = ANY(${Ids})`;
    } else if (deleteType === "RSD") {
      await sql`UPDATE products SET deleted_at = NULL WHERE id = ANY(${Ids})`;
    } else if (deleteType === "PD") {
      await sql`DELETE FROM products WHERE id = ANY(${Ids})`;
    } else {
      return NextResponse.json({ type: "error", msg: "Invalid delete type" }, { status: 400 });
    }

    return NextResponse.json({ type: "success", msg: "Operation successful" });
  } catch (err) {
    return NextResponse.json({ type: "error", msg: "Internal Server Error" }, { status: 500 });
  }
}