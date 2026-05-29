"use client";

import React, { useCallback, useMemo } from "react";
import BreadCrumb from "@/components/application/admin/breadcrumb";
import DataTableWrapper from "@/components/application/admin/datatablewrapper";
import DeleteAction from "@/components/application/admin/deleteaction";
import EditAction from "@/components/application/admin/editaction";
import RestoreAction from "@/components/application/admin/restoreaction";
import { Button } from "@/components/ui/button";
import { 
  ADMIN_PRODUCT, 
  ADMIN_PRODUCT_UPDATE, 
  ADMIN_DASHBOARD, 
  ADMIN_PRODUCT_TRASH 
} from "@/routes/AdminPanelRoute";
import { DT_PRODUCT_CONFIG } from "@/lib/column";
import { columnConfig } from "@/utils/colmnUtils";
import Link from "next/link";
import { ArrowLeft, Trash2, AlertTriangle, RefreshCcw } from "lucide-react";

export default function ProductTrash() {
  const column = useMemo(() => columnConfig(DT_PRODUCT_CONFIG, false, false, true), []);

  const action = useCallback((row, deleteType, handleDelete) => [
    <EditAction key="edit" href={ADMIN_PRODUCT_UPDATE(row.original._id)} />,
    <RestoreAction key="restore" row={row} handleRestore={handleDelete} />,
    <DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType} />,
  ], []);

  const breadCrumbData = [
    { href: ADMIN_DASHBOARD, label: "Home" },
    { href: ADMIN_PRODUCT, label: "Products" },
    { label: "Trash Bin" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50/30 dark:bg-transparent pb-10">
      {/* Sticky Action Bar */}
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 md:top-[72px] z-[40] px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="rounded-lg h-9 w-9 p-0">
            <Link href={ADMIN_PRODUCT}><ArrowLeft size={18} /></Link>
          </Button>
          <div className="flex flex-col">
            <BreadCrumb breadCrumbData={breadCrumbData} />
            <h1 className="text-sm md:text-base font-bold text-red-600 dark:text-red-400 tracking-tight flex items-center gap-2">
              <Trash2 size={16} /> Archive Repository
            </h1>
          </div>
        </div>

        <Button variant="outline" size="sm" asChild className="rounded-lg h-9 border-zinc-200 dark:border-zinc-800">
          <Link href={ADMIN_PRODUCT} className="text-[11px] font-bold uppercase tracking-wider">
            Active Catalog
          </Link>
        </Button>
      </div>

      <main className="max-w-[1600px] mx-auto p-4 md:p-8">
        {/* Danger Zone Callout */}
        <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-xl p-4 mb-8 flex items-start gap-4">
          <div className="bg-red-100 dark:bg-red-900/40 p-2 rounded-lg text-red-600 dark:text-red-400">
            <AlertTriangle size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-red-900 dark:text-red-200 uppercase tracking-tight">Data Retention Zone</h3>
            <p className="text-[11px] text-red-700/80 dark:text-red-400/70 font-medium leading-relaxed">
              Items here are staged for permanent deletion. Restoring a product will return it to the active catalog with its original SKU and stock data intact.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Soft-Deleted Records</h2>
            <RefreshCcw size={14} className="text-zinc-300" />
          </div>

          <DataTableWrapper
            fetchUrl="/api/product?deleteType=PD" 
            columnConfig={column}
            initialPageSize={10}
            queryKey="products-deleted-list"
            exportEndpoint="/api/product/export"
            deleteEndpoint="/api/product/delete"
            deleteType="PD" 
            trashView={ADMIN_PRODUCT_TRASH}
            createAction={action}
          />
        </div>
      </main>
    </div>
  );
}