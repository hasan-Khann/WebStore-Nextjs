"use client";

import React, { useEffect, useState, use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import axios from "axios";
import { FiCopy, FiCheck, FiGlobe, FiType, FiDatabase, FiSave, FiLayers } from "react-icons/fi";

import BreadCrumb from '@/components/application/admin/breadcrumb';
import { Buttonloading } from '@/components/application/buttonloading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { zSchema } from '@/lib/zodschema';
import { ADMIN_DASHBOARD, ADMIN_MEDIA } from '@/routes/AdminPanelRoute';
import { showToast } from '@/lib/toast';

export default function EditMediaAsset({ params }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [media, setMedia] = useState(null);
  const [copied, setCopied] = useState(false);

  const formSchema = zSchema.pick({ title: true, alt: true });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", alt: "" },
  });

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const res = await axios.get(`/api/media/get/${id}`);
        if (res.data?.success) {
          const asset = res.data.data;
          setMedia(asset);
          form.reset({ 
            title: asset.title || "", 
            alt: asset.alt || "" 
          });
        }
      } catch (err) {
        showToast({ type: "error", msg: "Asset retrieval failed" });
      } finally {
        setFetching(false);
      }
    };
    fetchAsset();
  }, [id, form]);

  const handleCopy = () => {
    if (!media?.secure_url) return;
    navigator.clipboard.writeText(media.secure_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await axios.put("/api/media/update", { _id: id, ...values });
      showToast({ type: "success", msg: "Metadata updated successfully" });
    } catch (error) {
      showToast({ type: "error", msg: "Update failed" });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="h-screen flex items-center justify-center bg-white dark:bg-[#09090b]">
       <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] animate-pulse">Synchronizing Asset</span>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-[#09090b] pb-20">
      <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="space-y-2">
            <BreadCrumb breadCrumbData={[
              { href: ADMIN_DASHBOARD, label: "Home" },
              { href: ADMIN_MEDIA, label: "Media" },
              { label: "Edit Asset" }
            ]} />
            <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Media Details</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={handleCopy} 
            className="rounded-2xl px-6 h-12 shadow-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:text-indigo-600 font-bold transition-all"
          >
            {copied ? <FiCheck className="mr-2 text-emerald-500" /> : <FiCopy className="mr-2" />}
            Copy CDN URL
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Preview & Specs */}
          <div className="lg:col-span-5 space-y-8">
            <Card className="overflow-hidden border-none shadow-xl rounded-[2.5rem] bg-zinc-900 group relative">
              <div className="relative aspect-square flex items-center justify-center p-10">
                {media?.secure_url && (
                  <Image 
                    src={media.secure_url} 
                    alt="Preview" 
                    fill 
                    className="object-contain p-6 transition-transform duration-700 group-hover:scale-105" 
                    priority 
                  />
                )}
                <Badge className="absolute top-6 right-6 bg-white/10 backdrop-blur-md border-white/20 text-white font-black text-[10px] px-3 py-1 uppercase tracking-wider">
                  {media?.width} × {media?.height} PX
                </Badge>
              </div>
              <div className="bg-white/5 p-5 flex justify-between items-center text-[10px] font-black uppercase text-white/40 border-t border-white/5 tracking-widest">
                <span>Format: {media?.format}</span>
                <span className="flex items-center gap-1"><FiLayers /> {media?.resource_type}</span>
              </div>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm bg-white dark:bg-zinc-900/40">
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-[11px] font-bold items-center uppercase tracking-wider">
                  <span className="text-zinc-400 flex items-center gap-2"><FiDatabase size={14}/> Cloudinary ID</span>
                  <span className="font-mono text-zinc-800 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg">
                    {media?.public_id}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Metadata Form */}
          <div className="lg:col-span-7">
            <Card className="shadow-sm border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] bg-white dark:bg-zinc-900/40 overflow-hidden">
              <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 bg-transparent py-8 px-10">
                <CardTitle className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight uppercase text-sm opacity-60">Asset Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-10">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                    
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-xs font-black uppercase text-zinc-500 tracking-[0.15em]">Internal Reference</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <FiType className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                            <Input {...field} placeholder="e.g. Hero Banner Red" className="h-14 pl-12 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold focus:bg-white dark:focus:bg-zinc-800 transition-all shadow-none" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="alt" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-xs font-black uppercase text-zinc-500 tracking-[0.15em]">Accessibility (Alt Text)</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <FiGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                            <Input {...field} placeholder="Describe the image content" className="h-14 pl-12 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold focus:bg-white dark:focus:bg-zinc-800 transition-all shadow-none" />
                          </div>
                        </FormControl>
                        <FormDescription className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight mt-3">
                          Crucial for SEO and screen-reader compatibility.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="pt-6">
                      <Buttonloading 
                        type="submit" 
                        text="Synchronize Changes" 
                        loading={loading} 
                        className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-[1.25rem] shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98] text-lg" 
                        icon={FiSave} 
                      />
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}