import { NextResponse } from "next/server";
import { pool } from "@/lib/sql";

export async function POST(req) {
  const client = await pool.connect();

  try {
    const formData = await req.formData();

    const paymentStatus = formData.get("payment_status");
    const orderNumber = formData.get("m_payment_id");

    if (paymentStatus !== "COMPLETE") {
      return NextResponse.json({
        ok: true,
        message: "Ignored",
      });
    }

    await client.query("BEGIN");

    const { rows } = await client.query(
      `
      SELECT id, user_id, payment_status
      FROM orders
      WHERE order_number = $1
      LIMIT 1
      FOR UPDATE
      `,
      [orderNumber]
    );

    const order = rows[0];

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.payment_status === "paid") {
      await client.query("COMMIT");

      return NextResponse.json({
        ok: true,
      });
    }

    await client.query(
      `
      UPDATE orders
      SET
        payment_status = 'paid',
        updated_at = NOW()
      WHERE id = $1
      `,
      [order.id]
    );

    if (order.user_id) {
      await client.query(
        `
        DELETE FROM cart_items
        USING carts
        WHERE cart_items.cart_id = carts.id
        AND carts.user_id = $1
        `,
        [order.user_id]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({
      ok: true,
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  } finally {
    client.release();
  }
}