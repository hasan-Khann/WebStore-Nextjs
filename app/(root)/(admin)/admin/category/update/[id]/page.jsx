"use client";

import React, { useState, useEffect, use as useReact } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import slugify from "slugify";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Link as LinkIcon,
  ImageIcon,
  ArrowLeft,
  Loader2,
  Save,
  XCircle,
  Hash,
  LayoutGrid
} from "lucide-react";

import { Buttonloading } from "@/components/application/buttonloading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import SelectMedia from "@/components/application/admin/mediaselection";
import { showToast } from "@/lib/toast";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  img: z.string().min(1, "Image is required"),
});

export default function UpdateCategoryPage({ params: paramsPromise }) {
  const params = useReact(paramsPromise);
  const { id } = params;
  const router = useRouter();

  const [initLoading, setInitLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", slug: "", img: "" },
  });

  const nameValue = useWatch({ control: form.control, name: "name" });
  const formImgId = useWatch({ control: form.control, name: "img" });

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await api.get(`/api/category/${id}`);
        if (data?.type === "success") {
          const res = data.data;
          form.reset({
            name: res.name || "",
            slug: res.slug || "",
            img: res.img?.$oid || res.img || "",
          });
          if (res.imgData) {
            setSelectedAsset({
              _id: res.imgData._id,
              url: res.imgData.secure_url || res.imgData.url,
            });
          }
        }
      } catch (err) {
        showToast({ type: "error", msg: "Failed to load category data" });
      } finally {
        setInitLoading(false);
      }
    };
    loadData();
  }, [id, form]);

  useEffect(() => {
    if (nameValue && form.formState.dirtyFields.name) {
      form.setValue("slug", slugify(nameValue, { lower: true, strict: true }));
    }
  }, [nameValue, form]);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const { data } = await api.put(`/api/category/${id}`, values);
      if (data?.type === "success") {
        showToast({ type: "success", msg: "Category updated successfully" });
        router.push("/admin/category");
        router.refresh();
      }
    } catch (err) {
      showToast({ type: "error", msg: "Update failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">Synchronizing...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-[#09090b]">
      <main className="max-w-5xl mx-auto p-4 md:p-10 space-y-8">
        
        {/* Navigation & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-200/60 dark:border-zinc-800/50">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => router.back()} 
              className="rounded-full bg-white dark:bg-zinc-900 shadow-sm hover:text-indigo-600 border-zinc-200 dark:border-zinc-800 h-12 w-12"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                Edit Category
              </h1>
              <p className="text-zinc-500 text-sm font-medium">
                Modifying <span className="text-indigo-600 dark:text-indigo-400 font-bold">{form.getValues("name")}</span>
              </p>
            </div>
          </div>
          
          <Buttonloading 
            onClick={form.handleSubmit(onSubmit)}
            loading={isSubmitting} 
            icon={Save}
            text="Update Changes" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 dark:shadow-none px-8 h-12 rounded-2xl font-bold" 
          />
        </div>

        <Form {...form}>
          <form className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900/40 rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-100 dark:border-zinc-800">
                   <CardTitle className="text-sm font-black flex items-center gap-2 text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">
                      <Hash size={16} className="text-indigo-500" /> Identity Info
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-700 dark:text-zinc-300 font-bold">Display Name</FormLabel>
                      <Input {...field} className="h-12 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 ring-indigo-500/20 dark:bg-zinc-800/50" />
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="slug" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-700 dark:text-zinc-300 font-bold">Slug (Auto)</FormLabel>
                      <div className="relative">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                        <Input {...field} readOnly className="h-12 pl-10 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-500 italic border-zinc-200 dark:border-zinc-700 rounded-xl cursor-not-allowed" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-5">
              <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900/40 rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-100 dark:border-zinc-800">
                   <CardTitle className="text-sm font-black flex items-center gap-2 text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">
                      <ImageIcon size={16} className="text-indigo-500" /> Thumbnail
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <FormField control={form.control} name="img" render={({ field }) => (
                    <FormItem>
                      <div
                        onClick={() => setPickerOpen(true)}
                        className={`group relative aspect-square cursor-pointer rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden
                          ${selectedAsset ? "border-indigo-500 bg-zinc-50 dark:bg-zinc-800" : "border-zinc-300 dark:border-zinc-800 hover:border-indigo-400"}`}
                      >
                        {selectedAsset?.url ? (
                          <>
                            <Image src={selectedAsset.url} alt="Preview" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                              <span className="bg-white text-indigo-600 px-4 py-2 rounded-xl font-bold text-xs shadow-xl">Update Image</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center text-zinc-400">
                             <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
                             <p className="text-[10px] font-black uppercase">No Image Set</p>
                          </div>
                        )}
                      </div>
                      <FormMessage className="mt-2" />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
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
          if (asset?._id) {
            setSelectedAsset({ _id: asset._id, url: asset.secure_url || asset.url });
            form.setValue("img", asset._id, { shouldValidate: true, shouldDirty: true });
          }
          setPickerOpen(false);
        }}
      />
    </div>
  );
}