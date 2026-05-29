"use client";
import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Quote,
  Star,
  Loader2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/utils/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

dayjs.extend(relativeTime);
gsap.registerPlugin(ScrollTrigger);

export const ReviewsAndRating = ({ productId, onStatsUpdate }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  
  const sliderRef = useRef(null);
  const containerRef = useRef(null);

  const { user } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const res = await api.get(`/api/review/product/${productId}?limit=50`);
      return res.data;
    },
    enabled: !!productId,
  });

  useEffect(() => {
    if (data?.stats && onStatsUpdate) onStatsUpdate(data.stats);
  }, [data, onStatsUpdate]);

  // GSAP Stagger animation for incoming review cards
  useEffect(() => {
    if (!data?.reviews || data.reviews.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".review-card",
        { opacity: 0, x: 40 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.1,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sliderRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [data?.reviews]);

  const stats = data?.stats || { average: 0, total: 0, distinct: [] };
  const reviews = data?.reviews || [];

  const mutation = useMutation({
    mutationFn: async (newReview) => {
      return await api.post("/api/review/write", newReview);
    },
    onSuccess: () => {
      toast.success("Perspective Archived");
      setReviewText("");
      setIsFormOpen(false);
      queryClient.invalidateQueries(["reviews", productId]);
    },
  });

  const scroll = (dir) => {
    if (!sliderRef.current) return;
    const { scrollLeft, clientWidth } = sliderRef.current;
    sliderRef.current.scrollTo({
      left: dir === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth,
      behavior: "smooth",
    });
  };

  return (
    <div ref={containerRef} className="max-w-[1440px] mx-auto px-4 lg:px-16">
      <div className="grid lg:grid-cols-2 gap-6 mb-20">
        
        {/* STATS */}
        <div className="bg-black text-white p-12 rounded-[3rem] flex flex-col justify-between min-h-[320px]">
          <div>
            <span className="text-xs tracking-[0.5em] text-amber-400 uppercase">
              Index
            </span>
            <div className="text-7xl font-black mt-4">{stats.average || "0.0"}</div>
          </div>
          <p className="text-sm text-white/40">Based on {stats.total || 0} customer logs</p>
        </div>

        {/* FORM / TOGGLE PANEL */}
        <div className="bg-black text-white p-12 rounded-[3rem] relative overflow-hidden flex flex-col justify-center min-h-[320px]">
          
          {/* Action Prompt State */}
          <div
            className={cn(
              "transition-all duration-300 ease-out transform flex flex-col items-center justify-center w-full",
              !isFormOpen
                ? "opacity-100 scale-100 relative pointer-events-auto"
                : "opacity-0 scale-95 absolute inset-0 p-12 pointer-events-none"
            )}
          >
            <button
              onClick={() =>
                user ? setIsFormOpen(true) : toast.error("Login required")
              }
              className="bg-white text-black font-medium px-10 py-5 rounded-xl hover:bg-amber-400 transition-colors duration-200"
            >
              Write Review
            </button>
          </div>

          {/* Active Interactive Form State */}
          <div
            className={cn(
              "transition-all duration-300 ease-out transform space-y-6 w-full",
              isFormOpen
                ? "opacity-100 scale-100 relative pointer-events-auto"
                : "opacity-0 scale-95 absolute inset-0 p-12 pointer-events-none"
            )}
          >
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    onClick={() => setRating(i)}
                    className={cn(
                      "cursor-pointer transition-colors",
                      i <= rating ? "text-amber-400 fill-amber-400" : "text-white/20"
                    )}
                  />
                ))}
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-xs tracking-widest uppercase text-white/40 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
            
            <textarea
              value={reviewText}
              placeholder="Leave your perspective here..."
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full p-6 bg-white/5 rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none transition-colors resize-none h-28"
            />
            
            <button
              onClick={() =>
                mutation.mutate({ productId, rating, review: reviewText })
              }
              disabled={mutation.isPending || !reviewText.trim()}
              className="bg-amber-400 disabled:bg-amber-400/50 disabled:cursor-not-allowed text-black font-semibold px-10 py-4 rounded-xl flex items-center justify-center min-w-[140px] hover:bg-amber-500 transition-colors"
            >
              {mutation.isPending ? <Loader2 className="animate-spin" /> : "Submit Log"}
            </button>
          </div>

        </div>
      </div>

      {/* REVIEWS LIST */}
      <div className="relative">
        <div className="flex justify-between mb-10">
          <span className="text-xs tracking-[0.6em] uppercase text-black/60 dark:text-white/60">
            Archive // {reviews.length}
          </span>
          <div className="flex gap-3">
            <button 
              onClick={() => scroll("left")}
              className="p-2 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => scroll("right")}
              className="p-2 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div
          ref={sliderRef}
          className="flex gap-8 overflow-x-auto snap-x pb-20 no-scrollbar select-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {reviews.map((r) => (
            <div
              key={r._id}
              className="review-card opacity-0 min-w-[85vw] md:min-w-[550px] bg-neutral-100 dark:bg-zinc-900 p-10 rounded-[3rem] flex flex-col justify-between snap-start"
            >
              <div>
                <Quote className="opacity-10 mb-6 transform -scale-x-100" />
                <p className="text-xl font-medium tracking-tight leading-relaxed mb-10">
                  {r.review}
                </p>
              </div>
              <div className="flex justify-between text-sm text-black/40 dark:text-white/40 pt-4 border-t border-black/5 dark:border-white/5">
                <span className="font-semibold text-black dark:text-white">{r.username}</span>
                <span>{dayjs(r.createdAt).fromNow()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};