import { NextResponse } from "next/server";
import { pool } from "@/lib/sql";
import { isAuthentic } from "@/utils/role";

export async function POST(req) {
  const client = await pool.connect();

  try {
    const { customer, paymentMethod, couponCode } = await req.json();

    const { isAuth, data } = await isAuthentic("user", req);

    if (!isAuth) {
      return NextResponse.json(
        { type: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    await client.query("BEGIN");

    const { rows: cartItems } = await client.query(
      `
      SELECT
        ci.variant_id,
        ci.quantity,
        ci.name,
        ci.sku,
        ci.media,
        pv.price,
        pv.stock
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      JOIN product_variants pv ON pv.id = ci.variant_id
      WHERE c.user_id = $1
        AND pv.deleted_at IS NULL
      FOR UPDATE OF pv
      `,
      [data.id]
    );

    if (!cartItems.length) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { type: "error", message: "Cart is empty" },
        { status: 400 }
      );
    }

    for (const item of cartItems) {
      if (Number(item.stock) < Number(item.quantity)) {
        throw new Error(`Only ${item.stock} stock left for ${item.name}`);
      }
    }

    const subtotal = cartItems.reduce(
      (acc, item) => acc + Number(item.price) * Number(item.quantity),
      0
    );

    let discountAmount = 0;
    let couponId = null;

    const normalizedCoupon = couponCode?.trim().toUpperCase();

    if (normalizedCoupon) {
      const { rows: coupons } = await client.query(
        `
        SELECT
          id,
          discount_percentage,
          min_shopping_amount,
          expiry,
          max_redemptions,
          redeemed_count,
          is_active
        FROM coupons
        WHERE code = $1
        LIMIT 1
        FOR UPDATE
        `,
        [normalizedCoupon]
      );

      const coupon = coupons[0];

      if (!coupon) throw new Error("Invalid coupon code");
      if (!coupon.is_active) throw new Error("Coupon inactive");
      if (new Date() > new Date(coupon.expiry)) throw new Error("Coupon expired");
      if (Number(coupon.redeemed_count) >= Number(coupon.max_redemptions)) {
        throw new Error("Coupon limit reached");
      }
      if (subtotal < Number(coupon.min_shopping_amount)) {
        throw new Error(`Minimum spend Rs. ${coupon.min_shopping_amount} required`);
      }

      discountAmount = (subtotal * Number(coupon.discount_percentage)) / 100;
      couponId = coupon.id;
    }

    const shippingCost = subtotal > 5000 || subtotal === 0 ? 0 : 250;
    const total = subtotal + shippingCost - discountAmount;

    const orderNumber = `ORD-${crypto.randomUUID()
      .replace(/-/g, "")
      .slice(0, 10)
      .toUpperCase()}`;

    const { rows: orderRows } = await client.query(
      `
      INSERT INTO orders (
        order_number,
        user_id,
        customer_full_name,
        customer_email,
        customer_phone,
        customer_address,
        subtotal,
        delivery_cost,
        discount,
        total,
        payment_method,
        payment_status,
        order_status
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6::jsonb,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13
      )
      RETURNING id, order_number
      `,
      [
        orderNumber,
        data.id,
        customer.fullName,
        customer.email,
        customer.phone,
        JSON.stringify(customer.address),
        subtotal,
        shippingCost,
        discountAmount,
        total,
        paymentMethod,
        "pending",
        "processing",
      ]
    );

    const order = orderRows[0];

    for (const item of cartItems) {
      await client.query(
        `
        INSERT INTO order_items (
          order_id,
          variant_id,
          name,
          sku,
          media,
          price,
          quantity
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          order.id,
          item.variant_id,
          item.name,
          item.sku,
          item.media,
          Number(item.price),
          Number(item.quantity),
        ]
      );

      const { rowCount } = await client.query(
        `
        UPDATE product_variants
        SET stock = stock - $1,
            updated_at = NOW()
        WHERE id = $2
          AND stock >= $1
        `,
        [Number(item.quantity), item.variant_id]
      );

      if (!rowCount) {
        throw new Error(`Insufficient stock for ${item.name}`);
      }
    }

    if (couponId) {
      const { rowCount } = await client.query(
        `
        UPDATE coupons
        SET redeemed_count = redeemed_count + 1,
            updated_at = NOW()
        WHERE id = $1
          AND redeemed_count < max_redemptions
        `,
        [couponId]
      );

      if (!rowCount) {
        throw new Error("Coupon limit exceeded");
      }
    }

    if (paymentMethod === "COD") {
      await client.query(
        `
        DELETE FROM cart_items
        USING carts
        WHERE cart_items.cart_id = carts.id
          AND carts.user_id = $1
        `,
        [data.id]
      );
    }

    await client.query("COMMIT");

    if (paymentMethod === "PayFast") {
      const query = new URLSearchParams({
        merchant_id: process.env.MERCHANT_ID,
        merchant_key: process.env.MERCHANT_KEY,
        amount: total.toFixed(2),
        item_name: `Order #${order.order_number}`,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
        notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payfast/notify`,
        name_first: customer.fullName.split(" ")[0],
        email_address: customer.email,
        m_payment_id: order.order_number,
        custom_str1: order.id,
      });

      return NextResponse.json({
        type: "redirect",
        url: `https://sandbox.payfast.co.za/eng/process?${query.toString()}`,
        message: "Redirecting to secure payment...",
        details: {
          couponApplied: Boolean(couponId),
          discount: discountAmount,
        },
        finalPrice: total,
      });
    }

    return NextResponse.json({
      type: "success",
      message: "Order placed successfully!",
      orderId: order.id,
      finalPrice: total,
      details: {
        couponApplied: Boolean(couponId),
        discount: discountAmount,
      },
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {}

    console.error("Checkout Error:", error);

    return NextResponse.json(
      {
        type: "error",
        message: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}