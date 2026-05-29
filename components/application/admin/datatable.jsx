"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, alpha } from "@/node_modules/@mui/material";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { Buttonloading } from "@/components/application/buttonloading";
import { Download, Trash2, RotateCcw } from "lucide-react";
import api from "@/utils/api";
import { toast } from "sonner";

const DataTable = ({ 
  fetchUrl, 
  columnConfig, 
  initialPageSize = 10, 
  queryKey: queryKeyBase, 
  exportEndpoint, 
  deleteEndpoint,
  deleteType = "SD",
  createAction,
  renderDetailPanel
}) => {
  const queryClient = useQueryClient();
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: initialPageSize });
  const [rowSelection, setRowSelection] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, isError, isRefetching } = useQuery({
    queryKey: [queryKeyBase, pagination, sorting, columnFilters, globalFilter],
    queryFn: async () => {
      const { data } = await api.get(fetchUrl, {
        params: {
          start: pagination.pageIndex * pagination.pageSize,
          size: pagination.pageSize,
          filters: JSON.stringify(columnFilters),
          sorting: JSON.stringify(sorting),
          globalFilter,
        }
      });
      return data;
    },
  });

  const handleBulkAction = async (ids, type) => {
    if (!deleteEndpoint) return;
    setIsProcessing(true);
    try {
      await api.put(deleteEndpoint, { Ids: ids, deleteType: type });
      toast.success("Operation successful");
      setRowSelection({});
      queryClient.invalidateQueries([queryKeyBase]);
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    if (!exportEndpoint) return;
    setIsExporting(true);
    try {
      const { data: resp } = await api.get(exportEndpoint);
      if (!resp.data?.length) return toast.error("No data found");
      
      const headers = Object.keys(resp.data[0]).join(",");
      const csv = [headers, ...resp.data.map(row => 
        Object.values(row).map(v => `"${v}"`).join(",")
      )].join("\n");
      
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${queryKeyBase}.csv`;
      a.click();
    } catch (err) { toast.error("Export failed"); } finally { setIsExporting(false); }
  };

  const table = useMaterialReactTable({
    columns: columnConfig,
    data: data?.data ?? [],
    enableRowSelection: true,
    getRowId: (row) => row._id,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    rowCount: data?.meta?.totalRowCount ?? 0,
    state: { columnFilters, globalFilter, pagination, sorting, rowSelection, isLoading, showAlertBanner: isError, showProgressBars: isRefetching },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    
    // Original Styles
    muiTablePaperProps: { elevation: 0, sx: { backgroundColor: 'transparent', backgroundImage: 'none' }},
    muiTopToolbarProps: { sx: { backgroundColor: 'transparent', borderBottom: '1px solid', borderColor: 'divider' }},
    muiBottomToolbarProps: { sx: { backgroundColor: 'transparent', borderTop: '1px solid', borderColor: 'divider' }},
    muiTableHeadCellProps: {
      sx: (theme) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#09090b' : '#f8fafc',
        color: theme.palette.mode === 'dark' ? '#71717a' : '#64748b',
        fontWeight: '900', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', paddingY: '16px',
      }),
    },
    muiTableBodyCellProps: {
      sx: (theme) => ({
        fontSize: '13px', color: theme.palette.mode === 'dark' ? '#e4e4e7' : '#1e293b',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
      }),
    },

    renderTopToolbarCustomActions: () => {
      const selectedIds = Object.keys(rowSelection);
      return (
        <Box sx={{ display: 'flex', gap: '0.5rem', p: '8px' }}>
          {exportEndpoint && (
            <Buttonloading 
              loading={isExporting} onClick={handleExport} variant="outline"
              className="h-8 text-[10px] font-bold uppercase bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:bg-zinc-50"
              text={<div className="flex items-center gap-2"><Download size={14}/> Export CSV</div>} 
            />
          )}
          {selectedIds.length > 0 && deleteEndpoint && (
            <>
              {deleteType === "PD" && (
                <Buttonloading 
                  loading={isProcessing} onClick={() => handleBulkAction(selectedIds, "RSD")}
                  className="h-8 text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600 border-emerald-200"
                  text={<div className="flex items-center gap-2"><RotateCcw size={14}/> Restore</div>} 
                />
              )}
              <Buttonloading 
                loading={isProcessing} onClick={() => handleBulkAction(selectedIds, deleteType)}
                className="h-8 text-[10px] font-bold uppercase bg-red-50 text-red-600 border-red-200"
                text={<div className="flex items-center gap-2"><Trash2 size={14}/> {deleteType === "PD" ? "Permanent Delete" : "Trash"}</div>} 
              />
            </>
          )}
        </Box>
      );
    },
    renderDetailPanel,
    positionActionsColumn: "last",
    enableColumnActions: false,
    enableRowActions: !!createAction,
    renderRowActionMenuItems: ({ row }) => createAction?.(row, deleteType, handleBulkAction),
  });

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
      <MaterialReactTable table={table} />
    </div>
  );
};

export default DataTable;