import { NextResponse } from "next/server";
import { pool } from "@/lib/sql";

export async function POST(req) {
  const client = await pool.connect();

  try {
    const { customer, cart, paymentMethod, couponCode } = await req.json();

    if (!cart?.length) {
      return NextResponse.json(
        { type: "error", message: "Cart is empty" },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    const variantIds = cart.map((item) => item.variantId).filter(Boolean);

    const { rows: dbVariants } = await client.query(
      `
      SELECT id, price, sku, stock
      FROM product_variants
      WHERE id = ANY($1::uuid[])
        AND deleted_at IS NULL
      FOR UPDATE
      `,
      [variantIds]
    );

    const variantMap = new Map(dbVariants.map((v) => [String(v.id), v]));
    const verifiedItems = [];

    for (const item of cart) {
      const dbVariant = variantMap.get(String(item.variantId));

      if (!dbVariant) {
        throw new Error(`${item.name || "Item"} is no longer available`);
      }

      const qty = Math.max(1, Number(item.quantity || 1));

      if (Number(dbVariant.stock) < qty) {
        throw new Error(`Only ${dbVariant.stock} stock left for ${item.name || "Item"}`);
      }

      verifiedItems.push({
        variantId: dbVariant.id,
        quantity: qty,
        price: Number(dbVariant.price),
        sku: dbVariant.sku,
        name: item.name || "Item",
        media: Array.isArray(item.media) ? item.media[0] : item.media || "/placeholder.jpg",
      });
    }

    const subtotal = verifiedItems.reduce(
      (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );

    let discountAmount = 0;
    let couponId = null;
    let successMessage = "Order placed successfully!";

    if (couponCode?.trim()) {
      const { rows: couponRows } = await client.query(
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
        [couponCode.trim().toUpperCase()]
      );

      const coupon = couponRows[0];

      if (!coupon) throw new Error("Invalid coupon code");
      if (!coupon.is_active) throw new Error("Coupon is inactive");
      if (new Date() > new Date(coupon.expiry)) throw new Error("Coupon has expired");
      if (coupon.redeemed_count >= coupon.max_redemptions) {
        throw new Error("Coupon redemption limit reached");
      }
      if (subtotal < Number(coupon.min_shopping_amount)) {
        throw new Error(`Minimum spend Rs. ${coupon.min_shopping_amount} required`);
      }

      discountAmount = (subtotal * Number(coupon.discount_percentage)) / 100;
      couponId = coupon.id;
      successMessage = `Order placed! ${coupon.discount_percentage}% discount applied.`;
    }

    const shippingCost = subtotal > 5000 || subtotal === 0 ? 0 : 250;
    const total = subtotal + shippingCost - discountAmount;

    const orderNumber = `ORD-${crypto.randomUUID()
      .replace(/-/g, "")
      .slice(0, 10)
      .toUpperCase()}`;

    const orderId = crypto.randomUUID();

    const { rows: orderRows } = await client.query(
      `
      INSERT INTO orders (
        id,
        order_number,
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
        orderId,
        orderNumber,
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

    for (const item of verifiedItems) {
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
          orderRows[0].id,
          item.variantId,
          item.name,
          item.sku,
          item.media,
          item.price,
          item.quantity,
        ]
      );

      const updated = await client.query(
        `
        UPDATE product_variants
        SET stock = stock - $1,
            updated_at = NOW()
        WHERE id = $2
          AND stock >= $1
        RETURNING id
        `,
        [item.quantity, item.variantId]
      );

      if (!updated.rows.length) {
        throw new Error(`Insufficient stock for ${item.name}`);
      }
    }

    if (couponId) {
      const updatedCoupon = await client.query(
        `
        UPDATE coupons
        SET redeemed_count = redeemed_count + 1,
            updated_at = NOW()
        WHERE id = $1
          AND redeemed_count < max_redemptions
        RETURNING id
        `,
        [couponId]
      );

      if (!updatedCoupon.rows.length) {
        throw new Error("Coupon limit exceeded");
      }
    }

    await client.query("COMMIT");

    if (paymentMethod === "PayFast") {
      const query = new URLSearchParams({
        merchant_id: process.env.MERCHANT_ID,
        merchant_key: process.env.MERCHANT_KEY,
        amount: total.toFixed(2),
        item_name: `Order #${orderRows[0].order_number.slice(-6)}`,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
        notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payfast/notify`,
        name_first: customer.fullName.split(" ")[0],
        email_address: customer.email,
        m_payment_id: orderRows[0].order_number,
        custom_str1: orderRows[0].id,
      });

      return NextResponse.json({
        type: "redirect",
        url: `https://sandbox.payfast.co.za/eng/process?${query.toString()}`,
        message: "Redirecting to secure payment...",
        details: { couponApplied: Boolean(couponId), discount: discountAmount },
        finalPrice: total,
      });
    }

    return NextResponse.json({
      type: "success",
      message: successMessage,
      orderId: orderRows[0].id,
      finalPrice: total,
      details: { couponApplied: Boolean(couponId), discount: discountAmount },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Guest Checkout Error:", error);

    return NextResponse.json(
      { type: "error", message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}