import { sql } from "@/lib/sql";
import { isAuthentic } from "@/utils/role";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const auth = await isAuthentic("user", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const start = parseInt(searchParams.get("start") || "0", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);
    const globalFilter = searchParams.get("globalFilter") || "";
    const sortingParam = searchParams.get("sorting") || "[]";

    const conditions = [`o.user_id = $1`];
    const queryParams = [auth.data.id];

    if (globalFilter) {
      queryParams.push(`%${globalFilter}%`);
      const idx = `$${queryParams.length}`;
      conditions.push(`(o.order_number ILIKE ${idx} OR o.payment_status ILIKE ${idx})`);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    let orderBy = "ORDER BY o.created_at DESC";
    try {
      const sorting = JSON.parse(sortingParam);
      if (sorting.length > 0) {
        const { id, desc } = sorting[0];
        const sortMap = {
          "orderNumber": "o.order_number",
          "total": "o.total",
          "paymentStatus": "o.payment_status",
          "createdAt": "o.created_at"
        };
        if (sortMap[id]) orderBy = `ORDER BY ${sortMap[id]} ${desc ? 'DESC' : 'ASC'}`;
      }
    } catch (e) {}

    queryParams.push(size, start);
    const limitIdx = `$${queryParams.length - 1}`;
    const offsetIdx = `$${queryParams.length}`;

    const queryText = `
      SELECT 
        o.id AS "_id", 
        o.order_number AS "orderNumber", 
        o.total, 
        o.payment_status AS "paymentStatus", 
        o.order_status AS "orderStatus",
        o.created_at AS "createdAt",
        -- Construct Customer Object for Frontend Detail Panel
        json_build_object(
          'fullName', o.customer_full_name,
          'email', o.customer_email,
          'address', o.customer_address
        ) AS customer,
        -- Aggregate Items for Frontend Detail Panel
        (
          SELECT json_agg(item)
          FROM (
            SELECT name, quantity, price, sku, media
            FROM order_items
            WHERE order_id = o.id
          ) item
        ) AS items,
        COUNT(*) OVER() as total_count
      FROM orders o
      ${whereClause}
      ${orderBy}
      LIMIT ${limitIdx} OFFSET ${offsetIdx}
    `;

    const data = await sql.query(queryText, queryParams);
    const totalRowCount = data.length > 0 ? parseInt(data[0].total_count) : 0;

    return NextResponse.json({ 
      type: "success", 
      data: data.map(({ total_count, ...rest }) => rest), 
      meta: { totalRowCount } 
    });
  } catch (err) {
    return NextResponse.json({ type: "error", msg: err.message }, { status: 500 });
  }
}