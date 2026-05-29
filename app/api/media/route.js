import { sql } from "@/lib/sql";
import { isAuthentic } from "@/utils/role";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const auth = await isAuthentic("admin", request);
    if (!auth.isAuth) return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");

    if (idsParam) {
      const idsArray = idsParam.split(",").filter(id => id.length > 0);
      const images = await sql`SELECT id as _id, * FROM media WHERE id = ANY(${idsArray})`;
      return NextResponse.json({
        type: "success",
        images: images,
        mediaData: images
      });
    }

    const page = Math.max(0, parseInt(searchParams.get("page"), 10) || 0);
    const limit = Math.max(1, parseInt(searchParams.get("size") || searchParams.get("limit"), 10) || 12);
    const offset = page * limit;
    
    const deleteType = searchParams.get("deleteType");
    const isDeleted = deleteType === "PD";

    const mediaData = await sql`
      SELECT id as _id, *, COUNT(*) OVER() as total_count 
      FROM media 
      WHERE (deleted_at IS NOT NULL) = ${isDeleted}
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalMedia = mediaData.length > 0 ? parseInt(mediaData[0].total_count) : 0;

    return NextResponse.json({
      type: "success",
      images: mediaData, 
      mediaData: mediaData,
      totalMedia: totalMedia,
      hasMore: (offset + limit) < totalMedia,
      currentPage: page
    });

  } catch (error) {
    console.error("Error in GET Media:", error);
    return NextResponse.json({ type: "error", msg: "Internal Server Error" }, { status: 500 });
  }
}