"use client";

import React, { useEffect, useState, use } from "react";
import axios from "axios";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  FiPackage, FiUser, FiTruck, FiArrowLeft, 
  FiHash, FiCalendar, FiMapPin, FiPhone, FiMail 
} from "react-icons/fi";
import { EditOrderDialog } from "@/components/application/admin/editstatusdialog";

export default function OrderDetailsPage({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`/api/order/details/${id}`);
      if (res.data.type === "success") {
        setOrder(res.data.data);
      }
    } catch (err) {
      console.error("Order fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Syncing Order Data...</p>
        </div>
      </div>
    );
  }

  if (!order) return <div className="p-20 text-center font-bold">Order not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* TOP NAVIGATION BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link 
              href="/admin/orders" 
              className="group flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-all"
            >
              <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
              Back to Registry
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">#{order.orderNumber}</h1>
              <Badge className="bg-slate-900 text-white border-none uppercase text-[10px] px-3 font-black">
                {order.orderStatus}
              </Badge>
            </div>
          </div>

          <div className="flex gap-3">
            <EditOrderDialog 
              order={order} 
              refetch={fetchOrder} 
              trigger={
                <button className="h-12 px-8 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl text-xs font-black uppercase hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm">
                  Update Status
                </button>
              } 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: ITEMS & FINANCE */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* ITEM LIST */}
            <Card className="rounded-[32px] border-slate-200 overflow-hidden shadow-sm bg-white">
              <CardHeader className="border-b border-slate-100 p-6">
                <CardTitle className="text-xs font-black uppercase flex items-center gap-2 tracking-widest text-slate-400">
                  <FiPackage className="text-blue-600" size={16} /> 
                  Manifest — {order.items?.length} Line Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-50">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="p-6 flex items-center gap-6 hover:bg-slate-50/50 transition-colors">
                      <div className="h-20 w-20 bg-slate-100 rounded-[20px] flex-shrink-0 overflow-hidden border border-slate-100">
                        {item.media ? (
                          <img src={item.media} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-300"><FiPackage size={24}/></div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-black text-slate-900 text-base tracking-tight leading-tight">{item.name}</h4>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-md">SKU: {item.sku || "N/A"}</span>
                           <span className="text-[10px] font-bold text-slate-400 uppercase">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">Rs {item.price.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Unit Price</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FINANCIAL SUMMARY */}
            <Card className="rounded-[32px] border-none overflow-hidden shadow-xl bg-slate-900 text-white">
              <CardContent className="p-8 space-y-4">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <span>Gross Subtotal</span>
                  <span>Rs {order.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <span>Logistics Fee</span>
                  <span>Rs {order.shippingCost?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-emerald-500 uppercase tracking-widest">
                  <span>Applied Discount</span>
                  <span>- Rs {order.discount?.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Net Payable</p>
                    <p className="text-xs text-slate-500 font-medium">Inclusive of all taxes</p>
                  </div>
                  <span className="text-4xl font-black tracking-tighter italic">Rs {order.total?.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: LOGISTICS & CUSTOMER */}
          <div className="space-y-6">
            
            {/* CUSTOMER CARD */}
            <Card className="rounded-[32px] border-slate-200 overflow-hidden shadow-sm bg-white">
              <CardHeader className="border-b border-slate-100 p-6">
                <CardTitle className="text-xs font-black uppercase flex items-center gap-2 tracking-widest text-slate-400">
                  <FiUser className="text-blue-600" size={16} /> Customer Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                    <FiUser size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{order.customer?.fullName}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Client Account</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-600">
                    <FiMail className="flex-shrink-0" />
                    <span className="text-xs font-bold">{order.customer?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <FiPhone className="flex-shrink-0" />
                    <span className="text-xs font-bold">{order.customer?.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FULFILLMENT CARD */}
            <Card className="rounded-[32px] border-slate-200 overflow-hidden shadow-sm bg-white">
              <CardHeader className="border-b border-slate-100 p-6">
                <CardTitle className="text-xs font-black uppercase flex items-center gap-2 tracking-widest text-slate-400">
                  <FiTruck className="text-blue-600" size={16} /> Shipment Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-black text-slate-300 tracking-[0.1em]">Destination</Label>
                  <p className="text-xs font-bold text-slate-700 leading-relaxed">
                    {order.customer?.address}<br />
                    {order.customer?.city}, {order.customer?.postalCode}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <Label className="text-[10px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Waybill / Tracking</Label>
                  <p className="text-sm font-mono font-black text-slate-900">
                    {order.trackingNumber || "PENDING ASSIGNMENT"}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-300 uppercase">Gateway</span>
                    <span className="text-xs font-black text-slate-900 uppercase">{order.paymentMethod}</span>
                  </div>
                  <Badge className={order.paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}>
                    {order.paymentStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}