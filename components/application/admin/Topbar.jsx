"use client";

import React from "react";
import Link from "next/link";
import { RiMenu4Fill, RiHome4Line } from "react-icons/ri";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Themeswitch from "./Themeswitch";
import UserDropdown from "./userdropdown";
import AdminSearch from "./search";

const adminRoutes = [
  { title: "Dashboard", route: "/admin/dashboard", category: "General" },
  { title: "Categories List", route: "/admin/categories", category: "Catalog" },
  { title: "Add New Category", route: "/admin/categories/add", category: "Catalog" },
  { title: "Products", route: "/admin/products", category: "Catalog" },
  { title: "Product Variants", route: "/admin/products/variants", category: "Catalog" },
  { title: "Media Library", route: "/admin/media", category: "Assets" },
  { title: "Coupons & Discounts", route: "/admin/coupons", category: "Marketing" },
  { title: "Orders Overview", route: "/admin/orders", category: "Sales" },
  { title: "User Management", route: "/admin/users", category: "Management" },
];

export default function Topbar() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-40 h-16 w-full border-b border-zinc-200 dark:border-zinc-800/50 
      bg-white dark:bg-[#09090b] 
      md:bg-white/80 md:dark:bg-[#09090b]/80 md:backdrop-blur-xl 
      transition-colors duration-300">
      
      <div className="flex h-full items-center justify-between px-4 sm:px-8 gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button 
            onClick={toggleSidebar} 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0 rounded-xl active:scale-95 transition-transform"
          >
            <RiMenu4Fill size={20} />
          </Button>

          <Link 
            href="/" 
            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 shrink-0 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all shadow-sm"
          >
            <RiHome4Line size={18} />
          </Link>

          <div className="flex-1 max-w-[420px]">
            <AdminSearch data={adminRoutes} />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="flex items-center gap-1">
            <Themeswitch />
          </div>
          
          <div className="flex items-center gap-3 pl-4 border-l border-zinc-200 dark:border-zinc-800 h-8">
            <div className="hidden md:flex flex-col items-end pointer-events-none">
              <span className="text-[10px] font-black uppercase text-zinc-900 dark:text-zinc-100 leading-none tracking-wider">
                Administrator
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                  Active
                </span>
                <span className="h-1 w-1 rounded-full bg-emerald-500" />
              </div>
            </div>
            
            <div className="rounded-full transition-all">
               <UserDropdown />
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}