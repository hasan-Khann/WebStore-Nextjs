"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  ImageIcon, 
  Loader2, 
  LayoutGrid, 
  PencilLine, 
  FileText, 
  ShoppingBag,
  PackageSearch
} from "lucide-react";

const PopoverCard = ({ value, fetchUrl = "/api/media", title = "Details", label = "View", updateLink }) => {
  const [open, setOpen] = useState(false);
  const [fetchedData, setFetchedData] = useState([]);
  const [loading, setLoading] = useState(false);

  const isArray = Array.isArray(value);
  const isManifest = isArray && value.length > 0 && typeof value[0] === 'object' && value[0].name;
  const isUrl = typeof value === "string" && (value.startsWith("http") || value.startsWith("/"));
  const isText = typeof value === "string" && !isUrl;
  
  useEffect(() => {
    const shouldFetch = open && isArray && !isManifest && value.length > 0 && fetchedData.length === 0;
    
    if (shouldFetch) {
      const fetchMedia = async () => {
        setLoading(true);
        try {
          const ids = value.map(v => (typeof v === 'object' && v?._id ? v._id.toString() : String(v))).join(",");

          if (!ids) return;

          const res = await axios.get(fetchUrl, { params: { ids } });
          setFetchedData(res.data.images || res.data.mediaData || []);
        } catch (err) {
          console.error("Fetch Error:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchMedia();
    }
  }, [open, value, fetchUrl, isArray, isManifest, fetchedData.length]);

  const renderTrigger = () => {
    if (isArray && value.length > 0) {
      return (
        <div className="flex items-center gap-2 group cursor-pointer active:scale-95 transition-all">
          <div className="flex -space-x-2.5">
            {value.slice(0, 3).map((_, i) => (
              <div key={i} className="h-8 w-8 rounded-lg border-2 border-white dark:border-zinc-950 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-sm ring-1 ring-zinc-200/50">
                {isManifest ? (
                  <ShoppingBag size={12} className="text-indigo-500" />
                ) : (
                  <ImageIcon size={12} className="text-zinc-400" />
                )}
              </div>
            ))}
          </div>
          <span className="text-[10px] font-black text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700">
            +{value.length}
          </span>
        </div>
      );
    }

    if (isUrl) {
      return (
        <div className="group relative h-10 w-10 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 hover:ring-2 ring-indigo-500 transition-all cursor-pointer shadow-sm">
          <Image src={value} alt="thumb" fill className="object-cover transition-transform group-hover:scale-110" sizes="40px" />
        </div>
      );
    }

    return (
      <Button variant="outline" className="h-8 px-3 text-[10px] font-black uppercase tracking-wider gap-2 rounded-xl border-zinc-200 dark:border-zinc-800 hover:bg-zinc-900 hover:text-white transition-all">
        {isText ? <FileText size={12} /> : <LayoutGrid size={12} />} {label}
      </Button>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="animate-spin text-indigo-600" size={32} strokeWidth={3} />
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Synchronizing Resources</span>
        </div>
      );
    }

    if (isText) {
      return (
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">
            {value}
          </p>
        </div>
      );
    }

    if (isManifest) {
      return (
        <div className="space-y-3">
          {value.map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:border-indigo-500/30 transition-colors">
              <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-zinc-100 dark:border-zinc-800">
                {item.media ? (
                  <img src={item.media} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <ImageIcon size={16} className="text-zinc-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase truncate tracking-tight">{item.name}</p>
                <p className="text-[10px] font-mono text-zinc-400 mt-0.5">SKU: {item.sku || '---'}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-black text-zinc-900 dark:text-zinc-50">Rs {item.price?.toLocaleString()}</p>
                <p className="text-[9px] font-black text-indigo-600 uppercase mt-0.5">QTY: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (isArray && fetchedData.length > 0) {
      return (
        <div className="grid grid-cols-2 gap-4">
          {fetchedData.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm group">
              <Image 
                src={img.secure_url || img.url || ''} 
                alt="media" 
                fill 
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform group-hover:scale-105" 
              />
            </div>
          ))}
        </div>
      );
    }

    if (isUrl) {
      return (
        <div className="relative aspect-square w-full rounded-3xl border-8 border-zinc-50 dark:border-zinc-900 overflow-hidden shadow-xl">
          <Image src={value} alt="preview" fill className="object-cover" sizes="400px" />
        </div>
      );
    }

    return (
      <div className="py-16 text-center flex flex-col items-center gap-3">
        <PackageSearch className="text-zinc-200" size={48} />
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">No Contextual Data Found</p>
      </div>
    );
  };

  return (
    <>
      <div onClick={(e) => { e.stopPropagation(); setOpen(true); }} className="w-fit cursor-pointer">
        {renderTrigger()}
      </div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-[2rem] overflow-hidden p-0 border-none shadow-2xl bg-white dark:bg-zinc-950">
          <DialogHeader className="p-6 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-base font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tighter">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">
                  Resource Inspector
                </DialogDescription>
              </div>
              
              {updateLink && (
                <Link href={updateLink}>
                  <Button size="sm" className="bg-zinc-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 h-9 rounded-xl gap-2 font-black text-[10px] px-4 shadow-lg transition-all">
                    <PencilLine size={14} /> EDIT RECORD
                  </Button>
                </Link>
              )}
            </div>
          </DialogHeader>

          <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
            {renderContent()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PopoverCard;