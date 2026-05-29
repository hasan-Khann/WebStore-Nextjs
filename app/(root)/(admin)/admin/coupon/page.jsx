"use client";

import React, { useCallback, useMemo } from "react";
import BreadCrumb from "@/components/application/admin/breadcrumb";
import DataTableWrapper from "@/components/application/admin/datatablewrapper";
import DeleteAction from "@/components/application/admin/deleteaction";
import EditAction from "@/components/application/admin/editaction";
import { Button } from "@/components/ui/button";
import { 
  ADMIN_COUPON, 
  ADMIN_COUPON_ADD, 
  ADMIN_COUPON_UPDATE, 
  ADMIN_DASHBOARD, 
  ADMIN_COUPON_TRASH 
} from "@/routes/AdminPanelRoute";
import { DT_COUPON_CONFIG } from "@/lib/column";
import Link from "next/link";
import { Plus, Trash2, TicketPercent, Zap } from "lucide-react";
import { columnConfig } from "@/utils/colmnUtils";

export default function ShowCoupons() {
  const column = useMemo(() => columnConfig([...DT_COUPON_CONFIG], true, true, false), []);

  const action = useCallback((row, deleteType, handleDelete) => [
    <EditAction key="edit" href={ADMIN_COUPON_UPDATE(row.original._id)} />,
    <DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType} />,
  ], []);

  const breadCrumbData = [
    { href: ADMIN_DASHBOARD, label: "Home" },
    { label: "Coupons" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50/30 dark:bg-transparent pb-10">
      {/* Sticky Action Bar */}
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 md:top-[72px] z-[40] px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex flex-col">
          <BreadCrumb breadCrumbData={breadCrumbData} />
          <h1 className="text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Promotional Coupons</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="rounded-lg h-9 border-zinc-200 dark:border-zinc-800">
             <Link href={ADMIN_COUPON_TRASH} className="flex items-center gap-2">
               <Trash2 size={16} className="text-zinc-500" />
               <span className="hidden md:inline text-[11px] font-bold uppercase tracking-wider">Trash</span>
             </Link>
          </Button>
          <Button size="sm" asChild className="bg-indigo-600 hover:bg-indigo-700 rounded-lg h-9 shadow-md shadow-indigo-100 dark:shadow-none">
            <Link href={ADMIN_COUPON_ADD} className="flex items-center gap-2">
              <Plus size={18} strokeWidth={2.5} />
              <span className="font-bold text-[11px] uppercase tracking-wider">New Coupon</span>
            </Link>
          </Button>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto p-4 md:p-8">
        {/* Header Summary */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-5 w-5 rounded bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Zap size={12} className="text-indigo-600" />
              </div>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Growth Tools</p>
            </div>
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">Active Campaign Manager</h2>
            <p className="text-xs text-zinc-500 mt-1 max-w-md leading-relaxed">
              Create, monitor, and manage discount codes. Changes made here reflect instantly at checkout for your customers.
            </p>
          </div>

          <div className="flex items-center gap-6 px-6 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Active Codes</span>
                <span className="text-lg font-black text-zinc-800 dark:text-zinc-100 italic">LIVE</span>
             </div>
             <div className="h-8 w-[1px] bg-zinc-100 dark:bg-zinc-800" />
             <TicketPercent className="text-indigo-500 opacity-20" size={32} />
          </div>
        </div>

        {/* DataTable Container */}
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <DataTableWrapper
            fetchUrl="/api/coupon?deleteType=SD"
            columnConfig={column}
            initialPageSize={10}
            queryKey="coupon-live-list"
            deleteEndpoint="/api/coupon/delete"
            deleteType="SD"
            trashView={ADMIN_COUPON_TRASH}
            createAction={action}
          />
        </div>
      </main>
    </div>
  );
}