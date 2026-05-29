"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Layers, Trash2, Package, DollarSign, Info, Hash } from "lucide-react";

import BreadCrumb from "@/components/application/admin/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Select from "@/components/application/select";
import SelectMedia from "@/components/application/admin/mediaselection";
import api from "@/utils/api";
import { toast } from "sonner";
import { Buttonloading } from "@/components/application/buttonloading";

const sizeOptions = [
  { label: "XS", value: "XS" }, { label: "S", value: "S" },
  { label: "M", value: "M" }, { label: "L", value: "L" },
  { label: "XL", value: "XL" }, { label: "XXL", value: "XXL" },
];

const formSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  size: z.string().min(1, "Size is required"),
  color: z.string().min(1, "Color is required"),
  sku: z.string().min(1, "SKU is required"),
  stock: z.coerce.number().min(0),
  price: z.coerce.number().positive(),
  discount: z.coerce.number().min(0),
});

export default function AddProductVariantPage() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState([]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { productId: "", size: "", color: "", sku: "", stock: 0, price: 0, discount: 0 },
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/api/product?deleteType=SD&size=1000");
        if (data?.type === "success") {
          setProducts(data.data.map(p => ({ label: p.name, value: p._id })));
        }
      } catch (err) { console.error(err); }
    };
    fetchProducts();
  }, []);

  const onSubmit = async (values) => {
    if (selectedMedia.length === 0) return toast.error("Please select at least one image");
    setLoading(true);
    try {
      const payload = { ...values, media: selectedMedia.map(m => m._id) };
      const { data } = await api.post("/api/product-variant", payload);
      if (data.type === "success") {
        toast.success("Variant published successfully");
        form.reset();
        setSelectedMedia([]);
      }
    } catch (err) { toast.error("Error creating variant"); } finally { setLoading(false); }
  };

  return (
    <div className="bg-zinc-50/30 dark:bg-transparent min-h-screen pb-20">
      {/* Action Bar */}
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 md:top-[72px] z-[40] px-4 md:px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex flex-col gap-0.5">
          <BreadCrumb breadCrumbData={[{ href: "/admin", label: "Home" }, { label: "Add Variant" }]} />
          <h1 className="text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Generate Variant</h1>
        </div>
        <Buttonloading 
          loading={loading} 
          onClick={form.handleSubmit(onSubmit)} 
          text="Publish Variant"
          className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-6 rounded-lg font-bold text-xs border-none"
        />
      </div>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <Form {...form}>
          <form className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            <div className="lg:col-span-8 space-y-6">
              {/* Configuration */}
              <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl bg-white dark:bg-zinc-900/50 overflow-visible">
                <CardHeader className="py-4 px-6 border-b border-zinc-100 dark:border-zinc-800">
                  <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                    <Layers size={14} className="text-indigo-500" /> Attributes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <FormField control={form.control} name="productId" render={({ field }) => (
                    <FormItem className="relative z-[50]">
                      <FormLabel className="text-[11px] font-semibold text-zinc-500">Parent Product</FormLabel>
                      <Select options={products} selected={field.value} setSelected={field.onChange} />
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-5">
                    <FormField control={form.control} name="size" render={({ field }) => (
                      <FormItem className="relative z-[45]">
                        <FormLabel className="text-[11px] font-semibold text-zinc-500">Size</FormLabel>
                        <Select options={sizeOptions} selected={field.value} setSelected={field.onChange} />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="color" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-semibold text-zinc-500">Color/Finish</FormLabel>
                        <Input {...field} placeholder="e.g. Matte Black" className="h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 font-medium text-sm" />
                      </FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>

              {/* Media Selection */}
              <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl bg-white dark:bg-zinc-900/50 overflow-hidden">
                <CardHeader className="py-4 px-6 border-b border-zinc-100 dark:border-zinc-800">
                  <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Media Assets ({selectedMedia.length}/5)</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-4">
                    {selectedMedia.map((m) => (
                      <div key={m._id} className="relative h-24 w-24 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden group shadow-sm">
                        <Image src={m.url} alt="media" fill className="object-cover transition-transform group-hover:scale-110" />
                        <button type="button" onClick={() => setSelectedMedia(prev => prev.filter(i => i._id !== m._id))} className="absolute inset-0 bg-red-600/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><Trash2 size={18} /></button>
                      </div>
                    ))}
                    {selectedMedia.length < 5 && (
                      <button type="button" onClick={() => setOpen(true)} className="h-24 w-24 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-zinc-400 hover:bg-indigo-50/50 hover:border-indigo-300 dark:hover:bg-zinc-800 transition-all">
                        <ImagePlus size={20} />
                        <span className="text-[9px] mt-1 font-bold uppercase">Add</span>
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-6">
              {/* Inventory Card */}
              <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl bg-white dark:bg-zinc-900/50 overflow-hidden">
                <CardHeader className="py-4 px-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                  <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Pricing & Stock</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <FormField control={form.control} name="sku" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1.5"><Hash size={12}/> Stock Keeping Unit (SKU)</FormLabel>
                      <Input {...field} placeholder="PROD-BLK-M" className="h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 font-mono text-xs uppercase" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1.5"><DollarSign size={12}/> Unit Price</FormLabel>
                      <Input type="number" {...field} className="h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 font-bold text-sm" />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="stock" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-semibold text-zinc-500">Inventory</FormLabel>
                        <Input type="number" {...field} className="h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 font-bold text-sm" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="discount" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-semibold text-zinc-500">Disc (%)</FormLabel>
                        <Input type="number" {...field} className="h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 font-bold text-sm" />
                      </FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>

              <div className="p-5 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-900/30 rounded-xl flex gap-3">
                <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-900/80 dark:text-amber-300 font-medium leading-relaxed">
                   Variants are unique combinations of size and color. Ensure SKUs are unique across your entire catalog.
                </p>
              </div>
            </div>
          </form>
        </Form>
      </main>
      <SelectMedia open={open} setOpen={setOpen} selectedMedia={selectedMedia} setSelectedMedia={setSelectedMedia} isMultiple={true} />
    </div>
  );
}