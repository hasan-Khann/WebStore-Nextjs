import { sql } from "@/lib/sql";
import { isAuthentic } from "@/utils/role";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const auth = await isAuthentic("user", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const userId = auth.data.id;
    const { productId, rating, title, review: reviewText } = await request.json();

    if (!productId || !rating || !reviewText) {
      return NextResponse.json({ type: "error", msg: "Missing required fields" }, { status: 400 });
    }

    const [newReview] = await sql`
      INSERT INTO reviews (user_id, product_id, rating, title, comment)
      VALUES (${userId}, ${productId}, ${rating}, ${title}, ${reviewText})
      RETURNING id AS "_id", rating, title, comment AS review, created_at AS "createdAt"
    `;

    return NextResponse.json({
      type: "success",
      msg: "Review submitted successfully",
      data: newReview
    }, { status: 201 });

  } catch (err) {
    if (err.code === '23505') {
      return NextResponse.json({ type: "error", msg: "You have already reviewed this masterpiece." }, { status: 409 });
    }

    console.error("POST review error:", err);
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}