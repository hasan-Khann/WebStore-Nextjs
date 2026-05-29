"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  IoShirtOutline, 
  IoSettingsOutline, 
  IoLockClosedOutline, 
  IoLogInOutline 
} from "react-icons/io5";
import { MdOutlineShoppingBag } from "react-icons/md";
import { LogoutButton } from "@/components/application/admin/LogoutButton";

export default function UserDropdown() {
  const accessToken = useSelector((state) => state.auth.user);
  
  const [profile] = useState(null); 
  const [loading] = useState(false);

  if (!accessToken) {
    return (
      <Button variant="outline" size="sm" asChild className="rounded-full px-5 shadow-sm">
        <Link href="/auth/login" className="flex items-center gap-2">
          <IoLogInOutline className="text-lg" />
          <span>Login</span>
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative rounded-full outline-none ring-offset-2 transition focus:ring-2 focus:ring-primary hover:opacity-90">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage
              src={profile?.avatar || "https://github.com/shadcn.png"}
              alt={profile?.username || "user profile"}
            />
            <AvatarFallback className="bg-muted">
              {loading ? "..." : (profile?.username?.[0]?.toUpperCase() || "U")}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 p-2" sideOffset={8}>
        <DropdownMenuLabel className="font-normal px-2 py-1.5">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none">
              {profile?.username || "My Account"}
            </p>
            <p className="text-xs leading-none text-muted-foreground italic">
              {profile?.email || "Administrator"}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />

        {/* --- Navigation --- */}
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-accent py-2">
          <Link href="/admin/products" className="flex w-full items-center gap-2">
            <IoShirtOutline className="text-muted-foreground" /> 
            <span>New product</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer focus:bg-accent py-2">
          <Link href="/admin/orders" className="flex w-full items-center gap-2">
            <MdOutlineShoppingBag className="text-muted-foreground" /> 
            <span>Orders</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* --- Security & Settings --- */}
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-accent py-2">
          <Link href="/reset-password" title="Security" className="flex w-full items-center gap-2">
            <IoLockClosedOutline className="text-muted-foreground" />
            <span>Reset Password</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer focus:bg-accent py-2">
          <Link href="/settings" className="flex w-full items-center gap-2">
            <IoSettingsOutline className="text-muted-foreground" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="pt-1">
          <LogoutButton />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}