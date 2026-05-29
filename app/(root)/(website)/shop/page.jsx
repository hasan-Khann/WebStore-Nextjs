"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { X, RotateCcw, Loader2 } from "lucide-react";
import axios from "axios";
import gsap from "gsap";

import useProducts from "@/hooks/useProducts";
import ProductCard from "@/components/application/main/productcard";
import Filter from "@/components/application/main/filters";
import SortingBar from "@/components/application/main/sorting";

function ShopContent() {
  const searchParams = useSearchParams();
  const gridRef    = useRef(null);
  const drawerRef  = useRef(null);
  const overlayRef = useRef(null);

  const [limit,      setLimit]      = useState(12);
  const [sort,       setSort]       = useState("new");
  const [categories, setCategories] = useState([]);
  const [price,      setPrice]      = useState([0, 100000]);
  const [search,     setSearch]     = useState("");
  const [sizes,      setSizes]      = useState([]);
  const [colors,     setColors]     = useState([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const categorySlug = searchParams.get("category");
    if (categorySlug) {
      const syncCategory = async () => {
        try {
          const res = await axios.get("/api/category/get");
          const allCats = res.data.data || [];
          const matched = allCats.find((c) => c.slug === categorySlug);
          if (matched) setCategories([matched._id]);
        } catch (err) {
          console.error("Collection sync error:", err);
        }
      };
      syncCategory();
    } else {
      setCategories([]);
    }
  }, [searchParams]);

  const { products, total, loading, hasNextPage, loadMore } = useProducts({
    limit, sort, categories, price, search, sizes, colors,
  });

  // Grid entrance animation
  useEffect(() => {
    if (!loading && products.length > 0 && gridRef.current) {
      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: "power2.out", overwrite: "auto" }
      );
    }
  }, [loading, products.length]);

  // Mobile drawer animation
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = "hidden";
      gsap.timeline()
        .to(overlayRef.current, { opacity: 1, display: "block", duration: 0.3 })
        .to(drawerRef.current,  { y: 0, duration: 0.5, ease: "power3.out" }, "-=0.2");
    } else {
      document.body.style.overflow = "unset";
      gsap.timeline()
        .to(drawerRef.current,  { y: "100%", duration: 0.4, ease: "power3.in" })
        .to(overlayRef.current, { opacity: 0, display: "none", duration: 0.2 }, "-=0.1");
    }
  }, [isMobileFilterOpen]);

  const resetFilters = () => {
    setCategories([]);
    setPrice([0, 100000]);
    setSearch("");
    setSizes([]);
    setColors([]);
  };

  const hasActiveFilters =
    categories.length > 0 || sizes.length > 0 || colors.length > 0 ||
    search || price[0] !== 0 || price[1] !== 100000;

  const filterProps = {
    categories, setCategories,
    price,      setPrice,
    search,     setSearch,
    sizes,      setSizes,
    colors,     setColors,
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto pt-32 pb-20 px-6 md:px-12">

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-baseline gap-4">
            <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter dark:text-white">
              {searchParams.get("category")
                ? searchParams.get("category").replace(/-/g, " ")
                : "Catalog"}
            </h1>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              [{total}]
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.4em]">
              Engineered Essentials
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-500 transition-colors"
              >
                <RotateCcw size={10} /> Clear Filters
              </button>
            )}
          </div>
        </header>

        <SortingBar
          limit={limit} setLimit={setLimit}
          sort={sort}   setSort={setSort}
          total={total}
          onFilterClick={() => setIsMobileFilterOpen(true)}
        />

        <div className="flex flex-col lg:flex-row gap-12 items-start">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-32 self-start max-h-[calc(100vh-160px)] overflow-y-auto no-scrollbar">
            <Filter {...filterProps} />
          </aside>

          {/* Product Grid */}
          <div className="flex-1 w-full">
            {loading && products.length === 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(limit)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-32 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                <p className="text-zinc-500 uppercase tracking-widest text-xs font-bold">
                  No items found matching criteria
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 text-[10px] font-black underline uppercase tracking-widest dark:text-white"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <>
                <div
                  ref={gridRef}
                  className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-8 md:gap-y-16"
                >
                  {products.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>

                {/* Load More */}
                <div className="mt-20 flex flex-col items-center gap-6">
                  {hasNextPage ? (
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="group relative flex items-center justify-center gap-3 px-12 py-5 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl shadow-xl active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading && <Loader2 size={14} className="animate-spin" />}
                      <span>{loading ? "Syncing Archive..." : "Load More"}</span>
                    </button>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.5em]">
                        End of Collection
                      </p>
                    </div>
                  )}
                  <p className="text-[9px] font-bold text-zinc-300 dark:text-zinc-600 uppercase tracking-widest">
                    Showing {products.length} of {total}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      <div
        ref={overlayRef}
        onClick={() => setIsMobileFilterOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] hidden opacity-0"
      />

      {/* Mobile Drawer */}
      <div
        ref={drawerRef}
        className="fixed inset-x-0 bottom-0 h-[85vh] bg-white dark:bg-zinc-950 z-[160] rounded-t-[2.5rem] shadow-2xl lg:hidden flex flex-col overflow-hidden translate-y-full"
      >
        <div className="flex flex-col items-center pt-4 pb-4 border-b border-zinc-100 dark:border-white/5">
          <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-6" />
          <div className="w-full px-8 flex justify-between items-center">
            <span className="text-xl font-black uppercase tracking-tighter dark:text-white">
              Refine Selection
            </span>
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-8 py-6 no-scrollbar">
          <Filter {...filterProps} />
        </div>
        <div className="p-8 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-t border-zinc-100 dark:border-white/5">
          <button
            onClick={() => setIsMobileFilterOpen(false)}
            className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl active:scale-[0.98] transition-all"
          >
            Show {total} Results
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
          <div className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse dark:text-white">
            Loading Archive...
          </div>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}