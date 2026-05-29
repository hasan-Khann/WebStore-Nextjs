"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Buttonloading } from "@/components/application/buttonloading";
import { showToast } from "@/lib/toast";
import axios from "axios";
import { Package, Truck, CheckCircle2, XCircle, Hash, History } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { id: "processing", label: "Processing", icon: Package, color: "text-amber-500", bgColor: "bg-amber-50 dark:bg-amber-950/20" },
  { id: "shipped", label: "Shipped", icon: Truck, color: "text-indigo-500", bgColor: "bg-indigo-50 dark:bg-indigo-950/20" },
  { id: "delivered", label: "Delivered", icon: CheckCircle2, color: "text-emerald-500", bgColor: "bg-emerald-50 dark:bg-emerald-950/20" },
  { id: "cancelled", label: "Cancelled", icon: XCircle, color: "text-red-500", bgColor: "bg-red-50 dark:bg-red-950/20" },
];

export const EditOrderDialog = ({ order, trigger, refetch }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    trackingNumber: order.trackingNumber || "",
  });

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await axios.patch("/api/order", { id: order._id, ...formData });
      if (res.data.type === "success") {
        showToast({ type: "success", msg: "Order updated successfully" });
        setOpen(false);
        if (refetch) refetch();
      }
    } catch (error) {
      showToast({ type: "error", msg: "Failed to update order" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">{trigger}</div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-[2rem] p-8 bg-white dark:bg-zinc-950 border-none shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <History size={14} className="text-zinc-400" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Order Management</p>
            </div>
            <DialogTitle className="font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-50">
              Update Order <span className="text-indigo-600">#{order.orderNumber}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-6">
            <div className="grid grid-cols-2 gap-3">
              {STATUS_OPTIONS.map((status) => (
                <div
                  key={status.id}
                  onClick={() => setFormData({ ...formData, orderStatus: status.id })}
                  className={cn(
                    "p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 relative overflow-hidden",
                    formData.orderStatus === status.id 
                      ? "border-zinc-900 dark:border-zinc-50 bg-zinc-50 dark:bg-zinc-900" 
                      : "border-zinc-100 dark:border-zinc-800 opacity-60 hover:opacity-100"
                  )}
                >
                  <status.icon className={cn("size-5", status.color)} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{status.label}</span>
                  {formData.orderStatus === status.id && (
                    <div className={cn("absolute inset-x-0 bottom-0 h-1", status.color.replace('text', 'bg'))} />
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2">
                <Hash size={12} /> Fulfillment ID / Tracking
              </Label>
              <Input
                placeholder="Enter courier tracking number"
                value={formData.trackingNumber}
                onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                className="rounded-xl border-zinc-200 dark:border-zinc-800 h-12 font-bold bg-zinc-50/50 dark:bg-zinc-900/50"
              />
            </div>

            <Buttonloading
              text="Sync Order Status"
              loading={loading}
              onClick={handleUpdate}
              className="w-full bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 h-12 rounded-xl font-bold uppercase text-[11px] tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};