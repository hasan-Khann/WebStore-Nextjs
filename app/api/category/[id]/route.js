import { sql } from "@/lib/sql";
import { isAuthentic } from "@/utils/role";
import { redis } from "@/lib/rediscache";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const [row] = await sql`
      SELECT 
        c.id as _id, c.name, c.slug, c.img_id as img, c.created_at as "createdAt",
        m.id as "media_id", m.secure_url, m.public_id
      FROM categories c
      LEFT JOIN media m ON c.img_id = m.id
      WHERE c.id = ${id}
    `;

    if (!row) {
      return NextResponse.json({ type: "error", msg: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({
      type: "success",
      data: {
        _id: row._id,
        name: row.name,
        slug: row.slug,
        img: row.img,
        createdAt: row.createdAt,
        imgData: row.media_id ? {
          _id: row.media_id,
          secure_url: row.secure_url,
          url: row.secure_url 
        } : null
      }
    });

  } catch (err) {
    console.error("GET_CATEGORY_ERROR:", err);
    return NextResponse.json({ type: "error", msg: "Internal Server Error", detail: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const result = await sql`DELETE FROM categories WHERE id = ${id} RETURNING id`;
    
    if (result.length === 0) {
      return NextResponse.json({ type: "error", msg: "Not found" }, { status: 404 });
    }

    // // Invalidate caches
    // await Promise.all([
    //   redis.del("categories:all"),
    //   redis.del("categories:export:all")
    // ]);

    return NextResponse.json({ type: "success", msg: "Permanently deleted" });
  } catch (err) {
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}

// 3. PUT: Update Category
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, slug, img } = body;

    if (!name || !slug) {
      return NextResponse.json({ type: "error", msg: "Missing required fields" }, { status: 400 });
    }

    const [updatedCategory] = await sql`
      UPDATE categories 
      SET name = ${name}, slug = ${slug}, img_id = ${img}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id as _id, name, slug, img_id as img, created_at as "createdAt"
    `;

    if (!updatedCategory) {
      return NextResponse.json({ type: "error", msg: "Category not found" }, { status: 404 });
    }

    // await Promise.all([
    //   redis.del("categories:all"),
    //   redis.del("categories:export:all")
    // ]);

    return NextResponse.json({ 
      type: "success", 
      msg: "Category updated successfully",
      data: updatedCategory 
    });

  } catch (err) {
    console.error("UPDATE_CATEGORY_ERROR:", err);
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}