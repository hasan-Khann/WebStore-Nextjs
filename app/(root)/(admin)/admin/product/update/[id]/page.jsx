"use client";

import React, { useEffect, useState, use as useReact } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import slugify from "slugify";
import { ArrowLeft, Save, LayoutGrid, DollarSign, Info, Hash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Editor from "@/components/application/texteditor";
import Select from "@/components/application/select";
import { showToast } from "@/lib/toast";
import api from "@/utils/api";
import { Buttonloading } from "@/components/application/buttonloading";

const schema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  startingPrice: z.coerce.number().min(0),
  category: z.string().min(1, "Please select a category"),
  description: z.string().min(1, "Description is required"),
});

export default function UpdateProductPage({ params: paramsPromise }) {
  const { id } = useReact(paramsPromise);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "", startingPrice: 0, category: "", description: "" }
  });

  const nameValue = useWatch({ control: form.control, name: "name" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          api.get(`/api/product/${id}`),
          axios.get("/api/category?size=1000&deleteType=SD")
        ]);

        if (pRes.data.type === "success") {
          const p = pRes.data.data;
          form.reset({
            name: p.name || "",
            slug: p.slug || "",
            startingPrice: p.startingPrice || 0,
            category: p.category?._id || p.category || "",
            description: p.description || "",
          });
        }
        if (cRes.data.type === "success") {
          setCategories(cRes.data.data.map(c => ({ label: c.name, value: c._id })));
        }
      } catch (e) {
        showToast({ type: "error", msg: "Failed to load product data" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, form]);

  useEffect(() => {
    if (nameValue && form.formState.dirtyFields.name) {
      form.setValue("slug", slugify(nameValue, { lower: true, strict: true }));
    }
  }, [nameValue, form]);

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const { data } = await api.put(`/api/product/${id}`, values);
      if (data.type === "success") {
        showToast({ type: "success", msg: "Record synchronized" });
        router.refresh();
      }
    } catch (e) {
      showToast({ type: "error", msg: "Update failed." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col h-[60vh] items-center justify-center gap-4 bg-transparent">
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Loading SKU Data</p>
    </div>
  );

  return (
    <div className="bg-zinc-50/30 dark:bg-transparent min-h-screen pb-20">
      {/* Action Bar: 
          Sticky with an offset (top-[73px]) to avoid overlapping your main dashboard topbar.
          Adjust the top value to match your actual header height.
      */}
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 md:top-[72px] z-[40] px-4 md:px-8 py-3 flex items-center justify-between transition-all">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()} 
            className="hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 rounded-lg h-9 w-9 p-0"
          >
            <ArrowLeft size={18} />
          </Button>
          <div className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm md:text-base text-zinc-900 dark:text-zinc-50 tracking-tight">Edit Master Product</h1>
              <Badge variant="outline" className="text-[10px] uppercase px-1.5 py-0 border-indigo-200 text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 dark:border-indigo-800">Draft</Badge>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">
              <Hash size={10} /> {id.slice(-12)}
            </p>
          </div>
        </div>

        <Buttonloading 
          loading={submitting} 
          onClick={form.handleSubmit(onSubmit)} 
          text="Save Changes"
          icon={Save}
          className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-5 rounded-lg font-bold text-xs shadow-sm transition-all active:scale-95"
        />
      </div>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <Form {...form}>
          <form className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl bg-white dark:bg-zinc-900/50">
                <CardHeader className="py-4 px-6 border-b border-zinc-100 dark:border-zinc-800">
                  <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                    <LayoutGrid size={14} className="text-indigo-500" /> Basic Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-semibold text-zinc-500">Product Name</FormLabel>
                        <FormControl>
                          <Input className="h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:ring-1 focus:ring-indigo-500 transition-all font-medium" {...field} />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="slug" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-semibold text-zinc-500">URL Slug</FormLabel>
                        <FormControl>
                          <Input readOnly className="h-10 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg border-zinc-200 dark:border-zinc-700 text-zinc-400 font-mono text-xs cursor-not-allowed" {...field} />
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-semibold text-zinc-500">Product Description</FormLabel>
                      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950">
                        <Editor value={field.value} onChange={field.onChange} />
                      </div>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl bg-white dark:bg-zinc-900/50 overflow-hidden">
                <CardHeader className="py-4 px-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                  <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Inventory & Logistics</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <FormField control={form.control} name="startingPrice" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1.5">
                        <DollarSign size={13} className="text-indigo-500"/> Display Price
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                          <Input type="number" className="h-10 pl-7 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 font-bold text-sm" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem className="relative z-[60]">
                      <FormLabel className="text-[11px] font-semibold text-zinc-500">Department/Category</FormLabel>
                      <Select options={categories} selected={field.value} setSelected={field.onChange} placeholder="Assign category" />
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
              
              <div className="p-5 bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl flex gap-3">
                <Info size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300 font-medium leading-relaxed">
                   Syncing updates the parent record. Variants (Sizes/Colors) will inherit the new description and category automatically.
                </p>
              </div>
            </div>

          </form>
        </Form>
      </main>
    </div>
  );
}