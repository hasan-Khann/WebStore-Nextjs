import { sql } from "@/lib/sql";
import { isAuthentic } from "@/utils/role";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const start = parseInt(searchParams.get("start") || "0", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);
    const globalFilter = searchParams.get("globalFilter") || "";
    const filtersParam = searchParams.get("filters") || "[]";
    const deleteType = searchParams.get("deleteType") || "SD";
    const sortingParam = searchParams.get("sorting") || "[]";

    const conditions = [];
    const queryParams = [];

    const columnMap = {
      "sku": "pv.sku",
      "size": "pv.size",
      "color": "pv.color",
      "price": "pv.price",
      "stock": "pv.stock",
      "discount": "pv.discount",
      "createdAt": "pv.created_at",
      "product.name": "p.name", 
      "product": "p.name"
    };

    if (deleteType === "SD") {
      conditions.push("pv.deleted_at IS NULL");
    } else {
      conditions.push("pv.deleted_at IS NOT NULL");
    }

    if (globalFilter) {
      queryParams.push(`%${globalFilter}%`);
      const filterIdx = `$${queryParams.length}`;
      conditions.push(`(
        pv.sku::text ILIKE ${filterIdx} OR 
        pv.size::text ILIKE ${filterIdx} OR 
        pv.color::text ILIKE ${filterIdx} OR 
        p.name::text ILIKE ${filterIdx}
      )`);
    }

    try {
      const filters = JSON.parse(filtersParam);
      if (Array.isArray(filters) && filters.length > 0) {
        filters.forEach(({ id, value }) => {
          if (columnMap[id] && value) {
            queryParams.push(`%${value}%`);
            const filterIdx = `$${queryParams.length}`;
            conditions.push(`${columnMap[id]}::text ILIKE ${filterIdx}`);
          }
        });
      }
    } catch (e) {
      console.error("Column Filter Parse Error:", e);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    let orderByClause = "ORDER BY pv.created_at DESC";
    try {
      const sorting = JSON.parse(sortingParam);
      if (Array.isArray(sorting) && sorting.length > 0) {
        const { id, desc } = sorting[0];
        
        if (columnMap[id]) {
          orderByClause = `ORDER BY ${columnMap[id]} ${desc ? 'DESC' : 'ASC'}`;
        }
      }
    } catch (e) {
      console.error("Sort Parse Error:", e);
    }

    queryParams.push(size);
    const limitIdx = `$${queryParams.length}`;
    queryParams.push(start);
    const offsetIdx = `$${queryParams.length}`;

    const queryText = `
      SELECT 
        pv.id AS "_id", pv.sku, pv.size, pv.color, pv.price, pv.stock, pv.discount,
        pv.created_at AS "createdAt",
        COALESCE(
          (SELECT array_agg(media_id::text) FROM variant_images WHERE variant_id = pv.id), 
          '{}'::text[]
        ) AS catalog,
        json_build_object('_id', p.id, 'name', p.name, 'slug', p.slug) AS product,
        COUNT(*) OVER() as total_count
      FROM product_variants pv
      INNER JOIN products p ON pv.product_id = p.id
      ${whereClause}
      ${orderByClause}
      LIMIT ${limitIdx} OFFSET ${offsetIdx}
    `;

    const data = await sql.query(queryText, queryParams);
    
    const totalRowCount = data.length > 0 ? parseInt(data[0].total_count) : 0;
    const cleanedData = data.map(({ total_count, ...rest }) => rest);

    return NextResponse.json({ 
      type: "success", 
      data: cleanedData, 
      meta: { totalRowCount } 
    });

  } catch (err) {
    console.error("VARIANT_LIST_ERROR:", err);
    return NextResponse.json({ type: "error", msg: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const mediaArray = Array.isArray(body.media) ? body.media : [];

    const [variant] = await sql`
      INSERT INTO product_variants (
        product_id, size, color, sku, price, stock, discount
      ) VALUES (
        ${body.productId}, ${body.size}, ${body.color}, ${body.sku}, 
        ${Number(body.price) || 0}, ${Number(body.stock) || 0}, 
        ${Number(body.discount) || 0}
      )
      RETURNING id AS "_id", product_id AS product, size, color, sku, price, stock, discount
    `;

    if (mediaArray.length > 0) {
      await sql`
        INSERT INTO variant_images (variant_id, media_id) 
        SELECT ${variant._id}, unnest(${mediaArray}::uuid[])
      `;
    }

    return NextResponse.json({ type: "success", msg: "Variant Created successfully", data: variant }, { status: 201 });
  } catch (err) {
    if (err.code === '23505') return NextResponse.json({ type: "error", msg: "SKU already exists." }, { status: 400 });
    console.error("CREATE_VARIANT_ERROR:", err);
    return NextResponse.json({ type: "error", msg: err.message }, { status: 500 });
  }
}