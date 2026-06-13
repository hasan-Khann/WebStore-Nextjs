import { isAuthentic } from '@/utils/role';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const sql = neon(process.env.NEON_URL);
const isUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export async function PUT(request) {
  try {
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const { Ids = [], deleteType } = await request.json();

    if (!Array.isArray(Ids) || !Ids.length) {
      return NextResponse.json({ type: "error", msg: "Invalid Ids" }, { status: 400 });
    }

    if (!["SD", "RSD"].includes(deleteType)) {
      return NextResponse.json({ type: "error", msg: "Invalid delete type" }, { status: 400 });
    }

    const validIds = Ids.filter(isUUID);
    if (!validIds.length) return NextResponse.json({ type: "error", msg: "Invalid IDs" }, { status: 400 });

    // Ensure we only touch existing customers
    const exists = await sql`SELECT id FROM users WHERE id = ANY(${validIds}::uuid[]) AND role = 'user'`;
    if (!exists.length) return NextResponse.json({ type: "error", msg: "Customers not found" }, { status: 404 });

    const existingIds = exists.map(u => u.id);

    if (deleteType === "SD") {
      await sql`UPDATE users SET deleted_at = NOW() WHERE id = ANY(${existingIds}::uuid[])`;
    } else {
      await sql`UPDATE users SET deleted_at = NULL WHERE id = ANY(${existingIds}::uuid[])`;
    }

    return NextResponse.json({
      type: "success",
      msg: deleteType === "SD" ? "Customers soft-deleted" : "Customers restored",
    });
  } catch (err) {
    console.error("PUT customer delete error:", err);
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}