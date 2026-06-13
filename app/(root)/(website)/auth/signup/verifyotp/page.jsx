"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { showToast } from "@/lib/toast";
import { Card, CardContent } from "@/components/ui/card";
import { Buttonloading } from "@/components/application/buttonloading";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { setCredentials } from "@/store/slices/authSlice";
import { useDispatch } from "react-redux";
import { FaShieldAlt } from "react-icons/fa";

function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (otp.length !== 4) {
      showToast({ type: "error", msg: "Please enter the 4-digit code" });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/auth/otpverify", {
        email: email,
        otp: otp,
      });

      const data = res.data;

      if (data.status === 201 || data.status === 200) {
        showToast({
          type: "success",
          title: "Verified",
          msg: data.msg || "Account verified successfully",
        });
        
        dispatch(setCredentials({ user: data.user }));
        const href = data.user.role === "admin" ? "/admin/dashboard" : "/home";
        router.push(href);
      } else {
        showToast({ type: data.type || "error", msg: data.msg });
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        msg: error.response?.data?.msg || "Invalid OTP or server error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-500 p-4 pt-24 md:pt-8 md:p-8">
      
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[60%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-[pulse_8s_infinite] opacity-[0.05]" 
        />
      </div>

      <div 
        className={`relative z-10 w-full max-w-[500px] transition-all duration-500 ease-out transform ${
          isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
        <Card className="border-none shadow-[0_30px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-3xl rounded-[3rem] overflow-hidden">
          <CardContent className="p-8 sm:p-12 lg:p-14">
            
            <div className="flex flex-col items-center text-center mb-10">
              <div 
                className={`w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-8 text-primary shadow-inner border border-primary/5 transition-transform duration-500 cubic-bezier(0.34,1.56,0.64,1) transform ${
                  isMounted ? "scale-100" : "scale-50"
                }`}
              >
                <FaShieldAlt className="text-4xl" />
              </div>
              
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
                Verify Your Email
              </h1>
              <p className="text-sm sm:text-base text-slate-500 dark:text-zinc-400 max-w-[300px] leading-relaxed font-medium">
                We&apos;ve sent a 4-digit verification code to: <br />
                <span className="font-black text-slate-900 dark:text-white break-all">{email || "your email"}</span>
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-12 flex flex-col items-center">
              <InputOTP
                maxLength={4}
                value={otp}
                onChange={(value) => setOtp(value)}
                pattern={REGEXP_ONLY_DIGITS}
                containerClassName="group flex items-center justify-center"
              >
                <InputOTPGroup className="gap-3 sm:gap-4 lg:gap-5">
                  {[0, 1, 2, 3].map((index) => (
                    <InputOTPSlot 
                      key={index}
                      index={index} 
                      className="w-14 h-16 sm:w-16 sm:h-20 lg:w-20 lg:h-24 text-2xl sm:text-3xl font-black border-2 border-slate-100 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950/50 focus:ring-4 focus:ring-primary/20 transition-all text-slate-900 dark:text-white" 
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              <div className="w-full space-y-6">
                <Buttonloading
                  text="Verify & Activate"
                  loading={loading}
                  type="submit"
                  className="w-full h-14 sm:h-16 rounded-2xl text-base font-black bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90 shadow-xl shadow-black/10 dark:shadow-white/5 transition-all active:scale-[0.98]"
                />

                <div className="text-center">
                  <p className="text-sm font-bold text-slate-500 dark:text-zinc-500">
                    Didn&apos;t receive the code?{" "}
                    <button 
                      type="button" 
                      className="text-primary hover:underline underline-offset-4 transition-colors font-black"
                      onClick={() => {/* Resend logic */}}
                    >
                      Resend Now
                    </button>
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOTPPage />
    </Suspense>
  );
}