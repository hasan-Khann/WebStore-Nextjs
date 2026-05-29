"use client";

import React, { useCallback, useMemo } from "react";
import BreadCrumb from "@/components/application/admin/breadcrumb";
import DataTableWrapper from "@/components/application/admin/datatablewrapper";
import DeleteAction from "@/components/application/admin/deleteaction";
import RestoreAction from "@/components/application/admin/restoreaction";
import { Button } from "@/components/ui/button";
import { 
  ADMIN_DASHBOARD, 
  ADMIN_PRODUCT_VARIANT, 
  ADMIN_PRODUCT_VARIANT_TRASH 
} from "@/routes/AdminPanelRoute";
import { DT_VARIANT_CONFIG } from "@/lib/column";
import Link from "next/link";
import { ArrowLeft, Trash2, AlertTriangle, RefreshCw } from "lucide-react";

export default function VariantTrash() {
  const columns = useMemo(() => DT_VARIANT_CONFIG, []);

  const action = useCallback((row, deleteType, handleDelete) => [
    <RestoreAction key="restore" row={row} handleRestore={handleDelete} />,
    <DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType} />,
  ], []);

  const breadCrumbData = [
    { href: ADMIN_DASHBOARD, label: "Home" },
    { href: ADMIN_PRODUCT_VARIANT, label: "Variants" },
    { label: "Trash" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50/30 dark:bg-transparent pb-10">
      {/* Sticky Action Bar */}
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 md:top-[72px] z-[40] px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="rounded-lg h-9 w-9 p-0">
            <Link href={ADMIN_PRODUCT_VARIANT}><ArrowLeft size={18} /></Link>
          </Button>
          <div className="flex flex-col">
            <BreadCrumb breadCrumbData={breadCrumbData} />
            <h1 className="text-sm md:text-base font-bold text-red-600 dark:text-red-400 tracking-tight flex items-center gap-2">
              <Trash2 size={16} /> SKU Archive
            </h1>
          </div>
        </div>

        <Button variant="outline" size="sm" asChild className="rounded-lg h-9 border-zinc-200 dark:border-zinc-800">
          <Link href={ADMIN_PRODUCT_VARIANT} className="text-[11px] font-bold uppercase tracking-wider">
            Active SKUs
          </Link>
        </Button>
      </div>

      <main className="max-w-[1600px] mx-auto p-4 md:p-8">
        {/* Warning Callout */}
        <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-xl p-4 mb-8 flex items-start gap-4">
          <div className="bg-red-100 dark:bg-red-900/40 p-2 rounded-lg text-red-600 dark:text-red-400">
            <AlertTriangle size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-red-900 dark:text-red-200 uppercase tracking-tight">Recovery Center</h3>
            <p className="text-[11px] text-red-700/80 dark:text-red-400/70 font-medium leading-relaxed">
              Items here are staged for permanent purging. Restoring a variant will re-enable its stock tracking and visibility across the storefront.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Purge List</h2>
            <RefreshCw size={14} className="text-zinc-300" />
          </div>

          <DataTableWrapper
            fetchUrl="/api/product-variant?deleteType=PD"
            columnConfig={columns}
            queryKey="variants-deleted-list"
            exportEndpoint="/api/product-variant/export"
            deleteEndpoint="/api/product-variant/delete"
            deleteType="PD"
            trashView={ADMIN_PRODUCT_VARIANT_TRASH}
            createAction={action}
          />
        </div>
      </main>
    </div>
  );
}