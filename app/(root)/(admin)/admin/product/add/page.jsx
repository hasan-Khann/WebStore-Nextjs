"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import slugify from "slugify";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, LayoutGrid, DollarSign, Info, Link as LinkIcon } from "lucide-react";

import BreadCrumb from "@/components/application/admin/breadcrumb";
import { Buttonloading } from "@/components/application/buttonloading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Select from "@/components/application/select";
import Editor from "@/components/application/texteditor";
import api from "@/utils/api";
import { showToast } from "@/lib/toast";

const formSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  startingPrice: z.coerce.number().min(0, "Price cannot be negative"),
});

export default function AddProductPage() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      category: "",
      description: "",
      startingPrice: 0,
    },
  });

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const { data } = await axios.get("/api/category?deleteType=SD&size=1000");
        if (data?.type === "success") {
          setCategories(
            data.data.map((cat) => ({
              label: cat.name,
              value: cat._id.toString(),
            }))
          );
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategory();
  }, []);

  const nameValue = useWatch({ control: form.control, name: "name" });
  useEffect(() => {
    if (nameValue) form.setValue("slug", slugify(nameValue, { lower: true, strict: true }));
  }, [nameValue, form]);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await api.post("/api/product", values);
      if (response.data?.type === "success") {
        showToast({ type: "success", msg: "Product published!" });
        form.reset();
      }
    } catch (err) {
      showToast({ type: "error", msg: err.response?.data?.msg || "Server Error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-50/30 dark:bg-transparent min-h-screen pb-20">
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 md:top-[72px] z-40 px-4 md:px-8 py-3 flex items-center justify-between transition-all">
        <div className="flex flex-col gap-0.5">
          <BreadCrumb
            breadCrumbData={[
              { href: "/admin", label: "Home" },
              { href: "/admin/products", label: "Products" },
              { label: "New Product" },
            ]}
          />
          <h1 className="text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Create Master SKU</h1>
        </div>
        
        <Buttonloading
          onClick={form.handleSubmit(onSubmit)}
          text="Publish Product"
          loading={loading}
          icon={Plus}
          className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-5 rounded-lg font-bold text-xs shadow-sm transition-all active:scale-95 border-none"
        />
      </div>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <Form {...form}>
          <form className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl bg-white dark:bg-zinc-900/50 overflow-visible">
                <CardHeader className="py-4 px-6 border-b border-zinc-100 dark:border-zinc-800 rounded-t-xl">
                  <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                    <LayoutGrid size={14} className="text-indigo-500" /> Identity & Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[11px] font-semibold text-zinc-500">Product Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. Urban Oversized Hoodie" className="h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:ring-1 focus:ring-indigo-500 transition-all font-medium" />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1">
                            <LinkIcon size={10}/> Generated Slug
                          </FormLabel>
                          <FormControl>
                            <Input {...field} disabled className="h-10 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg border-zinc-200 dark:border-zinc-700 text-zinc-400 font-mono text-xs cursor-not-allowed" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                     Brandy Layout Context Box
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="relative z-10">
                        <FormLabel className="text-[11px] font-semibold text-zinc-500">Marketing Description</FormLabel>
                        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950">
                          <Editor value={field.value} onChange={field.onChange} />
                        </div>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl bg-white dark:bg-zinc-900/50 overflow-visible">
                <CardHeader className="py-4 px-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-t-xl">
                  <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Classification</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <FormField
                    control={form.control}
                    name="startingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1.5">
                          <DollarSign size={13} className="text-indigo-500" /> Base Retail Price
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                            <Input type="number" {...field} className="h-10 pl-7 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 font-bold text-sm" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem className="relative z-30">
                        <FormLabel className="text-[11px] font-semibold text-zinc-500">Primary Category</FormLabel>
                        <Select options={categories} selected={field.value} setSelected={field.onChange} placeholder="Search categories..." />
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Informational Context Element */}
              <div className="p-5 bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl flex gap-3">
                <Info size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300 font-medium leading-relaxed">
                  Creating this product establishes a <strong>Parent SKU</strong>. You can configure individual variants (size/color) and stock levels in the next step.
                </p>
              </div>
            </div>

          </form>
        </Form>
      </main>
    </div>
  );
}