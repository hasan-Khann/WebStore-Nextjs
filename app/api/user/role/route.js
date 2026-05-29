import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { isAuthentic } from "@/utils/role";
import { comparePassword } from "@/utils/auth";

const sql = neon(process.env.NEON_URL);

export async function POST(request) {
  try {
    const { id, role, password } = await request.json();
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized Action" }, { status: 401 });
    const adminId = auth.data.id; 

    const adminUser = await sql`SELECT password FROM users WHERE id = ${adminId} LIMIT 1`;
    
    if (!adminUser.length) {
        return NextResponse.json({ type: "error", msg: "Admin user not found" }, { status: 404 });
    }

    const isPasswordValid = await comparePassword(password, adminUser[0].password);
    if (!isPasswordValid) {
        return NextResponse.json({ type: "error", msg: "Invalid admin password" }, { status: 401 });
    }

    const updatedUser = await sql`
      UPDATE users 
      SET role = ${role}::user_role, updated_at = NOW() 
      WHERE id = ${id} 
      RETURNING id
    `;

    if (!updatedUser.length) {
        return NextResponse.json({ type: "error", msg: "Target user not found" }, { status: 404 });
    }

    return NextResponse.json({ type: "success", msg: `Access level set to ${role}` });
    
  } catch (err) {
    console.error("ROLE_UPDATE_ERR:", err);
    return NextResponse.json({ type: "error", msg: "System failure" }, { status: 500 });
  }
}