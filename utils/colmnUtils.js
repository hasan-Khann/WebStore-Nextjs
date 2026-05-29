export const columnConfig = (columns, CreatedAt = false, UpdatedAt = false, DeletedAt = false) => {
  const columnFill = Array.isArray(columns) ? [...columns] : [];

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (CreatedAt) {
    columnFill.push({
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ getValue }) => (
        <div className="text-[11px] text-slate-500 font-medium bg-slate-50 px-2 py-1 rounded border border-slate-100 inline-block">
            {formatDate(getValue())}
        </div>
      ),
    });
  }

  if (UpdatedAt) {
    columnFill.push({
      accessorKey: "updatedAt",
      header: "Modified",
      cell: ({ getValue }) => (
        <div className="text-[11px] text-slate-500 font-medium">
            {formatDate(getValue())}
        </div>
      ),
    });
  }

  if (DeletedAt) {
    columnFill.push({
      accessorKey: "deletedAt",
      header: "Deleted",
      cell: ({ getValue }) => (
        <div className="text-[11px] text-red-500 font-bold italic">
            {formatDate(getValue())}
        </div>
      ),
    });
  }

  return columnFill;
};