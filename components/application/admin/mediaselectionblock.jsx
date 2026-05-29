"use client";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MediaBlock({ media, isMultiple, selectedMedia, setSelectedMedia }) {
  if (!media?.secure_url) return null;

  const isSelected = isMultiple
    ? Array.isArray(selectedMedia) && selectedMedia.some((m) => m._id === media._id)
    : selectedMedia?._id === media._id;

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isMultiple) {
      setSelectedMedia((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        return isSelected 
          ? list.filter((m) => m._id !== media._id) 
          : [...list, { _id: media._id, url: media.secure_url }];
      });
    } else {
      setSelectedMedia({ _id: media._id, url: media.secure_url });
    }
  };

  return (
    <div
      onClick={handleToggle}
      className={cn(
        "group relative aspect-square rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden bg-white",
        isSelected 
          ? "border-blue-600 ring-4 ring-blue-50 shadow-md" 
          : "border-slate-100 hover:border-slate-300 hover:shadow-xl"
      )}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 z-30 bg-blue-600 rounded-full p-0.5 shadow-lg animate-in zoom-in-50">
          <CheckCircle2 className="w-5 h-5 text-white" />
        </div>
      )}

      <Image
        src={media.secure_url}
        alt={media.title || "asset"}
        fill
        className={cn(
          "object-cover transition-transform duration-700 ease-in-out",
          isSelected ? "scale-90" : "group-hover:scale-110"
        )}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
      />
      
      {/* Subtle hover overlay */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-300",
        isSelected ? "bg-blue-500/5" : "bg-black/0 group-hover:bg-black/5"
      )} />
    </div>
  );
}