import { sql } from "@/lib/sql";
import { NextResponse } from "next/server";

const SORT_MAP = {
  new: {
    order: "ORDER BY pv.created_at DESC, pv.id DESC",
    getCondition: (valIdx, idIdx) =>
      `(pv.created_at, pv.id) < ($${valIdx}, $${idIdx})`,
    getCursor: (item) =>
      `${new Date(item.created_at).toISOString()}_${item._id}`,
  },

  price_low: {
    order: "ORDER BY (pv.price - pv.discount) ASC, pv.id ASC",
    getCondition: (valIdx, idIdx) =>
      `((pv.price - pv.discount), pv.id) > ($${valIdx}, $${idIdx})`,
    getCursor: (item) => `${item.price}_${item._id}`,
  },

  price_high: {
    order: "ORDER BY (pv.price - pv.discount) DESC, pv.id DESC",
    getCondition: (valIdx, idIdx) =>
      `((pv.price - pv.discount), pv.id) < ($${valIdx}, $${idIdx})`,
    getCursor: (item) => `${item.price}_${item._id}`,
  },
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    if (searchParams.get("options") === "true") {
      const rows = await sql.query(`
        SELECT DISTINCT
          pv.size,
          pv.color
        FROM product_variants pv
        INNER JOIN products p
          ON p.id = pv.product_id
        WHERE
          pv.deleted_at IS NULL
          AND p.deleted_at IS NULL
          AND pv.stock > 0
      `);

      const sizes = [...new Set(rows.map((r) => r.size).filter(Boolean))];
      const colors = [...new Set(rows.map((r) => r.color).filter(Boolean))];

      return NextResponse.json({ sizes, colors });
    }

    const limit = Math.min(25, Math.max(1, Number(searchParams.get("limit") || 12)));
    const sort = searchParams.get("sort") || "new";
    const min = Math.max(0, Number(searchParams.get("min") || 0));
    const max = Math.max(min, Number(searchParams.get("max") || 1_000_000));
    const search = searchParams.get("q")?.trim() || "";
    const cursor = searchParams.get("cursor");

    const categories = (searchParams.get("cat") || "")
      .split(",")
      .filter((id) => /^[0-9a-f-]{36}$/i.test(id));

    const sizes = (searchParams.get("sizes") || "").split(",").filter(Boolean);
    const colors = (searchParams.get("colors") || "").split(",").filter(Boolean);

    const conditions = [
      "pv.deleted_at IS NULL",
      "p.deleted_at IS NULL",
      "pv.stock > 0",
    ];
    const params = [];

    conditions.push(`(pv.price - pv.discount) >= $${params.push(min)}`);
    conditions.push(`(pv.price - pv.discount) <= $${params.push(max)}`);

    if (categories.length > 0) {
      conditions.push(`p.category_id = ANY($${params.push(categories)}::uuid[])`);
    }

    if (sizes.length > 0) {
      conditions.push(`pv.size = ANY($${params.push(sizes)}::text[])`);
    }

    if (colors.length > 0) {
      conditions.push(`pv.color = ANY($${params.push(colors)}::text[])`);
    }

    if (search) {
      const searchParam = `%${search}%`;
      const idx = params.push(searchParam);

      conditions.push(`(p.name || ' ' || p.slug) ILIKE $${idx}`);
    }

    const activeSort = SORT_MAP[sort] || SORT_MAP.new;

    if (cursor) {
      const [cursorVal, cursorId] = cursor.split("_");
      if (cursorVal && cursorId) {
        const valIdx = params.push(cursorVal);
        const idIdx = params.push(cursorId);
        conditions.push(activeSort.getCondition(valIdx, idIdx));
      }
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const queryLimit = limit + 1;
    const limitIdx = params.push(queryLimit);

    const query = `
      SELECT
        pv.id AS "_id",
        p.name,
        p.slug,
        (pv.price - pv.discount) AS price,
        pv.color,
        pv.size,
        pv.stock,
        p.category_id AS category,
        pv.created_at,
        COALESCE(imgs.media, '{}') AS media
      FROM product_variants pv
      INNER JOIN products p
        ON p.id = pv.product_id
      LEFT JOIN LATERAL (
        SELECT
          array_agg(
            m.secure_url
            ORDER BY m.created_at ASC
          ) AS media
        FROM variant_images vi
        INNER JOIN media m
          ON m.id = vi.media_id
        WHERE vi.variant_id = pv.id
      ) imgs ON TRUE
      ${whereClause}
      ${activeSort.order}
      LIMIT $${limitIdx}
    `;

    let listings = await sql.query(query, params);

    const hasNextPage = listings.length > limit;

    if (hasNextPage) {
      listings.pop(); 
    }

    const nextCursor = hasNextPage 
      ? activeSort.getCursor(listings[listings.length - 1]) 
      : null;

    const cleanedListings = listings.map(({ created_at, ...rest }) => rest);

    return NextResponse.json({
      listings: cleanedListings,
      nextCursor,
    });

  } catch (err) {
    console.error("SHOP_API_ERROR:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}