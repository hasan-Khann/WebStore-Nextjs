import { sql } from "@/lib/sql";
import { NextResponse } from "next/server";

export async function GET(req, context) {
  try {
    const params = await context.params;
    const { productId } = params;

    if (
      !productId ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId)
    ) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit")) || 10;

    const [statsData, reviews] = await Promise.all([
      sql`
        SELECT rating AS _id, COUNT(*)::int AS count
        FROM reviews
        WHERE product_id = ${productId}
        GROUP BY rating
      `,
      sql`
        SELECT 
          r.id AS "_id",
          r.rating,
          r.title,
          r.comment AS review,
          r.created_at AS "createdAt",
          u.username AS username
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.product_id = ${productId}
        ORDER BY r.created_at DESC
        LIMIT ${limit}
      `
    ]);

    let total = 0;
    let sumStars = 0;

    const distinct = [1, 2, 3, 4, 5].map((star) => ({
      rating: star,
      count: 0,
    }));

    for (const item of statsData) {
      total += item.count;
      sumStars += item._id * item.count;

      const target = distinct.find((d) => d.rating === item._id);
      if (target) target.count = item.count;
    }

    return NextResponse.json({
      stats: {
        total,
        average: total > 0 ? (sumStars / total).toFixed(1) : "0.0",
        distinct: distinct.reverse(),
      },
      reviews,
    });
  } catch (error) {
    console.error("❌ API_ERROR:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}