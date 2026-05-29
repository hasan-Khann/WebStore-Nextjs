"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useDebounce } from "use-debounce";

export default function useProducts({ limit, sort, categories, price, search = "", sizes = [], colors = [] }) {
  const [data, setData]       = useState({ listings: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor]   = useState(null);
  const activeCursorRef = useRef(null);

  const [debouncedPrice]  = useDebounce(price,  500);
  const [debouncedSearch] = useDebounce(search, 500);

  useEffect(() => {
    activeCursorRef.current = null;
    setNextCursor(null);
    setData({ listings: [], total: 0 });
  }, [limit, sort, categories, sizes, colors, debouncedPrice, debouncedSearch]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        sort,
        min:   debouncedPrice[0].toString(),
        max:   debouncedPrice[1].toString(),
        q:     debouncedSearch,
      });

      if (categories.length > 0) params.append("cat",    categories.join(","));
      if (sizes.length > 0)      params.append("sizes",  sizes.join(","));
      if (colors.length > 0)     params.append("colors", colors.join(","));
      if (activeCursorRef.current) params.append("cursor", activeCursorRef.current);

      const res = await fetch(`/api/shop?${params.toString()}`);
      const d   = await res.json();

      setData((prev) => ({
        listings: activeCursorRef.current ? [...prev.listings, ...d.listings] : d.listings,
        total:    activeCursorRef.current ? prev.total : d.total,
      }));
      setNextCursor(d.nextCursor ?? null);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [limit, sort, categories, sizes, colors, debouncedPrice, debouncedSearch]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const loadMore = () => {
    if (nextCursor && !loading) {
      activeCursorRef.current = nextCursor;
      fetchProducts();
    }
  };

  return { products: data.listings, total: data.total, loading, hasNextPage: !!nextCursor, loadMore };
}