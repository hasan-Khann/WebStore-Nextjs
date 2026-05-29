import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAuthentic } from "@/utils/role";
import Order from "@/models/Order.models";
import ProductVariant from "@/models/ProductVariant.models";

export async function GET(request) {
  try {
    const auth = await isAuthentic("admin", request);
    if (!auth?.isAuth) {
      return NextResponse.json({ type: "error", msg: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [stats, lowStockVariants] = await Promise.all([
      Order.aggregate([
        {
          $facet: {
            monthlyRevenue: [
              { $match: { orderStatus: { $ne: "cancelled" } } },
              {
                $group: {
                  _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" }
                  },
                  revenue: { $sum: "$total" },
                  ordersCount: { $sum: 1 }
                }
              },
              { $sort: { "_id.year": 1, "_id.month": 1 } },
              { $limit: 12 }
            ],
            orderStatusCounts: [
              {
                $group: {
                  _id: "$orderStatus",
                  count: { $sum: 1 }
                }
              }
            ]
          }
        }
      ]),

      ProductVariant.find({
        $and: [
          { $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] },
          { stock: { $lt: 10 } }
        ]
      })
      .select("_id sku stock size color price")
      .sort({ stock: 1 })
      .limit(8)
      .lean()
    ]);

    const result = stats[0];
    
    const formattedRevenue = result.monthlyRevenue.map((item) => {
      const date = new Date(item._id.year, item._id.month - 1);
      return {
        name: date.toLocaleString('default', { month: 'short' }),
        revenue: item.revenue,
        orders: item.ordersCount,
      };
    });

    const statusMap = result.orderStatusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    return NextResponse.json({
      type: "success",
      data: {
        revenueChart: formattedRevenue,
        statusDistribution: statusMap,
        lowStockAlerts: lowStockVariants.map(v => ({
          ...v,
          _id: v._id.toString()
        })),
      }
    });

  } catch (err) {
    console.error("Dashboard API error:", err);
    return NextResponse.json({ type: "error", msg: "Server Error" }, { status: 500 });
  }
}