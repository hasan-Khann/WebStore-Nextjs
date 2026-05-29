"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { zSchema } from "@/lib/zodschema";
import { FaRegEye, FaRegEyeSlash, FaFacebookF, FaGoogle } from "react-icons/fa";
import logo from "@/public/assets/images/logo-black.png";
import axios from "axios";
import { z } from "zod";
import { showToast } from "@/lib/toast";
import { setCredentials } from "@/store/slices/authSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

const Page = () => {
  const [loading, setLoading] = useState(false);
  const [showChar, setShowChar] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const formSchema = z.object({
    email: z.string().min(1, "Required").email("Invalid email"),
    password: zSchema.shape.password,
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onLoginSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", values);
      if (res.data.status === 200) {
        dispatch(setCredentials({ user: res.data.user }));
        router.push(
          res.data.user.role === "admin" ? "/admin/dashboard" : "/home"
        );
      } else {
        showToast({ type: res.data.type, title: "Auth", msg: res.data.msg });
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        msg: "Server connection failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-500 p-4 pt-24 md:pt-8 md:p-8">
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] animate-pulse" />
      </div>

      <div
        className={`relative z-10 w-full max-w-[550px] lg:max-w-[1000px] transition-all duration-700 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white/80 dark:bg-zinc-900/90 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-0 flex flex-col lg:flex-row">
            <div
              className={`hidden lg:flex w-1/2 bg-slate-100 dark:bg-zinc-800/50 p-12 flex-col justify-between border-r border-slate-200 dark:border-zinc-800 transition-all duration-700 delay-100 ease-out ${
                mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"
              }`}
            >
              <div>
                <Image
                  src={logo}
                  alt="logo"
                  width={140}
                  height={50}
                  className="dark:invert mb-12 transition-transform duration-300 hover:scale-[1.02]"
                />
                <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  The future of <br />
                  <span className="text-primary">E-commerce</span> is here.
                </h2>
                <p className="mt-6 text-slate-500 dark:text-zinc-400 text-lg">
                  Join thousands of users and start managing your store with
                  precision.
                </p>
              </div>
              <div className="flex gap-4 items-center text-sm text-slate-400">
                <span className="px-3 py-1 rounded-full border border-slate-200 dark:border-zinc-700">
                  v3.0.1
                </span>
                <span>© 2026 E-Store Inc.</span>
              </div>
            </div>

            <div
              className={`w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 transition-all duration-700 delay-200 ease-out ${
                mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"
              }`}
            >
              <div className="w-full">
                <div className="lg:hidden flex justify-center mb-8 transition-all duration-500 delay-100 ease-out">
                  <Image
                    src={logo}
                    alt="logo"
                    width={120}
                    height={40}
                    className="dark:invert transition-transform duration-300 hover:scale-[1.03]"
                  />
                </div>

                <div className="mb-8 text-center lg:text-left transition-all duration-500 delay-150 ease-out">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    Sign In
                  </h1>
                  <p className="text-slate-500 dark:text-zinc-400 mt-2">
                    Enter your credentials to continue
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 transition-all duration-500 delay-200 ease-out">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 dark:border-zinc-700 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all duration-300 text-sm font-semibold text-slate-700 dark:text-zinc-300 hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <FaGoogle className="text-red-500" /> Google
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-[#1877F2] rounded-xl hover:opacity-90 transition-all duration-300 text-sm font-semibold text-white hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <FaFacebookF /> Facebook
                  </button>
                </div>

                <div className="relative mb-8 text-center transition-all duration-500 delay-250 ease-out">
                  <hr className="border-slate-200 dark:border-zinc-800" />
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 px-4 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                    Or Email
                  </span>
                </div>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onLoginSubmit)}
                    className="space-y-5"
                  >
                    <div className="transition-all duration-500 delay-300 ease-out">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-600 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 h-12 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all duration-300 focus:-translate-y-0.5"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="transition-all duration-500 delay-350 ease-out">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between items-center">
                              <FormLabel className="text-slate-600 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                Password
                              </FormLabel>
                              <Link
                                href="login/forgotpassword"
                                className="text-xs text-primary font-bold hover:underline"
                              >
                                Forgot?
                              </Link>
                            </div>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={showChar ? "text" : "password"}
                                  className="bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 h-12 rounded-xl pr-10 focus:ring-2 focus:ring-primary/20 transition-all duration-300 focus:-translate-y-0.5"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowChar(!showChar)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-all duration-300 hover:text-slate-600 dark:hover:text-zinc-200"
                                >
                                  {showChar ? (
                                    <FaRegEyeSlash size={18} />
                                  ) : (
                                    <FaRegEye size={18} />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="transition-all duration-500 delay-400 ease-out hover:-translate-y-0.5 active:scale-[0.99]">
                      <Buttonloading
                        type="submit"
                        text="Login to Dashboard"
                        loading={loading}
                        className="w-full h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold hover:opacity-90 transition-all duration-300 shadow-lg"
                      />
                    </div>
                  </form>
                </Form>

                <p className="mt-8 text-center text-sm text-slate-500 transition-all duration-500 delay-500 ease-out">
                  Don't have an account?{" "}
                  <Link
                    href="/auth/signup"
                    className="text-primary font-bold hover:underline underline-offset-4"
                  >
                    Sign up free
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;