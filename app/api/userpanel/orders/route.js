import { NextResponse } from "next/server";
import { sql } from "@/lib/sql";
import { getUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await sql`
      SELECT 
        id AS "_id",
        order_number AS "orderNumber",
        customer_full_name AS "customerFullName",
        customer_email AS "customerEmail",
        customer_phone AS "customerPhone",
        customer_address AS "customerAddress",
        subtotal,
        delivery_cost AS "deliveryCost",
        discount,
        total,
        payment_method AS "paymentMethod",
        payment_status AS "paymentStatus",
        order_status AS "orderStatus",
        tracking_number AS "trackingNumber",
        delivered_at AS "deliveredAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM orders
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ data: orders });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}