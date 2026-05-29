"use client";

import React, { useState } from "react";
import { Shield, User, Briefcase, Lock, CheckCircle2, ShieldAlert } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Buttonloading } from "@/components/application/buttonloading";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import axios from "axios";

const ROLES = [
  { id: "user", label: "Customer", icon: User, desc: "Standard store access" },
  { id: "employee", label: "Staff", icon: Briefcase, desc: "Inventory & Orders" },
  { id: "admin", label: "Administrator", icon: Shield, desc: "Full System Control" },
];

export const EditRoleDialog = ({ userId, currentRole, trigger }) => {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password) return showToast({ type: "error", msg: "Admin password required" });
    setLoading(true);
    try {
      const res = await axios.post(`/api/user/role`, {
        id: userId,
        role: selectedRole,
        password,
      });
      if (res.data.type === "success") {
        showToast({ type: "success", msg: "Permissions updated" });
        setOpen(false);
        setPassword("");
      }
    } catch (error) {
      showToast({ type: "error", msg: error.response?.data?.msg || "Update failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">{trigger}</div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-xl rounded-[2rem] border-none p-0 overflow-hidden shadow-2xl bg-white dark:bg-zinc-950">
          <div className="bg-zinc-900 dark:bg-zinc-900 p-8 text-white">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <ShieldAlert className="text-indigo-400" size={20} />
                </div>
                <DialogTitle className="text-xl font-bold uppercase tracking-tight">Access Control</DialogTitle>
              </div>
              <DialogDescription className="text-zinc-400 font-medium text-xs leading-relaxed">
                Modifying user privileges affects system-wide security. This action requires administrative re-authentication.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {ROLES.map(({ id, label, icon: Icon }) => (
                <Card
                  key={id}
                  onClick={() => setSelectedRole(id)}
                  className={cn(
                    "relative cursor-pointer transition-all duration-300 rounded-2xl border-2 overflow-hidden shadow-none",
                    selectedRole === id 
                      ? "border-indigo-600 bg-indigo-50/30 dark:bg-indigo-900/10" 
                      : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200"
                  )}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                    {selectedRole === id && (
                      <div className="absolute top-2 right-2 text-indigo-600 animate-in zoom-in">
                        <CheckCircle2 size={16} fill="currentColor" className="text-white dark:text-indigo-950" />
                      </div>
                    )}
                    <div className={cn(
                      "p-3 rounded-xl transition-colors", 
                      selectedRole === id ? "bg-indigo-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                    )}>
                      <Icon size={22} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-wider">{label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] flex items-center gap-2">
                <Lock size={12} /> Confirm Admin Identity
              </Label>
              <Input
                type="password"
                placeholder="Verify Current Password"
                className="h-12 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl font-bold focus:ring-2 focus:ring-indigo-600/20 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Buttonloading
              text="Update Permissions"
              loading={loading}
              onClick={handleSubmit}
              className="w-full h-12 bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 hover:bg-indigo-600 hover:text-white font-bold rounded-xl shadow-lg transition-all"
              disabled={!password || loading}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};