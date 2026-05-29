"use client";

import React, { useMemo, useCallback } from "react";
import DataTableWrapper from "@/components/application/admin/datatablewrapper";
import BreadCrumb from "@/components/application/admin/breadcrumb";
import { DT_USER_CONFIG } from "@/lib/column";
import { columnConfig } from "@/utils/colmnUtils";
import { EditRoleDialog } from "@/components/application/admin/roledialog";
import { MenuItem, ListItemIcon, ListItemText } from "@/node_modules/@mui/material";
import { ShieldCheck, Users, Fingerprint } from "lucide-react";
import { ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute";

export default function UserList() {
  const columns = useMemo(() => columnConfig(DT_USER_CONFIG, false, false, false), []);

  const renderUserActions = useCallback((row) => [
    <EditRoleDialog
      key={`edit-${row.original._id}`}
      userId={row.original._id}
      currentRole={row.original.role}
      trigger={
        <MenuItem sx={{ py: 1.5 }}>
          <ListItemIcon><ShieldCheck size={18} className="text-indigo-600" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '13px', fontWeight: 600 }}>
            Update Permissions
          </ListItemText>
        </MenuItem>
      }
    />
  ], []);

  const breadCrumbData = [{ href: ADMIN_DASHBOARD, label: "Home" }, { label: "Users" }];

  return (
    <div className="min-h-screen bg-zinc-50/30 dark:bg-transparent pb-10">
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 md:top-[72px] z-[40] px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex flex-col">
          <BreadCrumb breadCrumbData={breadCrumbData} />
          <h1 className="text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Identity Management</h1>
        </div>
        <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <Fingerprint size={16} className="text-zinc-400" />
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto p-4 md:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-5 w-5 rounded bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Users size={12} className="text-indigo-600" />
            </div>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Security</p>
          </div>
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tighter">Registered Members</h2>
          <p className="text-xs text-zinc-500 mt-1 max-w-md">Assign administrative privileges and monitor user account status.</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <DataTableWrapper
            fetchUrl="/api/user"
            columnConfig={columns}
            queryKey="user-list"
            createAction={renderUserActions}
          />
        </div>
      </main>
    </div>
  );
}