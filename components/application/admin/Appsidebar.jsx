"use client";

import React, { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { adminSideBarMenu } from "@/lib/adminsidebar";

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();

  // Evaluates strictly across all screens (Desktop, Tablet, Mobile)
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-[#09090b] transition-transform duration-300 ease-in-out will-change-transform"
    >
      <div className="flex flex-col h-full bg-white dark:bg-[#09090b]">
        
        <SidebarHeader className="h-16 flex items-center px-4 shrink-0 border-b border-zinc-100 dark:border-zinc-800/40">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-lg">
              <Command size={18} strokeWidth={2.5} />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col animate-in fade-in duration-300">
                <span className="text-[11px] font-black tracking-[0.2em] text-zinc-900 dark:text-zinc-100 uppercase">
                  ADMIN
                </span>
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase mt-1">
                  INVENTORY MANAGEMENT
                </span>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="px-3 py-6 scrollbar-none overflow-y-auto overflow-x-hidden">
          <SidebarMenu className="gap-1.5">
            {adminSideBarMenu.map((item) => {
              const hasSub = item.subMenu && item.subMenu.length > 0;
              const isChildActive = item.subMenu?.some((s) => pathname === s.url);
              const isActive = pathname === item.url || isChildActive;

              return (
                <SidebarMenuItem key={item.title}>
                  {hasSub ? (
                    <Collapsible defaultOpen={isActive} className="group/collapsible w-full">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          className={cn(
                            "h-10 px-3 rounded-xl transition-colors duration-200",
                            isActive 
                              ? "bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100" 
                              : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/30"
                          )}
                        >
                          <item.icon size={18} className={cn("shrink-0 transition-colors", isActive ? "text-amber-500" : "opacity-70")} />
                          {!isCollapsed && (
                            <>
                              <span className="flex-1 ml-3 text-[11px] font-bold uppercase tracking-wide text-left">
                                {item.title}
                              </span>
                              <ChevronRight className={cn("h-3.5 w-3.5 transition-transform duration-300 opacity-40", isActive && "rotate-90 opacity-100")} />
                            </>
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      
                      {!isCollapsed && (
                        <CollapsibleContent className="overflow-hidden transition-all duration-300 ease-in-out">
                          <SidebarMenuSub className="ml-4 mt-1 border-l border-zinc-200 dark:border-zinc-800 pl-3 gap-1 py-1">
                            {item.subMenu.map((sub) => {
                              const isSubActive = pathname === sub.url;
                              return (
                                <SidebarMenuSubItem key={sub.title}>
                                  <SidebarMenuSubButton asChild isActive={isSubActive}>
                                    <Link
                                      href={sub.url}
                                      className={cn(
                                        "block px-3 py-2 text-[10px] font-bold tracking-wide rounded-lg transition-colors",
                                        isSubActive
                                          ? "text-amber-600 dark:text-amber-500 bg-amber-500/10"
                                          : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                                      )}
                                    >
                                      {sub.title}
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      )}
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={cn(
                        "h-10 px-3 rounded-xl transition-all duration-200 relative group",
                        isActive 
                          ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-md" 
                          : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/30"
                      )}
                    >
                      <Link href={item.url}>
                        <item.icon size={18} className={cn("shrink-0", isActive ? "opacity-100" : "opacity-70")} />
                        {!isCollapsed && (
                          <span className="ml-3 text-[11px] font-bold uppercase tracking-wide">
                            {item.title}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        {!isCollapsed && (
          <div className="p-4 mt-auto border-t border-zinc-100 dark:border-zinc-800/40">
             <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800/50">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none">Status</span>
                  <span className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100 mt-1">Live</span>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
             </div>
          </div>
        )}
      </div>
    </Sidebar>
  );  
}