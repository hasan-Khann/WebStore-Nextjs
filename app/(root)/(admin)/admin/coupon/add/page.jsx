"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  ArrowLeft, TicketPercent, 
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

const formSchema = z.object({
  code: z.string().min(1, "Coupon code is required").toUpperCase(),
  discountPercentage: z.coerce
    .number()
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100"),
  minShoppingAmount: z.coerce
    .number()
    .min(0, "Minimum amount cannot be negative"),
});

export default function AddCouponPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { code: "", discountPercentage: 0, minShoppingAmount: 0 },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const { data } = await api.post("/api/coupon", values);
      if (data?.type === "success") {
        showToast({ type: "success", msg: "Coupon code activated!" });
        router.push("/admin/coupon");
        router.refresh();
      }
    } catch (err) {
      showToast({ 
        type: "error", 
        msg: err.response?.data?.msg || "Failed to create coupon" 
      });
    } finally {
      setLoading(false);
    }
  };

  const breadCrumbData = [
    { href: "/admin", label: "Home" },
    { href: "/admin/coupon", label: "Coupons" },
    { label: "New Coupon" },
  ];

  return (
    <div className="bg-zinc-50/30 dark:bg-transparent min-h-screen pb-20">
      {/* Action Bar */}
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 md:top-[72px] z-[50] px-4 md:px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()} 
            className="rounded-lg h-9 w-9 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <ArrowLeft size={18} />
          </Button>
          <div className="flex flex-col">
            <BreadCrumb breadCrumbData={breadCrumbData} />
            <h1 className="text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Create Promotion</h1>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto p-4 md:p-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl bg-white dark:bg-zinc-900/50 overflow-hidden">
              <CardHeader className="py-4 px-6 border-b border-zinc-100 dark:border-zinc-800">
                <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <TicketPercent size={14} className="text-indigo-500" /> Coupon Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-6">
                
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-semibold text-zinc-500 flex items-center gap-2">
                        <Fingerprint size={12}/> Unique Promo Code
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="E.G. WINTER50" 
                          className="h-11 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 font-mono uppercase font-bold text-indigo-600 dark:text-indigo-400 placeholder:text-zinc-300" 
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-semibold text-zinc-500 flex items-center gap-2">
                           <Sparkles size={12} /> Discount (%)
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="0"
                            className="h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 font-bold"
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minShoppingAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-semibold text-zinc-500 flex items-center gap-2">
                          <BadgeIndianRupee size={12}/> Min. Order Value (₹)
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="0"
                            className="h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 font-bold"
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-lg flex gap-3 items-start">
                  <Info className="text-indigo-500 shrink-0 mt-0.5" size={16} />
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300 leading-relaxed font-medium">
                    Once created, this code will be available for all customers who meet the minimum spend requirement. Ensure values are correct before publishing.
                  </p>
                </div>

                <Buttonloading
                  type="submit"
                  text="Publish Coupon"
                  loading={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md shadow-indigo-100 dark:shadow-none border-none"
                />
              </CardContent>
            </Card>
          </form>
        </Form>
      </main>
    </div>
  );
}