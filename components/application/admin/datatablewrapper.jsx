"use client";

import React, { memo } from "react";
import DataTable from "@/components/application/admin/datatable";

const DataTableWrapper = (props) => {
  return <DataTable {...props} />;
};

export default memo(DataTableWrapper);
