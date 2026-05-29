"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import QuickAdd from "./QuickAdd";
import { LatestOrder } from "./latestOrder";
import { OrderStatus } from "./orderstatus";
import { RevenueChart } from "./revenue";
import { LatestReviews } from "./latestreviews";
import { AlertTriangle, PackageSearch, Loader2, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await api.get("/api/dashboard");
        if (res.data.type === "success") {
          setDashboardData(res.data.data);
        }
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const lowStock = dashboardData?.lowStockAlerts || [];

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#09090b]">
      <main className="max-w-[1400px] mx-auto p-4 sm:p-6 md:p-8 lg:p-10 space-y-6 md:space-y-10">

        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Dashboard
            </h1>
            <p className="text-zinc-500 text-xs sm:text-sm mt-1">
              Manage your store inventory and sales.
            </p>
          </div>

          <div className="w-full sm:w-auto shrink-0">
            <QuickAdd />
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center p-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <Loader2 className="animate-spin text-zinc-400" size={24} />
          </div>
        ) : (
          lowStock.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <AlertTriangle size={18} className="text-red-500 shrink-0" />
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-red-600/80 dark:text-red-400">
                  Inventory Alerts
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {lowStock.map((variant) => (
                  <Link 
                    key={variant._id} 
                    href={`/admin/product-variant/update/${variant._id}`}
                    className="flex flex-col p-5 bg-rose-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-2xl hover:bg-rose-100/60 dark:hover:bg-red-950/20 transition-all shadow-sm group w-full min-w-0"
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg text-red-500 shadow-sm shrink-0">
                        <PackageSearch size={20} />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded bg-red-600 text-white uppercase tracking-wide truncate">
                        {variant.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">
                        {variant.sku}
                      </h4>
                      <p className="text-xs text-zinc-500 font-medium truncate">
                        {variant.size} • {variant.color || 'Default'}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-red-200/50 dark:border-red-900/20 flex justify-between items-center">
                      <span className="text-base sm:text-lg font-black text-red-600 dark:text-red-500">
                        {variant.stock} <span className="text-xs font-bold uppercase text-red-400">units</span>
                      </span>
                      <ArrowRight size={14} className="text-red-300 group-hover:translate-x-1 transition-transform runtime-gpu" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        )}

        <section className="grid gap-6 grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm w-full min-w-0">
            <RevenueChart data={dashboardData?.revenueChart || []} loading={loading} />
          </div>
          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm w-full min-w-0">
            <OrderStatus distribution={dashboardData?.statusDistribution || {}} loading={loading} />
          </div>
        </section>

        <section className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <div className="space-y-4 min-w-0 w-full">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 px-1">Recent Orders</h3>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
               <LatestOrder />
            </div>
          </div>
          <div className="space-y-4 min-w-0 w-full">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 px-1">Recent Reviews</h3>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 shadow-sm">
              <LatestReviews />
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}