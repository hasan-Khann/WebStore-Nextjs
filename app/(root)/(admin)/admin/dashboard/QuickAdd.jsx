"use client";
import Link from "next/link";
import { BiCategory } from "react-icons/bi";
import { IoMdStarOutline } from "react-icons/io";
import { IoShirtOutline } from "react-icons/io5";
import { LuImagePlus, LuLayers } from "react-icons/lu";

const quickActions = [
  { label: "Category", icon: BiCategory, color: "text-zinc-900 dark:text-white", bg: "bg-zinc-100 dark:bg-zinc-800", src: "/admin/category/add" },
  { label: "Coupon", icon: IoMdStarOutline, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", src: "/admin/coupon/add" },
  { label: "Product", icon: IoShirtOutline, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", src: "/admin/product/add" },
  { label: "Media", icon: LuImagePlus, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", src: "/admin/media/add" },
  { label: "Variant", icon: LuLayers, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10", src: "/admin/product-variant/add" },
];

const QuickAdd = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {quickActions.map(({ label, icon: Icon, color, bg, src }) => (
        <Link
          key={label} 
          href={src}
          className="group flex items-center gap-3 rounded-2xl bg-white dark:bg-zinc-900 p-3 border border-zinc-200 dark:border-zinc-800 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg"
        >
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${bg} ${color}`}>
            <Icon size={20} />
          </span>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Manage</span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{label}</span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default QuickAdd;