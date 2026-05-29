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
import { z } from "zod";
import logo from "@/public/assets/images/logo-black.png";
import axios from "axios";
import { showToast } from "@/lib/toast";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/forgotpassword", values);
      const data = res.data;

      if (data?.status === 200) {
        showToast({
          type: "success",
          title: "Success",
          msg: data.msg,
        });

        const params = new URLSearchParams();
        params.set("email", values.email);
        router.push(`/auth/login/forgotpassword/verifyotp?${params.toString()}`);
      } else {
        showToast({
          type: data.type || "error",
          title: data.title || "Error",
          msg: data.msg || "Something went wrong",
        });
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Network Error",
        msg: "Server not responding. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-500 p-4 pt-24 md:pt-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px] animate-pulse" />
      </div>

      <div
        className={`relative z-10 w-full max-w-xl transition-all duration-700 ease-out ${
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl overflow-hidden rounded-[2.5rem]">
          <CardContent className="p-8 sm:p-12 lg:p-16">
            <div className="flex flex-col">
              {/* Header Section */}
              <div className="flex flex-col items-center text-center mb-10 transition-all duration-500 delay-100 ease-out">
                <div className="relative w-32 h-12 mb-8 transition-transform duration-300 hover:scale-[1.03]">
                  <Image
                    src={logo}
                    alt="logo"
                    fill
                    className="object-contain dark:invert"
                    priority
                  />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  Forgot Password?
                </h1>
                <p className="mt-4 text-base text-slate-500 dark:text-zinc-400 max-w-sm">
                  Don&apos;t worry, it happens. Enter your email below to
                  receive a 4-digit verification code.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
                  <div className="transition-all duration-500 delay-200 ease-out">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-600 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider ml-1">
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="name@company.com"
                              type="email"
                              {...field}
                              className="bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 h-14 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-base px-6 focus:-translate-y-0.5"
                            />
                          </FormControl>
                          <FormMessage className="text-xs font-semibold ml-1" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="transition-all duration-500 delay-300 ease-out hover:-translate-y-0.5 active:scale-[0.99]">
                    <Buttonloading
                      type="submit"
                      text="Send Verification Code"
                      loading={loading}
                      className="w-full h-14 rounded-2xl text-base font-bold bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-all duration-300 shadow-lg shadow-primary/10"
                    />
                  </div>
                </form>
              </Form>

              <div className="text-center mt-10 transition-all duration-500 delay-400 ease-out">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-all duration-300 group"
                >
                  <FaArrowLeft className="text-xs transition-transform duration-300 group-hover:-translate-x-1" />
                  Back to Login
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;