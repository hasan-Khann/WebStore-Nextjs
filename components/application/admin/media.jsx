"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, RotateCcw, Eye, PencilLine, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MediaCard = ({ media = {}, deleteType, selectedMedia, setSelectedMedia, handleDelete }) => {
  // FIXED: Removed the stray "a" here
  if (!media._id) return null;

  const isSelected = selectedMedia.includes(media._id);
  const isTrash = deleteType === "PD";

  const toggleSelect = (e) => {
    if (e.target.closest("button") || e.target.closest("a")) return;
    setSelectedMedia((prev) =>
      isSelected ? prev.filter((id) => id !== media._id) : [...prev, media._id]
    );
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border transition-all duration-500",
        isSelected 
          ? "ring-2 ring-indigo-600 border-transparent shadow-xl shadow-indigo-100 dark:shadow-none" 
          : "hover:shadow-md border-zinc-200 dark:border-zinc-800"
      )}
    >
      {/* Media Preview */}
      <div className="relative aspect-square cursor-pointer bg-zinc-100 dark:bg-zinc-800" onClick={toggleSelect}>
        {media.secure_url ? (
          <Image
            src={media.secure_url}
            alt={media.title || "Media"}
            fill
            sizes="(max-width: 768px) 50vw, 15vw"
            className={cn(
                "object-cover transition-transform duration-700 ease-out md:group-hover:scale-110",
                isSelected && "scale-90 opacity-80"
            )}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full text-zinc-400 gap-2">
            <FileWarning size={20} />
            <span className="text-[10px] font-bold uppercase">No Preview</span>
          </div>
        )}

        {/* Checkbox Overlay */}
        <div 
          className={cn(
            "absolute top-3 left-3 z-20 transition-transform duration-300",
            isSelected ? "scale-110" : "scale-100"
          )} 
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleSelect({ target: { closest: () => false } })}
            className="border-white/50 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
          />
        </div>

        {/* Action Overlay (Desktop) */}
        <div className="hidden md:flex absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center gap-2 backdrop-blur-[2px]">
          {!isTrash ? (
            <>
              <Button size="icon" variant="secondary" className="rounded-full h-9 w-9 bg-white/10 hover:bg-white text-white hover:text-zinc-900 border-none transition-all" asChild>
                <a href={media.secure_url} target="_blank" rel="noreferrer">
                  <Eye size={16} />
                </a>
              </Button>
              <Button size="icon" variant="secondary" className="rounded-full h-9 w-9 bg-white/10 hover:bg-white text-white hover:text-zinc-900 border-none transition-all" asChild>
                <Link href={`/admin/media/update/${media._id}`}>
                  <PencilLine size={16} />
                </Link>
              </Button>
              <Button
                size="icon"
                variant="destructive"
                className="rounded-full h-9 w-9 shadow-lg"
                onClick={() => handleDelete([media._id], "SD")}
              >
                <Trash2 size={16} />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="icon"
                className="bg-indigo-600 hover:bg-indigo-500 rounded-full h-9 w-9 text-white shadow-lg"
                onClick={() => handleDelete([media._id], "RSD")}
              >
                <RotateCcw size={16} />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                className="rounded-full h-9 w-9 shadow-lg"
                onClick={() => handleDelete([media._id], "PD")}
              >
                <Trash2 size={16} />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Footer Info (Always visible on mobile, visible on select for desktop) */}
      <div className="p-3 bg-white dark:bg-zinc-900 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex flex-col overflow-hidden">
          <span className="text-[10px] font-black uppercase tracking-tight text-zinc-400 leading-none mb-1">Asset ID</span>
          <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[100px]">
            {media.title || media._id.slice(-8)}
          </span>
        </div>
        
        <div className="flex md:hidden gap-1">
             {/* Mobile specific compact buttons */}
             <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                 <a href={media.secure_url} target="_blank" rel="noreferrer"><Eye size={14} className="text-indigo-600"/></a>
             </Button>
             <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={() => handleDelete([media._id], isTrash ? "PD" : "SD")}
             >
                <Trash2 size={14} className="text-red-500"/>
             </Button>
        </div>
      </div>
    </div>
  );
};

export default MediaCard;