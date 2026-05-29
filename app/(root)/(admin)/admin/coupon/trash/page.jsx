"use client";

import React, { useCallback, useMemo } from "react";
import BreadCrumb from "@/components/application/admin/breadcrumb";
import DataTableWrapper from "@/components/application/admin/datatablewrapper";
import DeleteAction from "@/components/application/admin/deleteaction";
import RestoreAction from "@/components/application/admin/restoreaction";
import { Button } from "@/components/ui/button";
import { 
  ADMIN_COUPON, 
  ADMIN_DASHBOARD 
} from "@/routes/AdminPanelRoute";
import { DT_COUPON_CONFIG } from "@/lib/column";
import Link from "next/link";
import { ArrowLeft, Trash2, AlertTriangle, RefreshCcw } from "lucide-react";
import { columnConfig } from "@/utils/colmnUtils";

export default function CouponTrash() {
  // Use 'true' for the third parameter if it handles the 'deleted' column state
  const column = useMemo(() => columnConfig(DT_COUPON_CONFIG, false, false, true), []);

  const action = useCallback((row, deleteType, handleDelete) => [
    <RestoreAction key="restore" row={row} handleRestore={handleDelete} />,
    <DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType} />,
  ], []);

  const breadCrumbData = [
    { href: ADMIN_DASHBOARD, label: "Home" },
    { href: ADMIN_COUPON, label: "Coupons" },
    { label: "Trash Bin" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50/30 dark:bg-transparent pb-10">
      {/* Sticky Action Bar */}
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 md:top-[72px] z-[40] px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            asChild 
            className="rounded-lg h-9 w-9 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Link href={ADMIN_COUPON}>
              <ArrowLeft size={18} />
            </Link>
          </Button>
          <div className="flex flex-col">
            <BreadCrumb breadCrumbData={breadCrumbData} />
            <h1 className="text-sm md:text-base font-bold text-red-600 dark:text-red-400 tracking-tight flex items-center gap-2">
              <Trash2 size={16} /> Coupon Trash Bin
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Button 
            variant="outline" 
            size="sm" 
            asChild 
            className="rounded-lg h-9 border-zinc-200 dark:border-zinc-800 hidden md:flex"
          >
            <Link href={ADMIN_COUPON} className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">
              Active Coupons
            </Link>
          </Button>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto p-4 md:p-8">
        {/* Warning Callout */}
        <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-xl p-4 mb-8 flex items-start gap-4 shadow-sm">
           <div className="bg-red-100 dark:bg-red-900/40 p-2 rounded-lg text-red-600 dark:text-red-400 shadow-inner">
              <AlertTriangle size={20} />
           </div>
           <div className="space-y-1">
              <h3 className="text-sm font-bold text-red-900 dark:text-red-200 uppercase tracking-tight">Critical Data Management</h3>
              <p className="text-[11px] text-red-700/80 dark:text-red-400/70 font-medium leading-relaxed">
                You are viewing coupons marked for deletion. Restoring a coupon will make it immediately active for customers again. Permanent deletion (PD) cannot be undone.
              </p>
           </div>
        </div>

        {/* DataTable Container */}
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Archived Records</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
              <RefreshCcw size={12} className="animate-spin-slow" />
              Auto-sync Active
            </div>
          </div>
          
          <DataTableWrapper
            fetchUrl="/api/coupon?deleteType=PD"
            columnConfig={column}
            initialPageSize={10}
            queryKey="coupon-deleted-list"
            deleteEndpoint="/api/coupon/delete"
            deleteType="PD"
            createAction={action}
          />
        </div>
      </main>
    </div>
  );
}