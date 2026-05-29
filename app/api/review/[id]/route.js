import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

if (!process.env.NEON_URL) throw new Error('DATABASE_URL is not defined');
const sql = neon(process.env.NEON_URL);

const isUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!id || !isUUID(id)) return NextResponse.json({ type: "error", msg: "Invalid id" }, { status: 400 });

    const auth = await isAuthentic(["admin", "employee"], request); 
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const reviews = await sql`
      SELECT 
        r.id AS "_id", r.rating, r.title, r.comment AS review,
        r.created_at AS "createdAt", r.updated_at AS "updatedAt",
        json_build_object('_id', u.id, 'username', u.username, 'email', u.email) AS username,
        json_build_object('_id', p.id, 'name', p.name) AS product
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN products p ON r.product_id = p.id
      WHERE r.id = ${id}
      LIMIT 1
    `;

    if (!reviews.length) return NextResponse.json({ type: "error", msg: "Review not found" }, { status: 404 });

    return NextResponse.json({ type: "success", data: reviews[0] });
  } catch (err) {
    console.error("GET review error:", err);
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    if (!id || !isUUID(id)) return NextResponse.json({ type: "error", msg: "Invalid id" }, { status: 400 });

    const auth = await isAuthentic("user", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const { title, rating, review: reviewText } = await request.json();
    if (rating == null) return NextResponse.json({ type: "error", msg: "Rating is required" }, { status: 400 });

    const updated = await sql`
      UPDATE reviews
      SET title = ${title}, rating = ${rating}, comment = ${reviewText}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id AS "_id", rating, title, comment AS review, updated_at AS "updatedAt"
    `;

    if (!updated.length) return NextResponse.json({ type: "error", msg: "Update failed" }, { status: 404 });

    return NextResponse.json({ type: "success", msg: "Review updated", data: updated[0] });
  } catch (err) {
    console.error("PUT review error:", err);
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    if (!id || !isUUID(id)) return NextResponse.json({ type: "error", msg: "Invalid id" }, { status: 400 });

    const auth = await isAuthentic("admin", request); 
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const deleted = await sql`DELETE FROM reviews WHERE id = ${id} RETURNING id`;
    
    if (!deleted.length) return NextResponse.json({ type: "error", msg: "Review not found or delete failed" }, { status: 404 });

    return NextResponse.json({ type: "success", msg: "Review deleted permanently" });
  } catch (err) {
    console.error("DELETE review error:", err);
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}