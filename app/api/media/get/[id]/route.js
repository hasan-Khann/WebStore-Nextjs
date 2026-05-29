import { sql } from "@/lib/sql";
import { NextResponse } from "next/server";


export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const [media] = await sql`SELECT * FROM media WHERE id = ${id} AND deleted_at IS NULL`;

    if (!media) return NextResponse.json({ type: "error", msg: "Asset not found" }, { status: 404 });

    return NextResponse.json({ success: true, type: "success", data: media });
  } catch (error) {
    return NextResponse.json({ type: "error", msg: "Internal Server Error" }, { status: 500 });
  }
}