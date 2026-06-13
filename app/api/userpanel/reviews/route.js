import { NextResponse } from "next/server";
import { sql } from "@/lib/sql";
import { isAuthentic } from "@/utils/role";

export async function GET(req) {
  try {
    const auth = await isAuthentic("admin", req);
        if (!auth.isAuth) {
          return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });
        }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 5;
    const offset = (page - 1) * limit;

    const [reviews, [{ count }]] = await Promise.all([
      sql`
        SELECT 
          r.id AS "_id",
          r.product_id AS "productId",
          r.rating,
          r.title,
          r.comment,
          r.created_at AS "createdAt",
          r.updated_at AS "updatedAt",
          p.name AS "productName",
          p.slug AS "productSlug"
        FROM reviews r
        JOIN products p ON r.product_id = p.id
        WHERE r.user_id = ${user.id}
        ORDER BY r.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      sql`
        SELECT COUNT(*)::int FROM reviews WHERE user_id = ${user.id}
      `
    ]);

    const total = count;

    return NextResponse.json({
      success: true,
      data: reviews,
      nextPage: (page * limit) < total ? page + 1 : null
    });
  } catch (error) {
    console.error("Reviews fetch error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}