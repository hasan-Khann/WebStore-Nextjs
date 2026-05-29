"use client";

import React, { useMemo, useCallback } from "react";
import DataTableWrapper from "@/components/application/admin/datatablewrapper";
import BreadCrumb from "@/components/application/admin/breadcrumb";
import { DT_ORDER_CONFIG } from "@/lib/column";
import { columnConfig } from "@/utils/colmnUtils";
import { MenuItem, ListItemIcon, ListItemText } from "@/node_modules/@mui/material";
import { Eye, Truck, ArrowUpRight, PackageCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { EditOrderDialog } from "@/components/application/admin/editstatusdialog";
import { ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute";

export default function OrderList() {
  const router = useRouter();
  
  const columns = useMemo(() => columnConfig(DT_ORDER_CONFIG, false, false, false), []);

  const renderOrderActions = useCallback((row, refetch) => [
    <MenuItem 
      key="view" 
      onClick={() => router.push(`/admin/orders/${row.original._id}`)}
      sx={{ py: 1.5 }}
    >
      <ListItemIcon><Eye size={18} className="text-zinc-500" /></ListItemIcon>
      <ListItemText primaryTypographyProps={{ fontSize: '13px', fontWeight: 600 }}>
        View Details
      </ListItemText>
    </MenuItem>,

    <EditOrderDialog
      key="edit-status"
      order={row.original}
      refetch={refetch} 
      trigger={
        <MenuItem sx={{ py: 1.5 }}>
          <ListItemIcon><Truck size={18} className="text-indigo-600" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '13px', fontWeight: 600 }}>
            Update Fulfillment
          </ListItemText>
        </MenuItem>
      }
    />
  ], [router]);

  const breadCrumbData = [
    { href: ADMIN_DASHBOARD, label: "Home" },
    { label: "Sales Orders" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50/30 dark:bg-transparent pb-10">
      {/* Sticky Header Bar */}
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 md:top-[72px] z-[40] px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex flex-col">
          <BreadCrumb breadCrumbData={breadCrumbData} />
          <h1 className="text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
            Logistics & Fulfillment
          </h1>
        </div>

        <div className="flex items-center gap-4">
           <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Live Processing</span>
              </div>
           </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto p-4 md:p-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-5 w-5 rounded bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <PackageCheck size={12} className="text-indigo-600" />
              </div>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Operations</p>
            </div>
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tighter">Order Pipeline</h2>
            <p className="text-xs text-zinc-500 mt-1 max-w-md leading-relaxed">
              Manage incoming transactions, update shipping statuses, and monitor customer fulfillment cycles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors">
              <ArrowUpRight size={20} />
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-all duration-300">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Order Ledger</h3>
          </div>
          
          <DataTableWrapper
            fetchUrl="/api/order"
            columnConfig={columns}
            queryKey="order-list"
            createAction={renderOrderActions}
          />
        </div>
      </main>
    </div>
  );
}