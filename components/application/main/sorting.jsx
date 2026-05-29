"use client";

import React from "react";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import CustomSelect from "../select";

const SORT_OPTIONS = [
  { label: "Newest Arrivals", value: "new" },
  { label: "Price: Low to High", value: "price_low" },
  { label: "Price: High to Low", value: "price_high" },
  { label: "Best Selling", value: "sales" },
];

export default function SortingBar({ limit, setLimit, sort, setSort, onFilterClick, total = 0 }) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-6 border-b border-zinc-100 dark:border-white/5 mb-8">
      <div className="flex items-center justify-between w-full md:w-auto gap-4">
        {/* Mobile Filter Button */}
        <button
          onClick={onFilterClick}
          className="lg:hidden flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl"
        >
          <SlidersHorizontal size={14} />
          Filters
        </button>

        {/* Limit Selector */}
        <div className="flex items-center gap-1 bg-zinc-100/50 dark:bg-zinc-900/50 p-1 rounded-full border border-zinc-200/50 dark:border-white/5">
          {[12, 24, 48].map((val) => (
            <button
              key={val}
              onClick={() => setLimit(val)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black transition-all uppercase tracking-tighter",
                limit === val
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              )}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden lg:block text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
        {total} Results Available
      </div>

      {/* The Custom Select Integrated */}
      <div className="w-full md:w-[240px]">
        <CustomSelect 
          options={SORT_OPTIONS}
          selected={sort}
          setSelected={setSort}
          variant="premium"
          placeholder="Sort By"
        />
      </div>
    </div>
  );
}