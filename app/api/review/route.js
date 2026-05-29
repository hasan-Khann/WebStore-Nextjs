import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const sql = neon(process.env.NEON_URL);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const start = parseInt(searchParams.get("start") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const globalFilter = searchParams.get("globalFilter") || "";

    const queryParams = [];
    let whereClause = "";

    if (globalFilter) {
      const filterAsNumber = parseInt(globalFilter);
      if (!isNaN(filterAsNumber)) {
        whereClause = `WHERE r.rating = $${queryParams.push(filterAsNumber)}`;
      } else {
        const textFilter = `$${queryParams.push(`%${globalFilter}%`)}`;
        whereClause = `WHERE r.title ILIKE ${textFilter} OR r.comment ILIKE ${textFilter}`;
      }
    }

    const limitPlaceholder = `$${queryParams.push(size)}`;
    const offsetPlaceholder = `$${queryParams.push(start)}`;

    const query = `
      SELECT 
        r.id AS "_id", 
        r.title, 
        r.rating, 
        r.comment AS review, 
        r.created_at AS "createdAt",
        json_build_object('username', u.username, 'email', u.email) AS user,
        COUNT(*) OVER() AS total_count
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}
    `;

    const rawData = await sql.query(query, queryParams);
    
    const totalRowCount = rawData.length > 0 ? parseInt(rawData[0].total_count) : 0;
    const data = rawData.map(({ total_count, ...rest }) => rest);

    return NextResponse.json({ type: "success", data, meta: { totalRowCount } });
  } catch (err) {
    console.error("Review Fetch Error:", err);
    return NextResponse.json({ type: "error", msg: "Failed to fetch reviews" }, { status: 500 });
  }
}