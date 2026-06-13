"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Buttonloading } from "@/components/application/buttonloading";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { showToast } from "@/lib/toast";
import { Eye, EyeOff, ShieldCheck, ArrowLeft } from "lucide-react";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/slices/authSlice";
import Link from "next/link";

const otpPasswordSchema = z
  .object({
    otp: z
      .string()
      .length(4, "OTP must be exactly 4 digits")
      .regex(/^\d+$/, "OTP must contain only numbers"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const VerifyOtpPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [email, setEmail] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm({
    resolver: zodResolver(otpPasswordSchema),
    defaultValues: {
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (!emailParam) {
      showToast({ type: "error", msg: "Email missing, redirecting..." });
      router.push("/auth/signup");
    } else {
      setEmail(emailParam);
    }
  }, [searchParams, router]);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/verifyotp", {
        otp: values.otp,
        email: email,
        password: values.newPassword,
      });

      const data = res.data;

      showToast({
        type: data.type || "success",
        title: data.title || "Success",
        msg: data.msg,
      });

      if (res.status === 200) {
        dispatch(setCredentials({ user: data.user }));
        const href = data.user.role === "admin" ? "/admin/dashboard" : "/home";
        router.push(href);
      }
    } catch (err) {
      showToast({
        type: "error",
        title: "Error",
        msg: err.response?.data?.msg || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-500 p-4 pt-24 md:pt-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] animate-pulse" />
      </div>

      <div
        className={`relative z-10 w-full max-w-md transition-all duration-700 ease-out ${
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl overflow-hidden rounded-[2.5rem]">
          <CardContent className="p-8 sm:p-10">
            <div className="transition-all duration-500 delay-100 ease-out">
              <Link
                href="/auth/login"
                className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary mb-6 transition-all duration-300 group"
              >
                <ArrowLeft
                  size={16}
                  className="mr-2 transition-transform duration-300 group-hover:-translate-x-1"
                />
                Back to login
              </Link>
            </div>

            <div className="flex flex-col items-center text-center mb-8 transition-all duration-500 delay-150 ease-out">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/30 rotate-3 transition-transform duration-300 hover:rotate-6">
                <ShieldCheck className="w-8 h-8 text-white -rotate-3" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Verify your email
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
                We&apos;ve sent a 4-digit code to <br />
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  {email}
                </span>
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="transition-all duration-500 delay-200 ease-out">
                  <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-600 dark:text-zinc-400 font-bold text-[10px] uppercase tracking-[0.2em] block text-center mb-2">
                          Verification Code
                        </FormLabel>
                        <FormControl>
                          <Input
                            maxLength={4}
                            placeholder="0 0 0 0"
                            {...field}
                            className="text-center text-3xl tracking-[0.5em] font-black h-16 rounded-2xl border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 focus:-translate-y-0.5"
                          />
                        </FormControl>
                        <FormMessage className="text-center" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <div className="transition-all duration-500 delay-250 ease-out">
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                            New Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showNewPass ? "text" : "password"}
                                placeholder="Min. 6 characters"
                                {...field}
                                className="h-12 rounded-xl pr-10 bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-primary/20 transition-all duration-300 focus:-translate-y-0.5"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPass(!showNewPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-all duration-300 hover:text-slate-600 dark:hover:text-zinc-200"
                              >
                                {showNewPass ? (
                                  <EyeOff size={18} />
                                ) : (
                                  <Eye size={18} />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="transition-all duration-500 delay-300 ease-out">
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                            Confirm Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPass ? "text" : "password"}
                                placeholder="Repeat password"
                                {...field}
                                className="h-12 rounded-xl pr-10 bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-primary/20 transition-all duration-300 focus:-translate-y-0.5"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPass(!showConfirmPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-all duration-300 hover:text-slate-600 dark:hover:text-zinc-200"
                              >
                                {showConfirmPass ? (
                                  <EyeOff size={18} />
                                ) : (
                                  <Eye size={18} />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="transition-all duration-500 delay-350 ease-out hover:-translate-y-0.5 active:scale-[0.99]">
                  <Buttonloading
                    type="submit"
                    text="Reset & Login"
                    loading={loading}
                    className="w-full h-14 rounded-2xl text-base font-bold bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-all duration-300 shadow-lg"
                  />
                </div>
              </form>
            </Form>

            <div className="mt-8 text-center transition-all duration-500 delay-400 ease-out">
              <p className="text-sm text-slate-500">
                Didn&apos;t get the code?{" "}
                <button
                  type="button"
                  className="font-bold text-primary hover:underline underline-offset-4 transition-all duration-300"
                  onClick={() => window.location.reload()}
                >
                  Resend Code
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpPage />
    </Suspense>
  );
}