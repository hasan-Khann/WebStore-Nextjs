"use client";

import React, { useMemo, useCallback } from "react";
import DataTableWrapper from "@/components/application/admin/datatablewrapper";
import { DT_ORDER_CUSTOMER_CONFIG } from "@/lib/column";
import { MenuItem, ListItemIcon, ListItemText } from "@/node_modules/@mui/material";
import { FiCreditCard, FiBox, FiShield, FiAlertCircle } from "react-icons/fi";
import axios from "axios";
import { toast } from "sonner";

export default function CustomerOrderList() {
  const handlePayment = async (orderId) => {
    if (!orderId) return toast.error("Invalid Order Reference");

    const loadToast = toast.loading("Invoking Secure Gateway...");
    try {
      const { data } = await axios.post("/api/order/payfast-intent", { orderId });
      if (data.url) {
        toast.success("Redirecting to PayFast...", { id: loadToast });
        window.location.href = data.url;
      } else {
        throw new Error("Payment URL not generated");
      }
    } catch (err) {
      console.error("PAYMENT_INTENT_ERROR:", err);
      toast.error(err.response?.data?.message || "Handshake failed.", { id: loadToast });
    }
  };

  const columns = useMemo(() => DT_ORDER_CUSTOMER_CONFIG, []);

  const renderOrderActions = useCallback((row) => {
    const isUnpaid = row.original.paymentStatus?.toLowerCase() !== "paid" && row.original.orderStatus?.toLowerCase() !== "cancelled";

    return [
      isUnpaid && (
        <MenuItem
          key="pay"
          onClick={() => handlePayment(row.original._id)}
          sx={{ gap: 1.5, py: 1.5 }}
        >
          <ListItemIcon style={{ minWidth: 'auto' }}>
            <FiCreditCard className="text-amber-600" size={16} />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{
              fontSize: 10,
              fontWeight: 900,
              color: '#d97706',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
          >
            Settle Balance
          </ListItemText>
        </MenuItem>
      )
    ].filter(Boolean);
  }, []);

  return (
    <div className="w-full min-h-screen pt-32 pb-20 px-4 md:px-10 max-w-[1600px] mx-auto">

      {/* Header Section */}
      <div className="mb-12 pl-2">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-[1px] w-8 bg-amber-500" />
          <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em]">Transaction Vault</span>
        </div>
        <h1 className="text-5xl font-black text-slate-950 dark:text-white uppercase tracking-tighter italic leading-none">
          Order <span className="text-slate-300 dark:text-zinc-800">/ History</span>
        </h1>
      </div>

      {/* Table Container */}
      <div className="relative rounded-[2rem] border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-[#080808]/90 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-300">
        <DataTableWrapper
          fetchUrl="/api/order/customer"
          columnConfig={columns}
          queryKey="customer-order-list"
          createAction={renderOrderActions}
          renderDetailPanel={({ row }) => (
            <div className="p-8 bg-slate-50/50 dark:bg-zinc-900/30 border-t border-slate-100 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Manifest Items (Cargo) */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FiBox /> Manifest Items
                </h4>
                <div className="space-y-2">
                  {row.original.items && row.original.items.length > 0 ? (
                    row.original.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-white dark:bg-zinc-950 rounded-xl border border-slate-100 dark:border-zinc-800 shadow-sm">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black uppercase dark:text-white leading-tight">
                            {item.name}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">{item.sku}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-amber-500 font-mono text-[11px] font-bold">x{item.quantity}</span>
                          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                            Rs {Number(item.price).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 p-4 border border-dashed rounded-xl border-slate-200 dark:border-zinc-800">
                      <FiAlertCircle size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">No manifest items found</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping & Logistics Summary */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FiShield /> Logistic Target
                </h4>
                <div className="p-6 rounded-2xl bg-amber-500 text-white shadow-lg relative overflow-hidden group">
                  <div className="relative z-10">
                    <p className="text-[9px] font-black uppercase opacity-70 tracking-widest mb-1">Recipient</p>
                    <p className="text-lg font-black uppercase tracking-tight">
                      {row.original.customer?.fullName ?? "Valued Customer"}
                    </p>

                    <div className="h-[1px] w-full bg-white/20 my-3" />

                    <p className="text-[9px] font-black uppercase opacity-70 tracking-widest mb-1">Destination</p>
                    <p className="text-[11px] font-bold leading-relaxed">
                      {row.original.customer?.address?.area ?? "Standard Delivery Area"},<br />
                      {row.original.customer?.address?.city ?? "City Location"}
                    </p>
                  </div>

                  {/* Decorative Icon in background */}
                  <FiShield size={80} className="absolute -bottom-4 -right-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                </div>
              </div>

            </div>
          )}
        />
      </div>
    </div>
  );
}