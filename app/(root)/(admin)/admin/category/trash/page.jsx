"use client";

import React, { useCallback, useMemo } from "react";
import BreadCrumb from "@/components/application/admin/breadcrumb";
import DataTableWrapper from "@/components/application/admin/datatablewrapper";
import DeleteAction from "@/components/application/admin/deleteaction";
import { Button } from "@/components/ui/button";
import { DT_CATEGORY_CONFIG } from "@/lib/column";
import { ADMIN_CATEGORY, ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { columnConfig } from "@/utils/colmnUtils";
import RestoreAction from "@/components/application/admin/restoreaction";

export default function Trash() {
  const column = useMemo(() => columnConfig(DT_CATEGORY_CONFIG, false, false, true), []);

  const action = useCallback((row, deleteType, handleAction) => [
    <RestoreAction key="restore" row={row} handleRestore={handleAction} />,
    <DeleteAction key="delete" handleDelete={handleAction} row={row} deleteType={deleteType} />,
  ], []);

  const breadCrumbData = [
    { href: ADMIN_DASHBOARD, label: "Home" },
    { href: ADMIN_CATEGORY, label: "Categories" },
    { label: "Trash Bin" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50/30 dark:bg-transparent pb-10">
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 md:top-[72px] z-[40] px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="sm" asChild className="rounded-lg h-9 w-9 p-0">
              <Link href={ADMIN_CATEGORY}><ArrowLeft size={18} /></Link>
           </Button>
           <div className="flex flex-col">
            <BreadCrumb breadCrumbData={breadCrumbData} />
            <h1 className="text-sm md:text-base font-bold text-red-600 tracking-tight">Category Trash Bin</h1>
          </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto p-4 md:p-8">
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 rounded-xl p-4 mb-8 flex items-start gap-4">
           <AlertTriangle size={20} className="text-red-600" />
           <div>
             <h3 className="text-sm font-bold text-red-900">Permanent Deletion Warning</h3>
             <p className="text-xs text-red-700/80 mt-0.5">Items deleted here are removed permanently from the database.</p>
           </div>
        </div>

        <DataTableWrapper
          fetchUrl="/api/category?deleteType=PD"
          columnConfig={column}
          queryKey="category-deleted"
          exportEndpoint="/api/category/export"
          deleteEndpoint="/api/category/delete"
          deleteType="PD" 
          createAction={action}
        />
      </main>
    </div>
  );
}