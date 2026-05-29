import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { isAuthentic } from "@/utils/token";

const sql = neon(process.env.NEON_URL);
const isUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!id || !isUUID(id)) return NextResponse.json({ type: "error", msg: "Invalid id" }, { status: 400 });

    const auth = await isAuthentic(["admin", "employee"], request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const customer = await sql`
      SELECT id AS "_id", username, email, role, login_method AS "loginMethod", created_at AS "createdAt"
      FROM users 
      WHERE id = ${id} AND role = 'user' 
      LIMIT 1
    `;

    if (!customer.length) return NextResponse.json({ type: "error", msg: "Customer not found" }, { status: 404 });

    return NextResponse.json({ type: "success", data: customer[0] });
  } catch (err) {
    console.error("GET customer error:", err);
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    if (!id || !isUUID(id)) return NextResponse.json({ type: "error", msg: "Invalid id" }, { status: 400 });

    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const { username, email, loginMethod } = await request.json();
    if (!username) return NextResponse.json({ type: "error", msg: "Username is required" }, { status: 400 });

    if (email) {
      const existing = await sql`SELECT id FROM users WHERE email = ${email} AND id != ${id} LIMIT 1`;
      if (existing.length) return NextResponse.json({ type: "error", msg: "Email already exists" }, { status: 409 });
    }

    const updated = await sql`
      UPDATE users 
      SET username = ${username}, email = ${email}, login_method = ${loginMethod}, updated_at = NOW()
      WHERE id = ${id} AND role = 'user'
      RETURNING id AS "_id", username, email, role, login_method AS "loginMethod"
    `;

    if (!updated.length) return NextResponse.json({ type: "error", msg: "Update failed" }, { status: 404 });

    return NextResponse.json({ type: "success", msg: "Customer updated", data: updated[0] });
  } catch (err) {
    console.error("PUT customer error:", err);
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    if (!id || !isUUID(id)) return NextResponse.json({ type: "error", msg: "Invalid id" }, { status: 400 });

    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const deleted = await sql`DELETE FROM users WHERE id = ${id} AND role = 'user' RETURNING id`;
    
    if (!deleted.length) return NextResponse.json({ type: "error", msg: "Customer not found or delete failed" }, { status: 404 });

    return NextResponse.json({ type: "success", msg: "Customer deleted permanently" });
  } catch (err) {
    console.error("DELETE customer error:", err);
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}