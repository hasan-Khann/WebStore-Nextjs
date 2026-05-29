import { NextResponse } from "next/server";
import { sql } from "@/lib/sql";
import { isAuthentic } from "@/utils/role";

const isValidUUID = (id) => 
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export async function PUT(request) {
  try {
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) {
      return NextResponse.json({ type: "error", msg: "Unauthorized Access" }, { status: 401 });
    }

    const { Ids = [], deleteType } = await request.json();

    if (!Array.isArray(Ids) || !Ids.length) {
      return NextResponse.json({ type: "error", msg: "No records selected" }, { status: 400 });
    }

    const validIds = Ids.filter(isValidUUID);
    if (!validIds.length) {
      return NextResponse.json({ type: "error", msg: "Invalid ID format detected" }, { status: 400 });
    }

    // Handle Permanent Delete (PD)
    if (deleteType === "PD") {
      // postgres.js handles arrays cleanly
      const result = await sql`DELETE FROM coupons WHERE id = ANY(${validIds})`;
      return NextResponse.json({
        type: "success",
        msg: `${result.count || validIds.length} Coupons permanently removed from database`,
      });
    }

    // Handle Soft Delete (SD) and Restore (RSD)
    if (["SD", "RSD"].includes(deleteType)) {
      const isSoftDelete = deleteType === "SD";
      
      const result = await sql`
        UPDATE coupons 
        SET 
          deleted_at = ${isSoftDelete ? sql`CURRENT_TIMESTAMP` : null},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ANY(${validIds})
      `;

      if (result.count === 0) {
        return NextResponse.json({ type: "error", msg: "No matching coupons found" }, { status: 404 });
      }

      return NextResponse.json({
        type: "success",
        msg: isSoftDelete 
          ? `${result.count} Coupons moved to trash bin` 
          : `${result.count} Coupons successfully restored`,
      });
    }

    return NextResponse.json({ type: "error", msg: "Invalid operation type" }, { status: 400 });

  } catch (err) {
    console.error("BULK_COUPON_OPERATION_ERROR:", err);
    return NextResponse.json({ type: "error", msg: "Server synchronization failed" }, { status: 500 });
  }
}