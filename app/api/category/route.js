import { NextResponse } from "next/server";
import { sql } from "@/lib/sql";
import { isAuthentic } from "@/utils/role";
import { redis } from "@/lib/rediscache";

export async function GET(request) {
  try {
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const start = parseInt(searchParams.get("start") || "0", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);
    const filters = JSON.parse(searchParams.get("filters") || "[]");
    const globalFilter = searchParams.get("globalFilter") || "";
    const deleteType = searchParams.get("deleteType") || "SD";

    const conditions = [];
    const queryParams = [];

    if (deleteType === "SD") {
      conditions.push("c.deleted_at IS NULL");
    } else if (deleteType === "PD") {
      conditions.push("c.deleted_at IS NOT NULL");
    }

    if (globalFilter) {
      queryParams.push(`%${globalFilter}%`);
      conditions.push(`(c.name ILIKE $${queryParams.length} OR c.slug ILIKE $${queryParams.length})`);
    }

    filters.forEach((f) => {
      if (f?.id && f?.value) {
        queryParams.push(`%${f.value}%`);
        conditions.push(`c.${f.id}::text ILIKE $${queryParams.length}`);
      }
    });

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    queryParams.push(size);
    const limitPlaceholder = `$${queryParams.length}`;
    queryParams.push(start);
    const offsetPlaceholder = `$${queryParams.length}`;

    const query = `
      SELECT 
        c.id as _id, c.name, c.slug, c.created_at, c.updated_at, c.deleted_at,
        m.secure_url AS img_secure_url,
        COUNT(*) OVER() as total_count
      FROM categories c
      LEFT JOIN media m ON c.img_id = m.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}
    `;

    const categories = await sql.query(query, queryParams);
    const totalRowCount = categories.length > 0 ? parseInt(categories[0].total_count) : 0;

    return NextResponse.json({ 
      type: "success", 
      data: categories, 
      meta: { totalRowCount } 
    });

  } catch (err) {
    console.error("LIST_ERROR:", err);
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const { name, slug, img_id } = await request.json();

    if (!name || !slug) return NextResponse.json({ type: "error", msg: "Name and Slug are required" }, { status: 400 });

    const [existing] = await sql`SELECT id FROM categories WHERE slug = ${slug} LIMIT 1`;
    if (existing) return NextResponse.json({ type: "error", msg: "Category slug exists" }, { status: 409 });

    const [category] = await sql`
      INSERT INTO categories (name, slug, img_id)
      VALUES (${name}, ${slug}, ${img_id || null})
      RETURNING *
    `;
    // await redis.del("categories:all"); redis if working

    return NextResponse.json({ 
      type: "success", 
      msg: "Category created", 
      data: category 
    }, { status: 201 });

  } catch (err) {
    console.error("POST_ERROR:", err);
    return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
  }
}

// mongodb
// export async function GET(request) {
//   try {
//     const auth = await isAuthentic("admin", request);
//     if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

//     await connectDB();

//     const searchParams = request.nextUrl.searchParams;
//     const start = parseInt(searchParams.get("start") || "0", 10);
//     const size = parseInt(searchParams.get("size") || "10", 10);
//     const filters = JSON.parse(searchParams.get("filters") || "[]");
//     const globalFilter = searchParams.get("globalFilter") || "";
//     const deleteType = searchParams.get("deleteType") || "SD";

//     const matchQuery = {};
//     if (deleteType === "SD") matchQuery.deletedAt = null;
//     if (deleteType === "PD") matchQuery.deletedAt = { $ne: null };

//     if (globalFilter) {
//       matchQuery.$or = [
//         { name: { $regex: globalFilter, $options: "i" } },
//         { slug: { $regex: globalFilter, $options: "i" } },
//       ];
//     }

//     filters.forEach((f) => {
//       if (f?.id && f?.value) matchQuery[f.id] = { $regex: f.value, $options: "i" };
//     });

//     const aggregatePipeline = [
//       { $match: matchQuery },
//       {
//         $addFields: {
//           imgObjectId: {
//             $cond: {
//               if: { $and: [{ $gt: ["$img", null] }, { $ne: ["$img", ""] }] },
//               then: { $toObjectId: "$img" },
//               else: null
//             }
//           }
//         }
//       },
//       {
//         $lookup: {
//           from: "media", // FIXED: Removed the backtick
//           localField: "imgObjectId",
//           foreignField: "_id",
//           as: "imgData"
//         }
//       },
//       {
//         $unwind: {
//           path: "$imgData",
//           preserveNullAndEmptyArrays: true 
//         }
//       },
//       {
//         $project: {
//           name: 1,
//           slug: 1,
//           img: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           deletedAt: 1,
//           // This will now correctly pull the URL from the media collection
//           img_secure_url: { $ifNull: ["$imgData.secure_url", "$imgData.url", null] }
//         }
//       },
//       { $sort: { createdAt: -1 } },
//       { $skip: start },
//       { $limit: size }
//     ];
    
//     const [categories, totalRowCount] = await Promise.all([
//       Category.aggregate(aggregatePipeline),
//       Category.countDocuments(matchQuery)
//     ]);

//     return NextResponse.json({ type: "success", data: categories, meta: { totalRowCount } });
//   } catch (err) {
//     console.error("LIST_ERROR:", err);
//     return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
//   }
// }

// export async function POST(request) {
//   try {
//     const auth = await isAuthentic("admin", request);
//     if (!auth?.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

//     await connectDB();
//     const { name, slug, img } = await request.json();

//     if (!name || !slug || !img) return NextResponse.json({ type: "error", msg: "All fields are required" }, { status: 400 });

//     const existing = await Category.findOne({ slug }).lean();
//     if (existing) return NextResponse.json({ type: "error", msg: "Category slug exists" }, { status: 409 });

//     const category = await Category.create({ name, slug, img });

//     await redis.del("categories:all");

//     return NextResponse.json({ type: "success", msg: "Category created", data: category }, { status: 201 });
//   } catch (err) {
//     return NextResponse.json({ type: "error", msg: "Server error" }, { status: 500 });
//   }
// }