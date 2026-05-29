import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { isAuthentic } from "@/utils/role";

const sql = neon(process.env.NEON_URL);

export async function GET(request) {
  try {
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const start = Math.max(0, parseInt(searchParams.get("start") || "0", 10));
    const size = Math.max(1, parseInt(searchParams.get("size") || "10", 10));
    const globalFilterRaw = searchParams.get("globalFilter") || "";
    const globalFilter = globalFilterRaw.trim();

    const queryParams = [];
    const conditions = [];

    if (globalFilter) {
      const textFilter = `$${queryParams.push(`%${globalFilter}%`)}`;
      conditions.push(`(username ILIKE ${textFilter} OR email ILIKE ${textFilter})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    
    const limitPlaceholder = `$${queryParams.push(size)}`;
    const offsetPlaceholder = `$${queryParams.push(start)}`;

    const query = `
      SELECT 
        id AS "_id", 
        username, 
        email, 
        role, 
        login_method AS "loginMethod", 
        created_at AS "createdAt",
        COUNT(*) OVER() AS total_count
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}
    `;

    const rawData = await sql.query(query, queryParams);
    
    const totalRowCount = rawData.length > 0 ? parseInt(rawData[0].total_count) : 0;
    const data = rawData.map(({ total_count, ...rest }) => rest);

    return NextResponse.json({
      type: "success",
      data,
      meta: {
        totalRowCount,
        start,
        size,
        hasMore: start + size < totalRowCount,
      },
    });
  } catch (err) {
    console.error("GET_USERS_ERROR:", err);
    return NextResponse.json({ type: "error", msg: "Failed to fetch directory" }, { status: 500 });
  }
}