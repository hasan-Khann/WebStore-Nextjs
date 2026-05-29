"use client";


import React from "react";
import PopoverCard from "@/components/application/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  Tag,
  User,
  Star,
  Shield,
  Package,
  Truck,
  Layers,
  Percent,
  Box,
  Info,
  FileText,
  Fingerprint,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

const formatRs = (val) => `Rs ${Number(val || 0).toLocaleString()}`;

/**
 * 1. CATEGORY CONFIGURATION
 */
export const DT_CATEGORY_CONFIG = [
  {
    accessorKey: "name",
    header: "Classification",
    Cell: ({ cell }) => (
      <div className="flex items-center gap-3 min-w-[180px]">
        <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
          <Layers size={16} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <span className="font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter text-sm">
          {cell.getValue()}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "slug",
    header: "Route Key",
    Cell: ({ cell }) => (
      <code className="bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-md text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-zinc-200 dark:border-zinc-800 font-mono">
        /{cell.getValue()}
      </code>
    ),
  },
  {
    accessorKey: "img_secure_url",
    header: "Media Preview",
    Cell: ({ row }) => (
      <div className="flex justify-end md:justify-start">
        <PopoverCard
          value={row.original.img_secure_url}
          title={row.original.name}
          label={
            <div className="h-11 w-11 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md hover:ring-2 ring-indigo-500 transition-all cursor-pointer bg-white dark:bg-zinc-900 group">
              <img src={row.original.img_secure_url} alt="cat" className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
            </div>
          }
          updateLink={`/admin/category/update/${row.original._id}`}
        />
      </div>
    ),
  },
];

/**
 * 2. PRODUCT CONFIG
 */
export const DT_PRODUCT_CONFIG = [
  {
    accessorKey: "name",
    header: "Product Identity",
    Cell: ({ row }) => (
      <div className="flex items-center gap-3 py-2 min-w-[280px]">
        <div className="h-11 w-11 shrink-0 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center shadow-sm border border-zinc-200 dark:border-zinc-800">
          <Box size={20} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-zinc-900 dark:text-zinc-50 leading-tight tracking-tight text-sm uppercase">
            {row.original.name}
          </span>
          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 font-black mt-1 bg-zinc-100 dark:bg-zinc-950 w-fit px-1.5 rounded border border-zinc-200 dark:border-zinc-800">
            UID: {row.original.slug}
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "category",
    header: "Taxonomy",
    accessorFn: (row) => row.category?.name || "Uncategorized",
    Cell: ({ row }) => {
      const catName = typeof row.original.category === 'object' ? row.original.category?.name : "General";
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 w-fit">
          <Tag size={12} className="text-indigo-500" />
          <span className="font-black text-[10px] text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">
            {catName}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "startingPrice",
    header: "Financials",
    Cell: ({ row }) => (
      <div className="flex flex-col min-w-[120px]">
        <div className="flex items-baseline text-zinc-900 dark:text-zinc-50">
          <span className="text-indigo-600 dark:text-indigo-500 font-black mr-1 text-xs">Rs</span>
          <span className="font-black text-xl tracking-tighter tabular-nums">
            {Number(row.original.startingPrice || 0).toLocaleString()}
          </span>
        </div>
        <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Base Rate</span>
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Summary",
    Cell: ({ row }) => {
      const desc = row.original.description?.replace(/<[^>]*>/g, '') || "No metadata.";
      return (
        <PopoverCard
          value={desc}
          title="Overview"
          label={
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-950 hover:text-white dark:hover:bg-indigo-600 transition-all shadow-sm group">
              <FileText size={14} className="text-indigo-500 group-hover:text-white" />
              <span className="text-[10px] font-black uppercase tracking-widest">View</span>
            </button>
          }
          updateLink={`/admin/product/update/${row.original._id}`}
        />
      );
    },
  },
];

/**
 * 3. VARIANT CONFIGURATION
 */
export const DT_VARIANT_CONFIG = [
  {
    accessorKey: "sku",
    header: "SKU / Unit ID",
    Cell: ({ cell }) => (
      <div className="flex items-center gap-2">
        <Fingerprint size={16} className="text-indigo-600 dark:text-indigo-500" />
        <span className="font-mono font-black text-zinc-900 dark:text-zinc-100 tracking-tighter uppercase underline decoration-indigo-500/30 decoration-2 underline-offset-4">
          {cell.getValue()}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "product.name",
    header: "Parent Context",
    Cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-[11px] font-black text-zinc-900 dark:text-zinc-100 uppercase leading-none mb-1.5">
          {row.original.product?.name}
        </span>
        <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 tracking-widest bg-zinc-50 dark:bg-zinc-900 px-1.5 py-0.5 w-fit rounded border border-zinc-200 dark:border-zinc-800">
          REF: {String(row.original.product?._id).slice(-6)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "stock",
    header: "Inventory Pulse",
    Cell: ({ cell }) => {
      const stock = Number(cell.getValue()) || 0;
      const isLow = stock < 10;
      return (
        <Badge variant="outline" className={cn(
          "font-black px-3 py-1.5 border rounded-lg text-[10px] uppercase tracking-tight",
          isLow 
            ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-500 dark:border-red-500/20" 
            : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-500 dark:border-emerald-500/20"
        )}>
          <Zap size={12} className={cn("mr-1.5", isLow ? "fill-red-600" : "fill-emerald-600")} />
          {stock} Units
        </Badge>
      );
    }
  },
  {
    accessorKey: "catalog",
    header: "Assets",
    Cell: ({ cell, row }) => (
      <PopoverCard
        value={cell.getValue()}
        fetchUrl="/api/media"
        title={`Variant Meta ${row.original.sku}`}
        label="View Media"
      />
    ),
  },
];

/**
 * 4. REVIEW CONFIGURATION
 */
export const DT_REVIEW_CONFIG = [
  {
    accessorKey: "user",
    header: "Author",
    Cell: ({ row }) => (
      <div className="flex items-center gap-3 py-1 min-w-[200px]">
        <div className="h-10 w-10 rounded-2xl bg-zinc-950 flex items-center justify-center text-white shadow-lg border border-zinc-800">
          <User size={16} className="text-indigo-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tight">
            {row.original.user?.username || row.original.username}
          </span>
          <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.2em] mt-0.5">Verified</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "rating",
    header: "Sentiment",
    Cell: ({ cell }) => (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-100 dark:border-amber-500/20 shadow-sm">
        <Star size={12} fill="currentColor" />
        <span className="font-black text-xs">{cell.getValue()}.0</span>
      </div>
    ),
  },
  {
    accessorKey: "review",
    header: "Log",
    Cell: ({ cell }) => (
      <PopoverCard
        value={cell.getValue()}
        title="Experience Log"
        label={
          <div className="flex items-center gap-2 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer group">
            <Info size={16} className="group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Detail</span>
          </div>
        }
      />
    ),
  },
];

/**
 * 5. USER CONFIGURATION
 */
export const DT_USER_CONFIG = [
  {
    accessorKey: "username",
    header: "Member Identity",
    Cell: ({ row }) => (
      <div className="flex items-center gap-4 py-2 min-w-[240px]">
        <div className="relative">
          <div className="h-12 w-12 rounded-[18px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-50 shadow-sm">
            <User size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-950 shadow-sm" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tighter leading-none mb-1.5">
            {row.original.username}
          </span>
          <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-950 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 w-fit">
            {row.original.email}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Security Level",
    Cell: ({ cell }) => {
      const role = cell.getValue()?.toLowerCase();
      const isAdmin = role === 'admin';
      return (
        <Badge className={cn(
          "font-black px-4 py-1.5 rounded-xl text-[9px] tracking-[0.2em] uppercase border shadow-sm transition-all",
          isAdmin ? "bg-zinc-950 text-white dark:bg-indigo-600 border-zinc-800" : "bg-white text-zinc-500 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800"
        )}>
          <Shield className={cn("mr-2", isAdmin && "animate-pulse")} size={10} />
          {role}
        </Badge>
      );
    },
  },
];

/**
 * 6. ORDER CONFIG
 */
export const DT_ORDER_CONFIG = [
  {
    accessorKey: "orderNumber",
    header: "Inventory Log",
    Cell: ({ row, cell }) => {
      const firstItemMedia = row.original.items?.[0]?.media;
      return (
        <div className="flex items-center gap-4 min-w-[200px]">
          <div className="h-12 w-12 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-hidden shadow-sm">
            {firstItemMedia ? (
              <img src={firstItemMedia} alt="prv" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-zinc-300 dark:text-zinc-700"><Package size={22} /></div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-mono font-black text-zinc-900 dark:text-zinc-50 text-[12px] tracking-widest leading-none mb-1.5 underline underline-offset-4 decoration-zinc-200 dark:decoration-zinc-800">
              #{cell.getValue()?.split("-")[1] || cell.getValue()}
            </span>
            <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">
              {row.original.createdAt ? new Date(row.original.createdAt).toDateString() : "PENDING"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "orderStatus",
    header: "Fulfillment",
    Cell: ({ cell }) => {
      const status = (cell.getValue() || "processing").toLowerCase();
      const config = {
        processing: { color: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-500 dark:border-amber-500/20", icon: <Clock size={10} /> },
        shipped: { color: "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20", icon: <Truck size={10} /> },
        delivered: { color: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-500 dark:border-emerald-500/20", icon: <CheckCircle2 size={10} /> },
        cancelled: { color: "bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-500 dark:border-red-500/20", icon: <AlertCircle size={10} /> },
      };
      const current = config[status] || config.processing;
      return (
        <Badge className={cn(current.color, "border font-black uppercase text-[8px] tracking-[0.2em] px-3 py-1.5 rounded-full")}>
          <span className="mr-1.5">{current.icon}</span> {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "total",
    header: "Net Value",
    Cell: ({ cell }) => (
      <div className="flex flex-col items-end min-w-[100px]">
        <span className="font-mono font-black text-zinc-900 dark:text-zinc-50 text-sm tracking-tighter">
          ${cell.getValue()?.toLocaleString()}
        </span>
        <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Settlement</span>
      </div>
    ),
  },
];

export const DT_ORDER_CUSTOMER_CONFIG = [
  {
    accessorKey: "orderNumber",
    header: "Order Manifest",
    Cell: ({ row, cell }) => {
      const firstItemMedia = row.original.items?.[0]?.media;
      const orderDate = row.original.createdAt;

      return (
        <div className="flex items-center gap-4 min-w-[220px]">
          <div className="h-12 w-12 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-hidden shadow-sm flex-shrink-0">
            {firstItemMedia ? (
              <img src={firstItemMedia} alt="product" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-zinc-300 dark:text-zinc-700">
                <Package size={20} />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-mono font-black text-slate-950 dark:text-white text-[13px] tracking-tighter leading-none mb-1.5 uppercase">
              #{String(cell.getValue() || "").replace("ORD-", "")}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                {orderDate ? new Date(orderDate).toLocaleDateString() : "PENDING"}
              </span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "orderStatus",
    header: "Fulfillment",
    Cell: ({ cell }) => {
      const status = (cell.getValue() || "processing").toLowerCase();
      const config = {
        processing: { color: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-500 dark:border-amber-500/20", icon: <Clock size={10} /> },
        shipped: { color: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20", icon: <Truck size={10} /> },
        delivered: { color: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-500 dark:border-emerald-500/20", icon: <CheckCircle2 size={10} /> },
        cancelled: { color: "bg-slate-50 text-slate-500 border-slate-100 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700", icon: <XCircle size={10} /> },
      };
      const current = config[status] || config.processing;
      return (
        <Badge className={cn(current.color, "border font-black uppercase text-[8px] tracking-[0.2em] px-3 py-1.5 rounded-full shadow-none whitespace-nowrap")}>
          <span className="mr-1.5">{current.icon}</span> {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Financials",
    Cell: ({ cell, row }) => {
      const status = (cell.getValue() || "pending").toLowerCase();
      const method = row.original.paymentMethod || "N/A"; 

      const config = {
        paid: { label: "Settled", color: "text-emerald-500", icon: <ShieldCheck size={12} /> },
        pending: { label: "Outstanding", color: "text-amber-500", icon: <CreditCard size={12} /> },
        failed: { label: "Rejected", color: "text-red-500", icon: <AlertCircle size={12} /> },
      };

      const current = config[status] || config.pending;

      return (
        <div className="flex flex-col gap-1 min-w-[100px]">
          <div className={cn("flex items-center gap-1.5 font-black uppercase text-[9px] tracking-widest", current.color)}>
            {current.icon} {current.label}
          </div>
          <span className="text-[8px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter">
            Via {method}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "total",
    header: "Total Value",
    Cell: ({ cell }) => (
      <div className="flex flex-col items-end min-w-[110px]">
        <span className="font-mono font-black text-slate-950 dark:text-white text-sm tracking-tighter">
          RS. {Number(cell.getValue() || 0).toLocaleString()}
        </span>
        <div className="h-[1px] w-4 bg-zinc-200 dark:bg-zinc-800 my-1" />
        <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Net Amount</span>
      </div>
    ),
  },
];

/**
 * 7. COUPON CONFIGURATION
 */
export const DT_COUPON_CONFIG = [
  {
    accessorKey: "code",
    header: "Promotion Key",
    Cell: ({ cell }) => (
      <div className="flex items-center gap-3">
        <div className="bg-zinc-950 p-2 rounded-xl text-indigo-400 border border-zinc-800 shadow-md">
          <Tag size={14} />
        </div>
        <span className="font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-widest text-xs underline decoration-indigo-500 decoration-2 underline-offset-4">
          {cell.getValue()}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "discountPercentage",
    header: "Benefit",
    Cell: ({ cell }) => (
      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 font-black tracking-tighter text-lg italic">
        <Percent size={16} strokeWidth={3} /> {cell.getValue()}%
      </div>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Pulse",
    Cell: ({ cell }) => (
      <Badge className={cn(
        "font-black text-[9px] px-4 py-1.5 border shadow-sm transition-all",
        cell.getValue() ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-zinc-100 text-zinc-400 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-600 dark:border-zinc-800'
      )}>
        {cell.getValue() ? 'ACTIVE SESSION' : 'DEACTIVATED'}
      </Badge>
    ),
  },
];