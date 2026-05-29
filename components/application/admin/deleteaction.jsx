"use client";
import React from "react";
import { ListItemIcon, MenuItem } from "@/node_modules/@mui/material";
import { Trash2 } from "lucide-react";

const DeleteAction = ({ handleDelete, row, deleteType }) => (
  <MenuItem onClick={() => handleDelete([row.original._id], deleteType)}>
    <ListItemIcon><Trash2 size={18} color="#ef4444" /></ListItemIcon>
    {deleteType === "PD" ? "Delete Permanently" : "Move to Trash"}
  </MenuItem>
);

export default DeleteAction;