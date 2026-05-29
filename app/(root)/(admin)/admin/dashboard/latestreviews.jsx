"use client";

import { useEffect, useState } from "react";
import { Star, Loader2, MessageSquare, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const timeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

export function LatestReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch("/api/review?size=5");
        const json = await response.json();
        if (json.type === "success") {
          setReviews(json.data);
        }
      } catch (error) {
        console.error("Review fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] space-y-4">
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <div className="absolute inset-0 h-8 w-8 animate-ping bg-amber-500/10 rounded-full" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
          Fetching Feedback
        </p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] text-zinc-500 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl m-2 bg-zinc-50/30 dark:bg-zinc-900/10">
        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full mb-4">
          <MessageSquare className="h-6 w-6 opacity-40" />
        </div>
        <p className="text-sm font-bold uppercase tracking-widest opacity-60">Silence is Golden</p>
        <p className="text-[10px] mt-1 font-medium">No customer feedback yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {reviews.map((item, index) => (
        <div 
          key={item._id} 
          className="group relative p-5 rounded-2xl transition-all duration-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800/50"
        >
          {/* Quote decoration */}
          <Quote className="absolute top-4 right-4 h-8 w-8 text-zinc-100 dark:text-zinc-800/50 -rotate-12 group-hover:text-amber-500/10 transition-colors" />

          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10 rounded-xl border-2 border-white dark:border-zinc-900 shadow-sm shrink-0">
              <AvatarFallback className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-black text-[10px]">
                {item.user?.username?.substring(0, 2).toUpperCase() || "GU"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-none">
                    {item.user?.username || "Guest User"}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-2.5 w-2.5 transition-all group-hover:scale-110",
                            i < item.rating 
                              ? "fill-amber-500 text-amber-500" 
                              : "fill-zinc-200 dark:fill-zinc-800 text-zinc-200 dark:text-zinc-800"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter">
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                  {item.title}
                </h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2 italic">
                  "{item.review}"
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Visual Footer */}
      <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50 text-center">
        <button className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-amber-500 transition-all">
          Manage All Feedback
        </button>
      </div>
    </div>
  );
}