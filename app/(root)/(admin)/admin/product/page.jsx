"use client";

import React, { useCallback, useMemo } from "react";
import BreadCrumb from "@/components/application/admin/breadcrumb";
import DataTableWrapper from "@/components/application/admin/datatablewrapper";
import DeleteAction from "@/components/application/admin/deleteaction";
import EditAction from "@/components/application/admin/editaction";
import { Button } from "@/components/ui/button";
import { 
  ADMIN_PRODUCT, 
  ADMIN_PRODUCT_ADD, 
  ADMIN_PRODUCT_UPDATE, 
  ADMIN_DASHBOARD, 
  ADMIN_PRODUCT_TRASH 
} from "@/routes/AdminPanelRoute";
import { DT_PRODUCT_CONFIG } from "@/lib/column";
import { columnConfig } from "@/utils/colmnUtils";
import Link from "next/link";
import { Plus, Trash2, Box, Settings2, Sparkles } from "lucide-react";

export default function ShowProduct() {
  const column = useMemo(() => columnConfig(DT_PRODUCT_CONFIG, true, false, false), []);

  const action = useCallback((row, deleteType, handleDelete) => [
    <EditAction key="edit" href={ADMIN_PRODUCT_UPDATE(row.original._id)} />,
    <DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType} />,
  ], []);

  const breadCrumbData = [
    { href: ADMIN_DASHBOARD, label: "Home" },
    { label: "Products" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50/30 dark:bg-transparent pb-10">
      {/* Sticky Action Bar */}
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 md:top-[72px] z-[40] px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex flex-col">
          <BreadCrumb breadCrumbData={breadCrumbData} />
          <h1 className="text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
            Inventory Catalog
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="rounded-lg h-9 border-zinc-200 dark:border-zinc-800">
            <Link href={ADMIN_PRODUCT_TRASH} className="flex items-center gap-2">
              <Trash2 size={16} className="text-zinc-400" />
              <span className="hidden md:inline text-[11px] font-bold uppercase tracking-wider">Trash</span>
            </Link>
          </Button>
          <Button size="sm" asChild className="bg-indigo-600 hover:bg-indigo-700 rounded-lg h-9 shadow-md shadow-indigo-100 dark:shadow-none">
            <Link href={ADMIN_PRODUCT_ADD} className="flex items-center gap-2">
              <Plus size={18} strokeWidth={2.5} />
              <span className="font-bold text-[11px] uppercase tracking-wider">Add Product</span>
            </Link>
          </Button>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto p-4 md:p-8">
        {/* Catalog Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-5 w-5 rounded bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Settings2 size={12} className="text-indigo-600 animate-spin-slow" />
              </div>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Management</p>
            </div>
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">Global Product Ledger</h2>
            <p className="text-xs text-zinc-500 mt-1 max-w-md leading-relaxed">
              Maintain your inventory accuracy, manage pricing tiers, and track stock levels across all regions.
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[11px] font-bold text-zinc-500">
            <Sparkles size={14} className="text-indigo-500" />
            Stock Sync Active
          </div>
        </div>

        {/* DataTable Container */}
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <DataTableWrapper
            fetchUrl="/api/product"
            columnConfig={column}
            initialPageSize={10}
            queryKey="products-live-list"
            exportEndpoint="/api/product/export"
            deleteEndpoint="/api/product/delete"
            deleteType="SD"
            trashView={ADMIN_PRODUCT_TRASH}
            createAction={action}
          />
        </div>
      </main>
    </div>
  );
}