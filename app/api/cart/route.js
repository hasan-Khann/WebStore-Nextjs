import { NextResponse } from "next/server";
import { sql } from "@/lib/sql";
import { isAuthentic } from "@/utils/role";

/* ------------------------------- HELPERS ------------------------------ */

const CART_ITEM_SELECT = sql`
  ci.id,
  ci.variant_id::text AS "variantId",
  ci.quantity::int AS quantity,

  COALESCE(ci.name, 'Product') AS name,
  COALESCE(ci.sku, '') AS sku,

  COALESCE(NULLIF(ci.media, ''), '/placeholder.jpg') AS media,

  COALESCE(ci.price::float, 0) AS price,
  COALESCE(ci.color, '') AS color,
  COALESCE(ci.size, '') AS size
`;

async function getOrCreateCart(userId) {
  const existing = await sql`
    SELECT id FROM carts WHERE user_id = ${userId} LIMIT 1
  `;
  if (existing.length) return existing[0].id;

  const created = await sql`
    INSERT INTO carts (user_id)
    VALUES (${userId})
    RETURNING id
  `;
  return created[0].id;
}

/* ------------------------------- GET ------------------------------ */

export async function GET(req) {
  try {
    const { isAuth, data } = await isAuthentic("user", req);

    if (!isAuth) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    const items = await sql`
      SELECT ${CART_ITEM_SELECT}
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE c.user_id = ${data.id}
      ORDER BY ci.created_at ASC
    `;

    return NextResponse.json({ items });
  } catch (err) {
    console.error("GET ERROR:", err);
    return NextResponse.json(
      { msg: "Fetch failed", error: err.message },
      { status: 500 }
    );
  }
}

/* ------------------------------- POST ------------------------------ */

export async function POST(req) {
  try {
    const { isAuth, data } = await isAuthentic("user", req);

    if (!isAuth) {
      return NextResponse.json(
        { msg: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const items = Array.isArray(body) ? body : [body];

    const cartId = await getOrCreateCart(data.id);

    // ✅ BULK INSERT (NO JS LOOP)
    await sql`
      INSERT INTO cart_items (
        cart_id,
        variant_id,
        quantity,
        name,
        sku,
        media,
        price,
        color,
        size
      )
      SELECT
        ${cartId},
        pv.id,
        COALESCE(i.qty, 1),

        p.name,
        pv.sku,

        COALESCE(m.secure_url, '/placeholder.jpg'),

        pv.price,
        pv.color,
        pv.size

      FROM jsonb_to_recordset(${JSON.stringify(items)}::jsonb)
      AS i("variantId" uuid, qty int)

      JOIN product_variants pv ON pv.id = i."variantId"
      JOIN products p ON p.id = pv.product_id

      LEFT JOIN LATERAL (
        SELECT m.secure_url
        FROM variant_images vi
        JOIN media m ON m.id = vi.media_id
        WHERE vi.variant_id = pv.id
        ORDER BY m.created_at ASC
        LIMIT 1
      ) m ON true

      ON CONFLICT (cart_id, variant_id)
      DO UPDATE SET
        quantity = cart_items.quantity + EXCLUDED.quantity,
        updated_at = CURRENT_TIMESTAMP
    `;

    const updated = await sql`
      SELECT ${CART_ITEM_SELECT}
      FROM cart_items ci
      WHERE ci.cart_id = ${cartId}
      ORDER BY ci.created_at ASC
    `;

    return NextResponse.json({ items: updated });
  } catch (err) {
    console.error("POST ERROR:", err);
    return NextResponse.json(
      { msg: "POST failed", error: err.message },
      { status: 500 }
    );
  }
}

/* ------------------------------- PATCH ------------------------------ */

export async function PATCH(req) {
  try {
    const { isAuth, data } = await isAuthentic("user", req);

    if (!isAuth) {
      return NextResponse.json(
        { msg: "Unauthorized" },
        { status: 401 }
      );
    }

    const { variantId, action } = await req.json();

    const cart = await sql`
      SELECT id FROM carts WHERE user_id = ${data.id} LIMIT 1
    `;
    if (!cart.length) return NextResponse.json({ items: [] });

    const cartId = cart[0].id;

    if (action === "inc") {
      await sql`
        UPDATE cart_items
        SET quantity = quantity + 1
        WHERE cart_id = ${cartId}
        AND variant_id = ${variantId}
      `;
    }

    if (action === "dec") {
      await sql`
        UPDATE cart_items
        SET quantity = quantity - 1
        WHERE cart_id = ${cartId}
        AND variant_id = ${variantId}
      `;

      await sql`
        DELETE FROM cart_items
        WHERE cart_id = ${cartId}
        AND variant_id = ${variantId}
        AND quantity <= 0
      `;
    }

    if (action === "remove") {
      await sql`
        DELETE FROM cart_items
        WHERE cart_id = ${cartId}
        AND variant_id = ${variantId}
      `;
    }

    const items = await sql`
      SELECT ${CART_ITEM_SELECT}
      FROM cart_items ci
      WHERE ci.cart_id = ${cartId}
      ORDER BY ci.created_at ASC
    `;

    return NextResponse.json({ items });
  } catch (err) {
    console.error("PATCH ERROR:", err);
    return NextResponse.json(
      { msg: "Update failed", error: err.message },
      { status: 500 }
    );
  }
}

/* ------------------------------ DELETE ------------------------------ */

export async function DELETE(req) {
  try {
    const { isAuth, data } = await isAuthentic("user", req);

    if (!isAuth) {
      return NextResponse.json(
        { msg: "Unauthorized" },
        { status: 401 }
      );
    }

    const cart = await sql`
      SELECT id FROM carts WHERE user_id = ${data.id} LIMIT 1
    `;

    if (cart.length) {
      await sql`
        DELETE FROM cart_items
        WHERE cart_id = ${cart[0].id}
      `;
    }

    return NextResponse.json({ items: [] });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return NextResponse.json(
      { msg: "Clear failed", error: err.message },
      { status: 500 }
    );
  }
}