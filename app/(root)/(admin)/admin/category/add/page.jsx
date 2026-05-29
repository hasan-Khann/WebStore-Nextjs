"use client";

import React, { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import slugify from "slugify";
import Image from "next/image";
import { LayoutGrid, Link as LinkIcon, ImageIcon, PlusCircle, Activity } from "lucide-react";

import { cn } from "@/lib/utils";
import { Buttonloading } from "@/components/application/buttonloading";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import SelectMedia from "@/components/application/admin/mediaselection";
import { showToast } from "@/lib/toast";
import api from "@/utils/api";

const formSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
  img: z.string().min(1, "Please select a category image"),
});

export default function AddCategoryPage() {
  const [loading, setLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", slug: "", img: "" },
  });

  const nameValue = useWatch({ control: form.control, name: "name" });
  useEffect(() => {
    if (nameValue) form.setValue("slug", slugify(nameValue, { lower: true, strict: true }));
  }, [nameValue, form]);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const { data } = await api.post("/api/category", values);
      if (data?.type === "success") {
        showToast({ type: "success", msg: "New Category Added" });
        form.reset();
        setSelectedAsset(null);
      }
    } catch (err) {
      showToast({ type: "error", msg: err.response?.data?.msg || "Server Error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-[#09090b] selection:bg-indigo-100">
      <main className="max-w-5xl mx-auto p-4 md:p-10 space-y-10">
        
        {/* Header */}
        <header className="flex flex-col gap-3 pb-8 border-b border-zinc-200/60 dark:border-zinc-800/50">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider">
            <LayoutGrid size={16} />
            <span>Catalog Manager</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Create Category
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-base font-medium">
            Define a new category for your product taxonomy.
          </p>
        </header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form Fields */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="border-none shadow-sm bg-white dark:bg-zinc-900/40 rounded-[2rem] overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <CardContent className="p-8 space-y-8">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-zinc-700 dark:text-zinc-300">Category Name</FormLabel>
                      <Input {...field} placeholder="e.g. Mens Collection" className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:ring-2 ring-indigo-500/20" />
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="slug" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold flex gap-2 text-zinc-700 dark:text-zinc-300">
                        <LinkIcon size={14} className="text-indigo-500"/> URL Slug
                      </FormLabel>
                      <Input {...field} disabled className="h-12 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl italic border-zinc-200 dark:border-zinc-700 opacity-70" />
                    </FormItem>
                  )} />

                  <Buttonloading 
                    type="submit" 
                    text="Save Category" 
                    loading={loading} 
                    className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none font-bold text-lg" 
                  />
                </CardContent>
              </Card>
            </div>

            {/* Media Picker */}
            <div className="lg:col-span-5">
              <FormField control={form.control} name="img" render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="font-bold text-zinc-700 dark:text-zinc-300">Thumbnail Image</FormLabel>
                  <FormControl>
                    <div onClick={() => setPickerOpen(true)}
                      className={cn(
                        "group relative aspect-square cursor-pointer rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden",
                        selectedAsset ? "border-transparent shadow-xl" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-indigo-400"
                      )}>
                      {selectedAsset ? (
                        <>
                          <Image src={selectedAsset.url} alt="Selected" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center backdrop-blur-sm transition-opacity">
                            <span className="bg-white text-indigo-600 px-4 py-2 rounded-full font-bold text-sm shadow-xl">Change Image</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-zinc-400">
                          <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                             <ImageIcon size={32} />
                          </div>
                          <p className="font-bold text-sm">Select Category Cover</p>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage className="text-center" />
                </FormItem>
              )} />
            </div>
          </form>
        </Form>
      </main>

      <SelectMedia
        open={pickerOpen}
        setOpen={setPickerOpen}
        isMultiple={false}
        selectedMedia={selectedAsset}
        setSelectedMedia={(asset) => {
          setSelectedAsset(asset); 
          form.setValue("img", asset?._id || "", { shouldValidate: true }); 
        }}
      />
    </div>
  );
}