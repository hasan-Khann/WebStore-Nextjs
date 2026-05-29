
"use client";

import React from "react";
import { ListItemIcon, MenuItem } from "@/node_modules/@mui/material";
import Link from "next/link";
import { Edit as EditIcon } from "@/node_modules/@mui/icons-material";

const EditAction = ({ href }) => {
  return (
    <MenuItem component={Link} href={href}>
      <ListItemIcon>
        <EditIcon fontSize="small" />
      </ListItemIcon>
      Edit
    </MenuItem>
  );
};

export default EditAction;  