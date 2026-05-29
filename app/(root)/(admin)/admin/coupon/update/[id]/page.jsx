"use client";

import React, { useEffect, useState, use as useReact } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  ArrowLeft, Save, TicketPercent, 
  BadgeIndianRupee, Fingerprint, Info, Sparkles 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BreadCrumb from "@/components/application/admin/breadcrumb";
import { Buttonloading } from "@/components/application/buttonloading";
import { showToast } from "@/lib/toast";
import api from "@/utils/api";
import { ADMIN_DASHBOARD, ADMIN_COUPON } from "@/routes/AdminPanelRoute";

const formSchema = z.object({
  code: z.string().min(1, "Coupon code is required").toUpperCase(),
  discountPercentage: z.coerce
    .number()
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100"),
  minShoppingAmount: z.coerce
    .number()
    .min(0, "Minimum shopping amount cannot be negative"),
});

export default function UpdateCouponPage({ params: paramsPromise }) {
  const { id } = useReact(paramsPromise);
  const router = useRouter();
  
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { code: "", discountPercentage: 0, minShoppingAmount: 0 },
  });

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const { data } = await api.get(`/api/coupon/${id}`);
        if (data && data.type === "success") {
          form.reset({
            code: data.data.code || "",
            discountPercentage: data.data.discountPercentage || 0,
            minShoppingAmount: data.data.minShoppingAmount || 0,
          });
        }
      } catch (err) {
        showToast({ type: "error", msg: "Failed to load coupon data" });
      } finally {
        setFetching(false);
      }
    };
    fetchCoupon();
  }, [id, form]);

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const { data } = await api.put(`/api/coupon/${id}`, values);
      if (data?.type === "success") {
        showToast({ type: "success", msg: "Coupon updated" });
        router.push(ADMIN_COUPON);
        router.refresh();
      }
    } catch (err) {
      showToast({ type: "error", msg: err.response?.data?.msg || "Update failed" });
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) return (
    <div className="flex flex-col h-[60vh] items-center justify-center gap-3">
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Fetching Coupon</p>
    </div>
  );

  const breadCrumbData = [
    { href: ADMIN_DASHBOARD, label: "Home" },
    { href: ADMIN_COUPON, label: "Coupons" },
    { label: "Edit Coupon" },
  ];

  return (
    <div className="bg-zinc-50/30 dark:bg-transparent min-h-screen pb-20">
      {/* Sticky Header */}
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 md:top-[72px] z-[50] px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-lg h-9 w-9 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <ArrowLeft size={18} />
          </Button>
          <div className="flex flex-col">
            <BreadCrumb breadCrumbData={breadCrumbData} />
            <h1 className="font-bold text-sm md:text-base text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
              Editing: <span className="text-indigo-600 dark:text-indigo-400">{form.watch("code")}</span>
            </h1>
          </div>
        </div>
        <Buttonloading 
          loading={submitting} 
          onClick={form.handleSubmit(onSubmit)} 
          text="Update Coupon" 
          icon={Save}
          className="bg-indigo-600 hover:bg-indigo-700 h-9 px-6 rounded-lg text-xs font-bold border-none" 
        />
      </div>

      <main className="max-w-2xl mx-auto p-4 md:p-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl bg-white dark:bg-zinc-900/50 overflow-hidden">
              <CardHeader className="py-4 px-6 border-b border-zinc-100 dark:border-zinc-800">
                <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <TicketPercent size={14} className="text-indigo-500" /> Promotion Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-6">
                
                <FormField control={form.control} name="code" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-semibold text-zinc-500 flex items-center gap-2">
                      <Fingerprint size={12}/> Coupon Code
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="h-11 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 font-mono uppercase font-bold text-indigo-600 dark:text-indigo-400" 
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="discountPercentage" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-semibold text-zinc-500 flex items-center gap-2">
                        <Sparkles size={12}/> Discount (%)
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="number" className="h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 font-bold" />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="minShoppingAmount" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-semibold text-zinc-500 flex items-center gap-2">
                        <BadgeIndianRupee size={12}/> Min. Order Value (₹)
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="number" className="h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 font-bold" />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )} />
                </div>

                <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-900/30 rounded-lg flex gap-3">
                  <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-900/80 dark:text-amber-300 font-medium leading-relaxed">
                    Changing an active coupon code may invalidate existing customer carts. If this code has already been shared in marketing materials, proceed with caution.
                  </p>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </main>
    </div>
  );
}