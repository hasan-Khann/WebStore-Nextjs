"use client";

import React, { useEffect, useState, use as useReact } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, ImagePlus, X, Info, Layers, Package, BarChart3, Palette, Hash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SelectMedia from "@/components/application/admin/mediaselection";
import Select from "@/components/application/select";
import BreadCrumb from "@/components/application/admin/breadcrumb";
import { showToast } from "@/lib/toast";
import api from "@/utils/api";
import { Buttonloading } from "@/components/application/buttonloading";

const sizeOptions = [
  { label: "Extra Small (XS)", value: "XS" },
  { label: "Small (S)", value: "S" },
  { label: "Medium (M)", value: "M" },
  { label: "Large (L)", value: "L" },
  { label: "Extra Large (XL)", value: "XL" },
  { label: "Double XL (XXL)", value: "XXL" },
];

const schema = z.object({
  productId: z.string().min(1, "Product is required"),
  size: z.string().min(1, "Size is required"),
  color: z.string().min(1, "Color is required"),
  sku: z.string().min(1, "SKU is required"),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  discount: z.coerce.number().min(0).optional(),
});

export default function UpdateVariantPage({ params: paramsPromise }) {
  const { id } = useReact(paramsPromise);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [products, setProducts] = useState([]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { productId: "", size: "", color: "", sku: "", stock: 0, price: 0, discount: 0 }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vRes, pRes] = await Promise.all([
          api.get(`/api/product-variant/${id}`),
          api.get("/api/product?size=1000")
        ]);

        if (vRes.data.type === "success") {
          const v = vRes.data.data;
          form.reset({
            productId: v.product?._id || v.product || "",
            size: v.size || "",
            color: v.color || "",
            sku: v.sku || "",
            stock: v.stock || 0,
            price: v.price || 0,
            discount: v.discount || 0
          });
          setSelectedMedia(v.mediaData?.map(m => ({ _id: m._id, url: m.secure_url || m.url })) || v.catalog || []);
        }
        if (pRes.data.type === "success") {
          setProducts(pRes.data.data.map(p => ({ label: p.name, value: p._id })));
        }
      } catch (e) {
        showToast({ type: "error", msg: "Failed to load data" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, form]);

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = { ...values, media: selectedMedia.map(m => m._id) };
      const { data } = await api.put(`/api/product-variant/${id}`, payload);
      if (data.type === "success") {
        showToast({ type: "success", msg: "Variant synchronized" });
        router.push("/admin/product-variant");
      }
    } catch (e) {
      showToast({ type: "error", msg: "Update failed." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col h-[60vh] items-center justify-center gap-3">
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Loading Variant</p>
    </div>
  );

  return (
    <div className="bg-zinc-50/30 dark:bg-transparent min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 md:top-[72px] z-[50] px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-lg h-9 w-9 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800"><ArrowLeft size={18} /></Button>
          <div className="flex flex-col">
            <BreadCrumb breadCrumbData={[{ href: "/admin", label: "Home" }, { label: "Update Variant" }]} />
            <h1 className="font-bold text-sm md:text-base text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
              Edit SKU: <span className="text-indigo-600 dark:text-indigo-400">{form.watch("sku")}</span>
            </h1>
          </div>
        </div>
        <Buttonloading 
          loading={submitting} 
          onClick={form.handleSubmit(onSubmit)} 
          text="Save Changes" 
          icon={Save}
          className="bg-indigo-600 hover:bg-indigo-700 h-9 px-6 rounded-lg text-xs font-bold border-none" 
        />
      </div>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <Form {...form}>
          <form className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl bg-white dark:bg-zinc-900/50 overflow-visible">
                <CardHeader className="py-4 px-6 border-b border-zinc-100 dark:border-zinc-800">
                  <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                    <Layers size={14} className="text-indigo-500" /> Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <FormField control={form.control} name="productId" render={({ field }) => (
                    <FormItem className="relative z-[50]">
                      <FormLabel className="text-[11px] font-semibold text-zinc-500">Parent Listing</FormLabel>
                      <Select options={products} selected={field.value} setSelected={field.onChange} />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField control={form.control} name="size" render={({ field }) => (
                      <FormItem className="relative z-[45]">
                        <FormLabel className="text-[11px] font-semibold text-zinc-500">Variant Size</FormLabel>
                        <Select options={sizeOptions} selected={field.value} setSelected={field.onChange} />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="color" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-semibold text-zinc-500">Variant Color</FormLabel>
                        <div className="relative">
                          <Palette className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                          <Input className="h-10 pl-9 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 font-medium" {...field} />
                        </div>
                      </FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl bg-white dark:bg-zinc-900/50">
                <CardHeader className="py-4 px-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
                  <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Media Gallery</CardTitle>
                  <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800">{selectedMedia.length} / 5</span>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {selectedMedia.map((img) => (
                      <div key={img._id} className="group relative aspect-square rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
                        <img src={img.url} className="object-cover w-full h-full transition-transform group-hover:scale-110" alt="variant" />
                        <button type="button" onClick={() => setSelectedMedia(prev => prev.filter(m => m._id !== img._id))} className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><X size={20} /></button>
                      </div>
                    ))}
                    {selectedMedia.length < 5 && (
                      <button type="button" onClick={() => setPickerOpen(true)} className="aspect-square border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col items-center justify-center text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-indigo-600 transition-all">
                        <ImagePlus size={24} />
                        <span className="text-[9px] mt-1 font-bold uppercase">Add Media</span>
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl bg-white dark:bg-zinc-900/50">
                <CardHeader className="py-4 px-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                  <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Financials & Stock</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <FormField control={form.control} name="sku" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-semibold text-zinc-500 flex items-center gap-2"><Hash size={12}/> SKU</FormLabel>
                      <Input className="h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 font-mono text-xs uppercase" {...field} />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-semibold text-zinc-500 flex items-center gap-2"><BarChart3 size={12}/> Retail Price</FormLabel>
                      <Input type="number" className="h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 font-bold" {...field} />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="stock" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-semibold text-zinc-500">Stock</FormLabel>
                        <Input type="number" className="h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 font-bold" {...field} />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="discount" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-semibold text-zinc-500">Disc (%)</FormLabel>
                        <Input type="number" className="h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 font-bold" {...field} />
                      </FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>
              <div className="p-5 bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-900/30 rounded-xl flex gap-3">
                <Info size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300 font-medium leading-relaxed">
                   Syncing variant details will update your global inventory immediately. Ensure your SKU matches the warehouse label.
                </p>
              </div>
            </div>
          </form>
        </Form>
      </main>
      <SelectMedia open={pickerOpen} setOpen={setPickerOpen} selectedMedia={selectedMedia} setSelectedMedia={setSelectedMedia} isMultiple />
    </div>
  );
}