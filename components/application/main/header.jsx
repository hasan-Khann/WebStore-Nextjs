"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FiMenu, FiChevronDown, FiX } from "react-icons/fi";
import gsap from "gsap";
import axios from "axios";
import AccountDropdown from "./user";
import { CartSidebar } from "./CartSidebar";
import Themeswitch from "../admin/Themeswitch";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState([]);

  const menuRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_BASE_URL || "";
    if (url) {
      axios.get(`${url}/api/category/get?size=5`)
        .then((res) => setCategories(res.data?.data || []))
        .catch(err => console.error("Header API Error:", err));
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!menuRef.current || !overlayRef.current) return;

    if (isMobileMenuOpen) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.2, pointerEvents: "auto" });
      gsap.to(menuRef.current, { x: 0, duration: 0.3, ease: "power3.out" });
    } else {
      gsap.to(menuRef.current, { x: "100%", duration: 0.25 });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, pointerEvents: "none" });
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      <div className={`fixed top-0 left-0 h-[2px] bg-amber-500 z-[130] transition-all duration-300 ${isScrolled ? "w-full" : "w-0"}`} />

      <header className={`fixed top-0 w-full z-[100] transition-all duration-300 ${isScrolled ? "py-2" : "py-4"}`}>
        <div className="max-w-7xl mx-auto px-4">
          <nav className={`flex items-center justify-between px-6 py-2 rounded-full transition-all duration-300 ${isScrolled ? "bg-white/70 dark:bg-zinc-950/70 backdrop-blur border shadow" : ""}`}>
            <Link className="font-black uppercase tracking-tight" href="/">NULL</Link>

            <div className="hidden lg:flex items-center gap-8">
              <Link href="/" className="nav-link">Home</Link>
              <Link href="/shop" className="nav-link">Shop</Link>
              <div className="relative group">
                <button className="nav-link flex items-center gap-1">
                  Collections <FiChevronDown className="transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-4 min-w-[150px]">
                    {categories.map((c) => (
                      <Link key={c._id} href={`/shop?category=${c.slug}`} className="block px-3 py-2 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-amber-500 transition">
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Themeswitch />
              <AccountDropdown />
              <CartSidebar />
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 transition">
                <FiMenu size={22} />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <div ref={overlayRef} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/40 opacity-0 z-[140] pointer-events-none" />

      <div ref={menuRef} className="fixed right-0 top-0 h-full w-[280px] bg-white dark:bg-zinc-950 z-[150] p-6 translate-x-full border-l dark:border-zinc-800">
        <div className="flex justify-between mb-6">
          <span className="font-bold">Menu</span>
          <FiX className="cursor-pointer" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
        <div className="flex flex-col gap-4">
          {categories.map((c) => (
            <Link key={c._id} href={`/shop?category=${c.slug}`} onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-600 dark:text-zinc-400 hover:text-amber-500 transition uppercase text-xs font-bold tracking-widest">
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}