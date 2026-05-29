"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { RotateCcw, Search, Hash } from "lucide-react";

export default function Filter({
  categories, setCategories,
  price, setPrice,
  search, setSearch,
  sizes, setSizes,
  colors, setColors,
}) {
  const [availableCats, setAvailableCats] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localMin, setLocalMin] = useState(price[0]);
  const [localMax, setLocalMax] = useState(price[1]);

  useEffect(() => { setLocalMin(price[0]); setLocalMax(price[1]); }, [price]);

  const applyPrice = () => setPrice([Number(localMin), Number(localMax)]);

  const toggle = (setter) => (val) =>
    setter((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);

  const reset = () => {
    setCategories([]); setSizes([]); setColors([]);
    setPrice([0, 100_000]); setSearch("");
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catRes, optRes] = await Promise.all([
          axios.get("/api/category/get"),
          axios.get("/api/shop?options=true"),   // ← only change
        ]);
        setAvailableCats(catRes.data.data || []);
        setAvailableSizes(optRes.data.sizes || []);
        setAvailableColors(optRes.data.colors || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, []);

  return (
    <div className="w-full space-y-6 lg:pr-6">

      {/* Search */}
      <div className="relative group">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors"
          size={14}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items..."
          className="w-full bg-zinc-100 dark:bg-zinc-800/50 border-none rounded-xl py-3 pl-10 pr-4 text-[13px] focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700 outline-none transition-all"
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-5">
        <h3 className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-900 dark:text-white">
          Refine By
        </h3>
        <button
          onClick={reset}
          className="text-[9px] uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-2 font-bold"
        >
          <RotateCcw size={10} /> Reset
        </button>
      </div>

      <Accordion type="multiple" defaultValue={["cat", "size", "color", "price"]} className="w-full">

        {/* Collections */}
        <AccordionItem value="cat" className="border-none">
          <AccordionTrigger>Collections</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {loading
                ? [1, 2, 3].map((i) => (
                  <div key={i} className="h-4 w-full bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded" />
                ))
                : availableCats.map((cat) => (
                  <label key={cat._id} className="flex items-center gap-3 cursor-pointer py-0.5">
                    <Checkbox
                      checked={categories.includes(cat._id)}
                      onCheckedChange={() => toggle(setCategories)(cat._id)}
                    />
                    <span className={cn(
                      "text-[13px] transition-all",
                      categories.includes(cat._id)
                        ? "font-bold text-zinc-900 dark:text-white"
                        : "text-zinc-500"
                    )}>
                      {cat.name}
                    </span>
                  </label>
                ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Sizes */}
        <AccordionItem value="size" className="border-t border-zinc-100 dark:border-white/5">
          <AccordionTrigger>Size</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2 pt-2">
              {loading
                ? [1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 w-12 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-lg" />
                ))
                : availableSizes.map((size) => {
                  const active = sizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => toggle(setSizes)(size)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide border transition-all",
                        active
                          ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white"
                          : "bg-transparent text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Colors */}
        <AccordionItem value="color" className="border-t border-zinc-100 dark:border-white/5">
          <AccordionTrigger>Color</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2 pt-2">
              {loading
                ? [1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
                ))
                : availableColors.map((color) => {
                  const active = colors.includes(color);
                  return (
                    <button
                      key={color}
                      onClick={() => toggle(setColors)(color)}
                      title={color}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 transition-all",
                        active
                          ? "border-zinc-900 dark:border-white scale-110 ring-2 ring-offset-1 ring-zinc-900 dark:ring-white"
                          : "border-transparent hover:scale-105"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  );
                })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price */}
        <AccordionItem value="price" className="border-t border-zinc-100 dark:border-white/5">
          <AccordionTrigger>Price (PKR)</AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-mono">PKR</span>
                  <input
                    type="number"
                    value={localMin}
                    onChange={(e) => setLocalMin(e.target.value)}
                    onBlur={applyPrice}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-lg py-2 pl-10 pr-2 text-xs font-bold focus:ring-1 focus:ring-zinc-900 outline-none"
                    placeholder="Min"
                  />
                </div>
                <div className="h-[1px] w-3 bg-zinc-300 dark:bg-zinc-700" />
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-mono">PKR</span>
                  <input
                    type="number"
                    value={localMax}
                    onChange={(e) => setLocalMax(e.target.value)}
                    onBlur={applyPrice}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-lg py-2 pl-10 pr-2 text-xs font-bold focus:ring-1 focus:ring-zinc-900 outline-none"
                    placeholder="Max"
                  />
                </div>
              </div>
              <p className="text-[10px] text-zinc-400 italic">Click outside to apply</p>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
}