"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CustomSelect({ 
  options = [], 
  selected, 
  setSelected, 
  placeholder = "Select option...",
  variant = "default",
  className
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);

  // Safely find the active option regardless of key/value naming schemes
  const selectedOption = options.find((opt) => opt.value === selected || opt.key === selected);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    setSelected(value);
    setIsOpen(false);
    setQuery("");
  };

  const filteredOptions = options.filter((opt) =>
    (opt.name || opt.label || "").toLowerCase().includes(query.toLowerCase())
  );

  const isPremium = variant === "premium";

  return (
    <div className={cn("relative w-full font-sans z-30", className)} ref={containerRef}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border px-3.5 py-2 text-[11px] font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer shadow-sm select-none",
          isOpen 
            ? isPremium 
              ? "border-zinc-900 dark:border-white bg-white dark:bg-zinc-900 ring-2 ring-zinc-900/5 dark:ring-white/10" 
              : "border-indigo-500 dark:border-indigo-400 bg-white dark:bg-zinc-900 ring-4 ring-indigo-50 dark:ring-indigo-950/40"
            : isPremium 
              ? "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-900 dark:text-zinc-100" 
              : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300"
        )}
      >
        <div className="flex items-center gap-2 truncate">
          {isPremium && <span className="text-zinc-400 dark:text-zinc-500 font-medium normal-case tracking-normal">Sort:</span>}
          <span className={cn("truncate", !selectedOption && "text-zinc-400 dark:text-zinc-500")}>
            {selectedOption ? (selectedOption.name || selectedOption.label) : placeholder}
          </span>
        </div>
        <ChevronDown className={cn("h-3.5 w-3.5 text-zinc-400 shrink-0 transition-transform duration-300 ease-in-out", isOpen && "rotate-180")} />
      </div>

      {/* Floating Dropdown Menu Menu */}
      <div
        className={cn(
          "absolute left-0 right-0 z-50 mt-1.5 max-h-72 flex flex-col overflow-hidden rounded-xl border shadow-xl transition-all duration-200 ease-out origin-top",
          isPremium ? "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900",
          isOpen 
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" 
            : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
        )}
      >
        {/* Search Bar Input */}
        <div className={cn("flex items-center border-b px-3 py-2 shrink-0", isPremium ? "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800" : "bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-100 dark:border-zinc-800")}>
          <Search className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          <input
            className="flex h-7 w-full bg-transparent px-2 text-[11px] font-bold uppercase tracking-widest outline-none text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 font-sans"
            placeholder="Search options..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Options List Container */}
        <div className="overflow-y-auto p-1 max-h-48 divide-y divide-transparent scrollbar-thin">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">No results found</div>
          ) : (
            filteredOptions.map((option) => {
              const val = option.value ?? option.key;
              const isSelected = selected === val;
              return (
                <div
                  key={val}
                  onClick={(e) => { e.stopPropagation(); handleSelect(val); }}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2.5 pl-9 pr-4 text-[10px] font-bold uppercase tracking-widest transition-colors mb-0.5 last:mb-0",
                    isSelected 
                      ? isPremium 
                        ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950" 
                        : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400" 
                      : isPremium 
                        ? "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900" 
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                  )}
                >
                  <span className="absolute left-2.5 flex h-4 w-4 items-center justify-center">
                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[3px]" />}
                  </span>
                  <span className="truncate">{option.name || option.label}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}