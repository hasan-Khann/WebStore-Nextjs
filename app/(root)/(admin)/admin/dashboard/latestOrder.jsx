"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, PackageOpen, Clock, ChevronRight } from "lucide-react";
import api from "@/utils/api";
import { cn } from "@/lib/utils";

export function LatestOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await api.get("/api/order?size=10");
        const serverPayload = res.data;

        if (serverPayload.type === "success" && Array.isArray(serverPayload.data)) {
          const processingOrders = serverPayload.data
            .filter((order) => order.orderStatus === "processing")
            .sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

          setOrders(processingOrders);
        }
      } catch (error) {
        console.error("Order fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const getWaitTimeInfo = (dateString) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 60) return { label: `${minutes}m ago`, urgent: false };
    if (hours < 1) return { label: "Recent", urgent: false };
    return { label: `${hours}h ago`, urgent: hours >= 2 };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <div className="absolute inset-0 h-8 w-8 animate-ping bg-amber-500/20 rounded-full" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500 animate-pulse">
          Synchronizing Live Feed
        </p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-500 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl m-6 bg-zinc-50/30 dark:bg-zinc-900/20">
        <PackageOpen className="h-12 w-12 mb-4 opacity-20 text-zinc-400" />
        <p className="text-sm font-bold uppercase tracking-widest opacity-60">All Queues Clear</p>
        <p className="text-[10px] mt-1 font-medium">No pending orders found.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <Table>
        <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
          <TableRow className="hover:bg-transparent border-b border-zinc-100 dark:border-zinc-800/50">
            <TableHead className="text-[10px] uppercase font-black tracking-widest py-5 pl-6">Order ID</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-widest">Customer Profile</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-widest text-center">Qty</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-widest text-right pr-6">Settlement</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const waitInfo = getWaitTimeInfo(order.createdAt);
            return (
              <TableRow key={order._id} className="group border-b border-zinc-50 dark:border-zinc-800/30 hover:bg-zinc-50/50 dark:hover:bg-amber-500/[0.02] transition-all duration-300">
                <TableCell className="py-5 pl-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      #{order.orderNumber}
                    </span>
                    <div className={cn(
                      "flex items-center text-[10px] font-bold mt-1.5 px-2 py-0.5 rounded-full w-fit",
                      waitInfo.urgent 
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" 
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                    )}>
                      <Clock className={cn("h-3 w-3 mr-1", waitInfo.urgent && "animate-pulse")} />
                      {waitInfo.label}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {order.customer?.fullName || "Guest Account"}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter mt-0.5">
                      Via {order.paymentMethod}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[11px] font-black shadow-sm group-hover:border-amber-500/30 transition-colors">
                    {order.items?.length || 0}
                  </span>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex flex-col items-end">
                    <span className="font-black text-sm text-zinc-900 dark:text-white">
                      PKR {order.total?.toLocaleString()}
                    </span>
                    {order.discount > 0 ? (
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mt-1">
                        -{order.discount} OFF
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 uppercase tracking-tighter mt-1">
                        Details <ChevronRight size={10} />
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {/* Table Footer Action */}
      <div className="p-4 bg-zinc-50/30 dark:bg-zinc-900/20 border-t border-zinc-100 dark:border-zinc-800/50 flex justify-center">
        <button className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-amber-500 transition-colors">
          View Full Order History
        </button>
      </div>
    </div>
  );
}