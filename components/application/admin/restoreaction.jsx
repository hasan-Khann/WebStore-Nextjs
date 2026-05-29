"use client";
import React from "react";
import { ListItemIcon, MenuItem } from "@/node_modules/@mui/material";
import { RotateCcw } from "lucide-react";

const RestoreAction = ({ handleRestore, row }) => (
  <MenuItem onClick={() => handleRestore([row.original._id], "RSD")}>
    <ListItemIcon><RotateCcw size={18} color="#10b981" /></ListItemIcon>
    Restore Item
  </MenuItem>
);

export default RestoreAction;