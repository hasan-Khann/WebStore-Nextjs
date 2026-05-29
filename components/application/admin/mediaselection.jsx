"use client";
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ImageIcon, LayoutGrid } from "lucide-react";
import api from "@/utils/api";
import MediaBlock from "./mediaselectionblock";

export default function SelectMedia({ open, setOpen, selectedMedia, setSelectedMedia, isMultiple }) {
  const [allMedia, setAllMedia] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fetchMedia = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/media?size=1000");
        setAllMedia(data?.images || []); 
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-6xl w-[95vw] h-[85vh] p-0 z-[999] overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col">
        <DialogHeader className="px-6 py-6 border-b bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <LayoutGrid size={20} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">Media Library</DialogTitle>
              <p className="text-xs text-slate-500 font-medium">Choose assets for this variant</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 bg-slate-50 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                  <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
                  <p className="text-slate-500 font-medium tracking-tight">Syncing your gallery...</p>
                </div>
              ) : allMedia.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {allMedia.map((item) => (
                    <MediaBlock
                      key={item._id}
                      media={item}
                      isMultiple={isMultiple}
                      selectedMedia={selectedMedia}
                      setSelectedMedia={setSelectedMedia}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-40 text-slate-400">
                  <ImageIcon className="w-16 h-16 mb-4 opacity-10" />
                  <p className="text-lg font-medium">Your library is empty</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-white shrink-0 flex flex-row items-center justify-between">
          <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {isMultiple 
              ? `${Array.isArray(selectedMedia) ? selectedMedia.length : 0} Assets Selected` 
              : "Single Selection Mode"}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setOpen(false)} className="px-6 font-bold text-slate-500">
              Cancel
            </Button>
            <Button 
              onClick={() => setOpen(false)} 
              className="px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-100 font-bold"
            >
              Apply Selection
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}