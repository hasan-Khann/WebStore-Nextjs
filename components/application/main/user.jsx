"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  FiChevronDown,
  FiArrowRight,
  FiPackage,
  FiShield,
  FiLogOut,
  FiLogIn,
} from "react-icons/fi";
import { logout } from "@/store/slices/authSlice";

const DropdownLink = ({ href, icon, label, sub }) => (
  <Link
    href={href}
    className="flex items-center justify-between p-3 rounded-xl
    hover:bg-zinc-100 dark:hover:bg-white/10 transition-all duration-200 group"
  >
    <div className="flex items-center gap-3">
      <span className="text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">
        {icon}
      </span>
      <div>
        <p className="text-[11px] font-black uppercase tracking-wider dark:text-zinc-200">
          {label}
        </p>
        <p className="text-[9px] text-zinc-400">{sub}</p>
      </div>
    </div>

    <FiArrowRight className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
  </Link>
);

const AccountDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/logout`);
      dispatch(logout());
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="flex items-center gap-2 px-4 py-2 rounded-full
        bg-zinc-900 dark:bg-white text-white dark:text-black
        hover:opacity-90 active:scale-95 transition"
      >
        <FiLogIn size={14} />
        <span className="text-[10px] font-black uppercase tracking-widest">
          Login
        </span>
      </Link>
    );
  }

  const initials =
    user.username
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="flex items-center gap-2 p-1 pr-3 rounded-full
        bg-zinc-100 dark:bg-white/5
        hover:border-zinc-200 dark:hover:border-white/10
        transition active:scale-95"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-800 via-zinc-700 to-zinc-500 flex items-center justify-center text-[10px] font-black text-white">
          {initials}
        </div>

        <span className="hidden md:block text-[10px] font-black uppercase dark:text-white">
          {user.username}
        </span>

        <FiChevronDown
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          size={12}
        />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40"
        />
      )}

      {/* Dropdown */}
      <div
        className={`absolute right-0 mt-4 w-[280px] z-50 rounded-2xl border
        bg-white dark:bg-zinc-950 shadow-xl overflow-hidden
        transition-all duration-200 origin-top-right
        ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-2 pointer-events-none"
        }`}
      >
        <div className="p-5 border-b bg-zinc-50/50 dark:bg-white/5">
          <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 font-black">
            Member Profile
          </p>
          <h4 className="text-sm font-black uppercase dark:text-white truncate">
            {user.username}
          </h4>
          <p className="text-[10px] text-zinc-500 truncate">
            {user.email}
          </p>
        </div>

        <div className="p-2 space-y-1">
          <DropdownLink
            href="/orders"
            icon={<FiPackage />}
            label="Order History"
            sub="Manage purchases"
          />
          <DropdownLink
            href="/auth/login/forgetpassword"
            icon={<FiShield />}
            label="Security"
            sub="Password reset"
          />
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full justify-between items-center p-4
          text-red-500 hover:bg-zinc-50 dark:hover:bg-white/5 transition"
        >
          <div className="flex items-center gap-3">
            <FiLogOut />
            <span className="text-[11px] font-black uppercase">
              Logout
            </span>
          </div>
          <FiArrowRight />
        </button>
      </div>
    </div>
  );
};

export default AccountDropdown;
