"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronRight, Hash, LayoutGrid, ShoppingBag, Users, Ticket, Image as ImageIcon, X } from 'lucide-react';
import Fuse from 'fuse.js';
import Link from 'next/link';
import { cn } from "@/lib/utils";

const CategoryIcon = ({ category }) => {
  const iconProps = { size: 14, className: "text-zinc-500 dark:text-zinc-400" };
  switch (category.toLowerCase()) {
    case 'catalog': return <Hash {...iconProps} />;
    case 'assets': return <ImageIcon {...iconProps} />;
    case 'sales': return <ShoppingBag {...iconProps} />;
    case 'management': return <Users {...iconProps} />;
    case 'marketing': return <Ticket {...iconProps} />;
    default: return <LayoutGrid {...iconProps} />;
  }
};

export default function AdminSearch({ data }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fuse = useMemo(() => new Fuse(data, {
    keys: ['title', 'category'],
    threshold: 0.35,
  }), [data]);

  const results = query ? fuse.search(query).slice(0, 6) : [];

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Field */}
      <div className={cn(
        "relative flex items-center h-10 w-full group transition-all duration-300",
        isOpen ? "z-[60]" : "z-10"
      )}>
        <Search 
          className={cn(
            "absolute left-3.5 transition-colors duration-200 z-10",
            isOpen ? "text-indigo-500" : "text-zinc-400 dark:text-zinc-500"
          )} 
          size={15} 
        />
        <input 
          type="text" 
          placeholder="Search..." 
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          className="w-full h-full pl-10 pr-9 rounded-xl text-sm
            bg-zinc-100 dark:bg-zinc-900/50 
            border border-zinc-200 dark:border-zinc-800
            focus:bg-white dark:focus:bg-[#09090b]
            focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/40
            transition-all outline-none text-zinc-900 dark:text-zinc-100"
        />
        {query && (
          <button 
            onClick={() => { setQuery(''); setIsOpen(false); }} 
            className="absolute right-3 z-10 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Results Box & Overlay */}
      {isOpen && (
        <>
          {/* Backdrop: Fixed on mobile, absolute on desktop */}
          <div 
            className="fixed inset-0 bg-white/80 dark:bg-black/60 backdrop-blur-sm z-[50] md:hidden" 
            onClick={() => setIsOpen(false)} 
          />
          
          <div className={cn(
            "z-[55] mt-2 overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200",
            "bg-white dark:bg-[#0c0c0c] rounded-2xl",
            "fixed left-4 right-4 top-20 md:absolute md:left-0 md:right-auto md:top-full md:w-full md:max-w-[400px]"
          )}>
            <div className="p-1.5 max-h-[50vh] md:max-h-[380px] overflow-y-auto custom-scrollbar">
              {query.length > 0 ? (
                results.length > 0 ? (
                  results.map(({ item }) => (
                    <Link
                      key={item.route}
                      href={item.route}
                      onClick={() => { setIsOpen(false); setQuery(''); }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors group"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-900 group-hover:bg-white dark:group-hover:bg-zinc-800 transition-colors border border-transparent group-hover:border-zinc-200 dark:group-hover:border-zinc-700">
                        <CategoryIcon category={item.category} />
                      </div>
                      <div className="flex flex-1 flex-col overflow-hidden text-left">
                        <span className="truncate text-[13px] font-medium text-zinc-800 dark:text-zinc-200">{item.title}</span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-bold tracking-wider">{item.category}</span>
                      </div>
                      <ChevronRight size={14} className="text-zinc-300 dark:text-zinc-700 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  ))
                ) : (
                  <div className="py-10 text-center text-zinc-400 text-xs">No matches found for "{query}"</div>
                )
              ) : (
                <div className="py-6 text-center text-zinc-400 text-xs">Start typing to search...</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}