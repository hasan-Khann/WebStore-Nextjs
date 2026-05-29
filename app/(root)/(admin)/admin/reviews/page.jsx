"use client";

import React, { useMemo } from "react";
import DataTableWrapper from "@/components/application/admin/datatablewrapper";
import BreadCrumb from "@/components/application/admin/breadcrumb";
import { DT_REVIEW_CONFIG } from "@/lib/column";
import { columnConfig } from "@/utils/colmnUtils";
import { MessageSquareQuote, Star, Activity } from "lucide-react";
import { ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute";

export default function ReviewList() {
  const columns = useMemo(() => columnConfig(DT_REVIEW_CONFIG, false, false, false), []);
  const breadCrumbData = [{ href: ADMIN_DASHBOARD, label: "Home" }, { label: "Product Reviews" }];

  return (
    <div className="min-h-screen bg-zinc-50/30 dark:bg-transparent pb-10">
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 md:top-[72px] z-[40] px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex flex-col">
          <BreadCrumb breadCrumbData={breadCrumbData} />
          <h1 className="text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Customer Feedback</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-full">
          <Star size={14} className="fill-amber-500 text-amber-500" />
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">Moderation Active</span>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto p-4 md:p-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-5 w-5 rounded bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <MessageSquareQuote size={12} className="text-indigo-600" />
              </div>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Insights</p>
            </div>
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tighter">Experience Logs</h2>
            <p className="text-xs text-zinc-500 mt-1 max-w-md leading-relaxed">
              Monitor customer sentiment, verify purchase reviews, and manage public testimonials.
            </p>
          </div>
          
          <div className="h-12 w-32 hidden md:block opacity-20">
             <Activity className="w-full h-full text-indigo-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <DataTableWrapper
            fetchUrl="/api/review"
            columnConfig={columns}
            queryKey="review-list"
          />
        </div>
      </main>
    </div>
  );
}