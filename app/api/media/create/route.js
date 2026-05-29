import cloudinary from "@/lib/cloudinary";
import { sql } from "@/lib/sql";
import { NextResponse } from "next/server";
import { isAuthentic } from "@/utils/role";

export async function POST(req) {
  let payload = [];
  try {
    const auth = await isAuthentic("admin", req);
    if (!auth.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    payload = await req.json();
    if (!Array.isArray(payload) || payload.length === 0) {
      return NextResponse.json({ type: "error", msg: "No files provided" }, { status: 400 });
    }

    const results = [];
    for (const item of payload) {
      const [row] = await sql`
        INSERT INTO media (asset_id, public_id, secure_url, thumbnail_url, format, alt, title)
        VALUES (${item.asset_id}, ${item.public_id}, ${item.secure_url}, ${item.thumbnail_url}, ${item.format}, ${item.alt || ''}, ${item.title || 'Untitled'})
        RETURNING id as _id, *
      `;
      results.push(row);
    }

    return NextResponse.json({ type: "success", msg: "Gallery updated", data: results }, { status: 201 });
  } catch (error) {
    if (payload.length > 0) {
      const publicIds = payload.map((data) => data.public_id);
      await cloudinary.api.delete_resources(publicIds).catch(err => console.error("Rollback failed", err));
    }
    return NextResponse.json({ type: "error", msg: "Database sync failed" }, { status: 500 });
  }
}