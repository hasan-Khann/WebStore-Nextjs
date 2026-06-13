import { NextResponse } from "next/server";
import { sql } from "@/lib/sql";
import { isAuthentic } from "@/utils/role";

export async function GET(request) {
  try {
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) {
      return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });
    }

    const [monthlyRevenue, orderStatusCounts, lowStockVariants] = await Promise.all([
      sql`
        SELECT 
          EXTRACT(YEAR FROM created_at)::INT AS year,
          EXTRACT(MONTH FROM created_at)::INT AS month,
          SUM(total)::FLOAT AS revenue,
          COUNT(*)::INT AS orders_count
        FROM orders
        WHERE order_status != 'cancelled'
        GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)
        ORDER BY year ASC, month ASC
        LIMIT 12;
      `,

      sql`
        SELECT 
          order_status AS status,
          COUNT(*)::INT AS count
        FROM orders
        GROUP BY order_status;
      `,

      sql`
        SELECT 
          id, sku, stock, size, color, price::FLOAT
        FROM product_variants
        WHERE deleted_at IS NULL 
          AND stock < 10
        ORDER BY stock ASC
        LIMIT 8;
      `
    ]);

    const formattedRevenue = monthlyRevenue.map((item) => {
      const date = new Date(item.year, item.month - 1);
      return {
        name: date.toLocaleString('default', { month: 'short' }),
        revenue: item.revenue,
        orders: item.orders_count,
      };
    });

    const statusMap = orderStatusCounts.reduce((acc, curr) => {
      acc[curr.status] = curr.count;
      return acc;
    }, {});

    return NextResponse.json({
      type: "success",
      data: {
        revenueChart: formattedRevenue,
        statusDistribution: statusMap,
        lowStockAlerts: lowStockVariants.map(v => ({
          ...v,
          _id: v.id
        })),
      }
    });

  } catch (err) {
    console.error("Dashboard API error:", err);
    return NextResponse.json({ type: "error", msg: "Server Error" }, { status: 500 });
  }
}