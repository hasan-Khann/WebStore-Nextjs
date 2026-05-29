"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { 
  Trash2, 
  ArrowLeft, 
  Inbox, 
  FolderOpen, 
  Image as ImageIcon,
  MousePointer2,
  X,
  Sparkles
} from "lucide-react";

import { ADMIN_DASHBOARD, ADMIN_MEDIA } from "@/routes/AdminPanelRoute";
import BreadCrumb from "@/components/application/admin/breadcrumb";
import UploadMedia from "@/components/application/admin/uploadmedia";
import MediaCard from "@/components/application/admin/media";
import useDeleteMutation from "@/hooks/useDeleteMutations";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";

const MediaPage = () => {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [selectedMedia, setSelectedMedia] = useState([]);

  const isTrashMode = searchParams.get("trashof") === "media";
  const deleteType = isTrashMode ? "PD" : "SD";

  const breadCrumbData = [
    { href: ADMIN_DASHBOARD, label: "Home" },
    { label: isTrashMode ? "Trash Bin" : "Media Library" },
  ];

  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: ["media-data", deleteType],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await api.get(
        `/api/media?page=${pageParam}&limit=12&deleteType=${deleteType}`
      );
      return res.data;
    },
    getNextPageParam: (last) => (last.hasMore ? last.currentPage + 1 : undefined),
  });

  const allMedia = useMemo(() => {
    const flat = data?.pages?.flatMap((p) => p.mediaData || []).filter(Boolean) || [];
    const unique = Array.from(new Map(flat.map((m) => [m._id, m])).values());
    return unique;
  }, [data]);

  const deleteMutation = useDeleteMutation("media-data", "/api/media/delete");

  const handleDelete = (Ids, type) => {
    deleteMutation.mutate({ Ids, deleteType: type });
    setSelectedMedia([]);
  };

  return (
    <div className="min-h-screen bg-zinc-50/30 dark:bg-transparent pb-20">
      {/* Sticky Action Bar */}
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 md:top-[72px] z-[40] px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isTrashMode && (
             <Button variant="ghost" size="sm" asChild className="rounded-lg h-9 w-9 p-0">
               <Link href={ADMIN_MEDIA}><ArrowLeft size={18} /></Link>
             </Button>
          )}
          <div className="flex flex-col">
            <BreadCrumb breadCrumbData={breadCrumbData} />
            <h1 className={`text-sm md:text-base font-bold tracking-tight ${isTrashMode ? 'text-red-600' : 'text-zinc-900 dark:text-zinc-50'}`}>
              {isTrashMode ? "Archived Assets" : "Digital Asset Manager"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isTrashMode ? (
            <Button variant="outline" size="sm" asChild className="rounded-lg h-9 border-zinc-200 dark:border-zinc-800">
              <Link href={ADMIN_MEDIA} className="text-[11px] font-bold uppercase tracking-wider">
                Active Library
              </Link>
            </Button>
          ) : (
            <>
              <UploadMedia queryClient={queryClient} />
              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-lg h-9 border-zinc-200 dark:border-zinc-800 hover:text-red-600 transition-colors"
              >
                <Link href={`${ADMIN_MEDIA}?trashof=media`} className="flex items-center gap-2">
                  <Trash2 size={16} className="opacity-60" />
                  <span className="hidden md:inline text-[11px] font-bold uppercase tracking-wider">Trash Bin</span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto p-4 md:p-8">
        {/* Header Branding */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`h-5 w-5 rounded flex items-center justify-center ${isTrashMode ? 'bg-red-100 dark:bg-red-900/30' : 'bg-indigo-100 dark:bg-indigo-900/30'}`}>
                {isTrashMode ? <Trash2 size={12} className="text-red-600" /> : <ImageIcon size={12} className="text-indigo-600" />}
              </div>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isTrashMode ? 'text-red-600' : 'text-indigo-600'}`}>
                {isTrashMode ? 'Deep Archive' : 'Master Storage'}
              </p>
            </div>
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
                {isTrashMode ? 'Deleted Files' : 'Visual Content Library'}
            </h2>
          </div>

          {!isTrashMode && (
            <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[11px] font-bold text-zinc-500">
               <Sparkles size={14} className="text-indigo-500" />
               High-Resolution Sync Enabled
            </div>
          )}
        </div>

        {/* Media Grid */}
        {allMedia.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {allMedia.map((media) => (
              <MediaCard
                key={media._id}
                media={media}
                deleteType={deleteType}
                selectedMedia={selectedMedia}
                setSelectedMedia={setSelectedMedia}
                handleDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-zinc-400 bg-white dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 shadow-inner">
            <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full mb-4">
                {isTrashMode ? <Inbox size={32} /> : <FolderOpen size={32} />}
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">
              {isTrashMode ? "No items in trash" : "Your gallery is empty"}
            </p>
            <p className="text-xs text-zinc-400 mt-1">Upload assets to begin building your catalog.</p>
          </div>
        )}

        {/* Floating Selection Bar */}
        {selectedMedia.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-2 py-2 pr-6 rounded-full shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-300">
            <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-lg">
                <MousePointer2 size={18} fill="currentColor" />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-tighter leading-none opacity-60">Selection</span>
                <span className="text-sm font-bold">{selectedMedia.length} Assets</span>
            </div>
            
            <div className="h-8 w-px bg-zinc-700 dark:bg-zinc-200 mx-2" />

            <Button
              variant="destructive"
              size="sm"
              className="h-9 px-6 rounded-full font-bold text-[11px] uppercase tracking-wider"
              onClick={() => handleDelete(selectedMedia, deleteType)}
            >
              {isTrashMode ? "Wipe Permanently" : "Move to Trash"}
            </Button>
            
            <button
              onClick={() => setSelectedMedia([])}
              className="p-1.5 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Load More */}
        {hasNextPage && (
          <div className="flex justify-center pt-12">
            <Button 
              onClick={() => fetchNextPage()} 
              variant="outline" 
              disabled={isFetching}
              className="rounded-full px-8 h-10 border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-widest"
            >
              {isFetching ? "Syncing..." : "Load More Assets"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MediaPage;