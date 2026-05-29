"use client";

import React, { useCallback, useMemo } from "react";
import BreadCrumb from "@/components/application/admin/breadcrumb";
import DataTableWrapper from "@/components/application/admin/datatablewrapper";
import DeleteAction from "@/components/application/admin/deleteaction";
import EditAction from "@/components/application/admin/editaction";
import { Button } from "@/components/ui/button";
import { ADMIN_CATEGORY_ADD, ADMIN_CATEGORY_EDIT, ADMIN_CATEGORY_TRASH, ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { DT_CATEGORY_CONFIG } from "@/lib/column"; 
import { columnConfig } from "@/utils/colmnUtils";

export default function ShowCategory() {
  const column = useMemo(() => columnConfig(DT_CATEGORY_CONFIG), []);

  const action = useCallback((row, deleteType, handleAction) => [
    <EditAction key="edit" href={ADMIN_CATEGORY_EDIT(row.original._id)} />,
    <DeleteAction key="delete" handleDelete={handleAction} row={row} deleteType={deleteType} />,
  ], []);

  const breadCrumbData = [
    { href: ADMIN_DASHBOARD, label: "Home" },
    { label: "Categories" }
  ];

  return (
    <div className="min-h-screen bg-zinc-50/30 dark:bg-transparent pb-10">
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 md:top-[72px] z-[40] px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex flex-col">
          <BreadCrumb breadCrumbData={breadCrumbData} />
          <h1 className="text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Product Categories</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="rounded-lg h-9 border-zinc-200 dark:border-zinc-800">
             <Link href={ADMIN_CATEGORY_TRASH} className="flex items-center gap-2">
               <Trash2 size={16} className="text-zinc-500" />
               <span className="hidden md:inline">View Trash</span>
             </Link>
          </Button>
          <Button size="sm" asChild className="bg-indigo-600 hover:bg-indigo-700 rounded-lg h-9">
            <Link href={ADMIN_CATEGORY_ADD} className="flex items-center gap-2">
              <Plus size={18} strokeWidth={2.5} />
              <span className="font-bold text-[11px] uppercase tracking-wider">New Category</span>
            </Link>
          </Button>
        </div>
      </div>
      
      <main className="max-w-[1600px] mx-auto p-4 md:p-8">
        <DataTableWrapper
          fetchUrl="/api/category"
          columnConfig={column}
          queryKey="category-data"
          exportEndpoint="/api/category/export"
          deleteEndpoint="/api/category/delete"
          deleteType="SD"
          createAction={action}
        />
      </main>
    </div>
  );
}