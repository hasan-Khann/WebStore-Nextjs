"use client";

import { useState } from "react";
import { IoMdLogOut } from "react-icons/io";
import { Loader2 } from "lucide-react"; 
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import api from "@/utils/api";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";

export const LogoutButton = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const onLogout = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const res = await api.post("/api/auth/logout");

      if (res.status === 200 || res.data?.status === 200) {
        dispatch(logout())
        toast.success("Logged out successfully");
        window.location.href = "/auth/login";
      } else {
        toast.error(res.data?.msg || "Something went wrong");
      }
    } catch (err) {
      console.error("Logout Error:", err);
      toast.error(err.response?.data?.msg || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenuItem
      onClick={onLogout}
      disabled={loading}
      className="text-destructive focus:text-destructive focus:bg-destructive/10 flex items-center gap-2 cursor-pointer py-2.5 font-medium transition-colors"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <IoMdLogOut className="text-lg" />
      )}
      <span>{loading ? "Logging out..." : "Logout"}</span>
    </DropdownMenuItem>
  );
};