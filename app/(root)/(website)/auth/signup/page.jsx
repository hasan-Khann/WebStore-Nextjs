"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { FaRegEye, FaRegEyeSlash, FaFacebookF, FaGoogle, FaCheckCircle } from "react-icons/fa";
import logo from "@/public/assets/images/logo-black.png";
import { zSchema } from "@/lib/zodschema";
import { handleOAuthCallback } from "@/utils/handleOauthCallback";
import { showToast } from "@/lib/toast";
import { Card, CardContent } from "@/components/ui/card";
import { Buttonloading } from "@/components/application/buttonloading";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = zSchema
  .pick({ username: true, password: true })
  .extend({
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function SignupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", email: "", password: "", confirmPassword: "" },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const code = searchParams.get("code");
    const provider = searchParams.get("provider");
    if (!code || !provider) return;
    (async () => {
      try {
        if (provider === "google") await handleOAuthCallback("google", code);
        if (provider === "facebook") await handleOAuthCallback("facebook", code);
      } catch (err) {
        showToast({ type: "error", msg: "OAuth login failed" });
      }
    })();
  }, [searchParams]);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/signup", values);
      if (res.data.type === "success") {
        const params = new URLSearchParams();
        params.set("email", values.email);
        router.push(`/auth/signup/verifyotp?${params.toString()}`);
      }
      showToast({ type: res.data.type, title: res.data.title || "E-store", msg: res.data.msg });
    } catch (error) {
      showToast({ type: "error", title: "Error", msg: "Server connection failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-500 p-4 pt-24 md:pt-8 md:p-8">
      
      {/* Background Animated Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-[10%] -left-[5%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] animate-[pulse_15s_infinite] opacity-[0.05]" 
        />
      </div>

      <div 
        className={`relative z-10 w-full max-w-[550px] lg:max-w-[1100px] transition-all duration-700 ease-out transform ${
          isMounted ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]"
        }`}
      >
        <Card className="border-none shadow-[0_30px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.4)] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-0 flex flex-col lg:flex-row">
            
            {/* --- LEFT SIDE: THE ENGAGING AREA --- */}
            <div className="hidden lg:flex w-[45%] bg-slate-50 dark:bg-zinc-800/40 p-12 flex-col justify-between border-r border-slate-100 dark:border-zinc-800">
              <div className="flex flex-col">
                <div className={`transition-all duration-700 delay-100 transform ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                  <Image src={logo} alt="logo" width={130} height={45} className="dark:invert mb-16" />
                </div>
                
                <h2 className={`text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] transition-all duration-700 delay-200 transform ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                  Start the <br />
                  <span className="text-primary underline decoration-primary/20 underline-offset-8">Premium</span> experience.
                </h2>

                <div className={`mt-10 space-y-6 transition-all duration-700 delay-300 transform ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                  {[
                    "Unified Multi-vendor Management",
                    "Real-time Analytics Dashboard",
                    "Secure One-click Checkout"
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <FaCheckCircle size={16} />
                      </div>
                      <span className="text-slate-600 dark:text-zinc-300 font-semibold">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-6 bg-white dark:bg-zinc-900/50 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm transition-all duration-700 delay-500 transform ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                 <p className="text-slate-500 dark:text-zinc-400 text-sm italic leading-relaxed">
                   "The quality is ..."
                 </p>
                 <p className="mt-3 text-xs font-black dark:text-white">— A Random, Customer</p>
              </div>
            </div>

            {/* --- RIGHT SIDE: FORM SECTION --- */}
            <div className="w-full lg:w-[55%] p-8 sm:p-12 lg:p-16">
              <div className="w-full">
                
                {/* Mobile Logo */}
                <div className={`lg:hidden flex justify-center mb-10 transition-all duration-700 delay-75 transform ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                  <Image src={logo} alt="logo" width={120} height={40} className="dark:invert" />
                </div>

                <div className={`mb-10 text-center lg:text-left transition-all duration-700 delay-150 transform ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white">Create Account</h1>
                  <p className="text-slate-500 dark:text-zinc-400 mt-2 font-medium">Join us today to start shopping smarter.</p>
                </div>

                {/* Social Auth */}
                <div className={`grid grid-cols-2 gap-4 mb-8 transition-all duration-700 delay-200 transform ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                  <button type="button" onClick={() => window.location.href = "/api/auth/google"} className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 dark:border-zinc-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all text-sm font-bold dark:text-zinc-300">
                    <FaGoogle className="text-red-500" /> Google
                  </button>
                  <button type="button" onClick={() => window.location.href = "/api/auth/facebook"} className="flex items-center justify-center gap-2 py-3 px-4 bg-[#1877F2] rounded-2xl hover:opacity-90 transition-all text-sm font-bold text-white">
                    <FaFacebookF /> Facebook
                  </button>
                </div>

                <div className={`relative mb-8 transition-all duration-700 delay-250 transform ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                   <hr className="border-slate-100 dark:border-zinc-800" />
                   <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 px-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Or use email</span>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="username" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-500 dark:text-zinc-400 text-[11px] font-black uppercase">Username</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="johndoe" className="h-12 bg-slate-50/50 dark:bg-zinc-800/30 border-slate-200 dark:border-zinc-700 rounded-xl" />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-500 dark:text-zinc-400 text-[11px] font-black uppercase">Email</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="email@example.com" className="h-12 bg-slate-50/50 dark:bg-zinc-800/30 border-slate-200 dark:border-zinc-700 rounded-xl" />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-500 dark:text-zinc-400 text-[11px] font-black uppercase">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input {...field} type={showPass ? "text" : "password"} placeholder="••••••••" className="h-12 bg-slate-50/50 dark:bg-zinc-800/30 border-slate-200 dark:border-zinc-700 rounded-xl" />
                            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
                              {showPass ? <FaRegEyeSlash size={18} /> : <FaRegEye size={18} />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-500 dark:text-zinc-400 text-[11px] font-black uppercase">Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input {...field} type={showConfirmPass ? "text" : "password"} placeholder="••••••••" className="h-12 bg-slate-50/50 dark:bg-zinc-800/30 border-slate-200 dark:border-zinc-700 rounded-xl" />
                            <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                              {showConfirmPass ? <FaRegEyeSlash size={18} /> : <FaRegEye size={18} />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]">
                      <Buttonloading text="Create Account" loading={loading} type="submit" className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-black font-black rounded-xl shadow-xl mt-4" />
                    </div>
                  </form>
                </Form>

                <p className={`text-center mt-8 text-sm font-semibold text-slate-500 transition-all duration-700 delay-300 transform ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                  Already a registered? <Link href="/auth/login" className="text-primary font-black hover:underline underline-offset-4">Log In</Link>
                </p>

              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}