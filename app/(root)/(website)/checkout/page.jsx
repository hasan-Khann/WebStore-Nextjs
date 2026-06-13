"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import gsap from "gsap";

import { clearCartDB } from "@/store/slices/cartSlice";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Truck,
  ChevronLeft,
  ShoppingBag,
  Loader2,
  CreditCard,
  Wallet,
  Tag,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const checkoutSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  coupon: z.string().optional(),
  address: z.object({
    city: z.string().min(2, "City is required"),
    area: z.string().min(3, "Area / Society is required"),
    unit: z.string().min(1, "House / Plot / Shop No is required"),
  }),
});

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const containerRef = useRef(null);

  const cart = useSelector((s) => s.cart?.items || []);
  const { user } = useSelector((s) => s.auth || {});

  const [loadingForm, setLoadingForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const form = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.name || "",
      email: user?.email || "",
      phone: "",
      coupon: "",
      address: { city: "", area: "", unit: "" },
    },
  });

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );
  const shippingCost = subtotal > 5000 || subtotal === 0 ? 0 : 250;
  const total = subtotal + shippingCost;

  useEffect(() => {
    if (cart.length > 0) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline();
        tl.from(".animate-header", { opacity: 0, y: -20, duration: 0.8, ease: "power3.out" })
          .from(".animate-form-section", {
            opacity: 0,
            y: 30,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            clearProps: "all",
          }, "-=0.5")
          .from(".animate-sidebar", {
            opacity: 0,
            x: 20,
            duration: 1,
            ease: "power3.out",
            clearProps: "all",
          }, "-=0.8");
      }, containerRef);
      return () => ctx.revert();
    }
  }, [cart.length]);

  const onSubmit = async (values) => {
    const procToast = toast.loading("Processing your order...");
    setLoadingForm(true);

    try {
      const endpoint = user ? "/api/order/create" : "/api/order/create/guest";
      const res = await axios.post(endpoint, {
        customer: values,
        cart,
        paymentMethod,
        couponCode: values.coupon,
      });

      if (res.data.type === "redirect") {
        if (res.data.details?.couponApplied) {
          toast.success(`Coupon Applied! Saved Rs. ${res.data.details.discount}`, { id: procToast });
          setTimeout(() => toast.info("Preparing secure payment gateway..."), 800);
        } else {
          toast.success("Order Initialized!", { id: procToast });
        }
          setTimeout(() => { window.location.href = res.data.url; }, 4000);
        return;
      }

      if (res.data.type === "success") {
        dispatch(clearCartDB());
        const successMsg = res.data.details?.couponApplied
          ? `Success! Coupon applied. Total: Rs. ${res.data.finalPrice.toLocaleString()}`
          : "Order placed successfully! Thank you.";

        toast.success(successMsg, { id: procToast, duration: 5000 });
        setTimeout(() => { router.push(`/order-success?id=${res.data.orderId}`); }, 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Something went wrong.";
      toast.error(errorMessage, { id: procToast, duration: 5000 });
      setLoadingForm(false);
    }
  };

  if (cart.length === 0) return <EmptyCartView />;

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FDFDFC] dark:bg-[#080808] pb-12 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-32">
        <div className="mb-10 animate-header">
          <Link
            href="/cart"
            className="flex items-center gap-2 text-zinc-400 hover:text-amber-600 transition-colors text-[10px] font-black uppercase tracking-widest mb-4"
          >
            <ChevronLeft size={12} /> Back to Cart
          </Link>
          <h1 className="text-4xl md:text-6xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Checkout<span className="text-amber-600">.</span>
          </h1>
        </div>

        <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-8 items-start">
          <div className="w-full lg:col-span-7 space-y-12">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                {/* Shipping Details */}
                <section className="animate-form-section">
                  <div className="flex items-center gap-3 mb-8">
                    <Truck size={18} className="text-amber-600" />
                    <h3 className="font-bold text-xl uppercase tracking-tighter">Shipping Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="label-heading">Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Recipient Name" className="checkout-input" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="label-heading">Contact Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+92 --- -------" className="checkout-input" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="label-heading">Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="email@address.com" className="checkout-input" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {["address.city", "address.area", "address.unit"].map((path, idx) => (
                        <FormField
                          key={path}
                          control={form.control}
                          name={path}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder={["City", "Area / Society", "Unit / House #"][idx]}
                                  className="checkout-input-pill"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </section>

                {/* Payment Selection */}
                <section className="pt-4 animate-form-section">
                  <div className="flex items-center gap-3 mb-8">
                    <CreditCard size={18} className="text-amber-600" />
                    <h3 className="font-bold text-xl uppercase tracking-tighter">Payment Method</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: "COD", label: "Cash on Delivery", icon: Wallet },
                      { id: "PayFast", label: "Pay with Card", icon: ShieldCheck },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPaymentMethod(item.id)}
                        className={cn(
                          "flex items-center justify-between p-6 rounded-2xl border transition-all duration-300",
                          paymentMethod === item.id
                            ? "border-amber-600 bg-amber-600/5 text-amber-600 ring-1 ring-amber-600"
                            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500"
                        )}
                      >
                        <span className="font-bold uppercase text-xs tracking-widest">{item.label}</span>
                        <item.icon size={20} />
                      </button>
                    ))}
                  </div>
                </section>

                {/* Submission Error Warning (Prevents 'Button doing nothing' confusion) */}
                {Object.keys(form.formState.errors).length > 0 && (
                  <div className="animate-form-section p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 rounded-xl flex items-center gap-3 text-red-600 text-[10px] font-bold uppercase tracking-widest">
                    <AlertCircle size={14} />
                    Please fill all required fields correctly.
                  </div>
                )}

                <Button
                  type="submit" // Ensure type is submit
                  disabled={loadingForm}
                  className="animate-form-section w-full h-20 rounded-2xl bg-zinc-950 dark:bg-zinc-50 text-white dark:text-black font-black uppercase tracking-[0.3em] text-sm hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  {loadingForm ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Processing
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Sidebar Summary */}
          <div className="w-full lg:col-span-5 lg:sticky lg:top-24 animate-sidebar">
            <Card className="p-6 md:p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-none">
              <div className="flex items-center justify-between mb-8">
                <h4 className="font-bold text-lg uppercase tracking-tighter">Order Summary</h4>
                <span className="text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full uppercase">
                  {cart.length} Items
                </span>
              </div>

              <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.variantId} className="flex gap-4 items-center group">
                    <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
                      <img src={item.media} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase truncate">{item.name}</p>
                      <p className="text-xs font-medium text-zinc-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Rs. {item.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Coupon Restored */}
              <div className="py-6 border-y border-zinc-100 dark:border-zinc-800 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag size={14} className="text-amber-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Apply Promo Code</span>
                </div>
                <Input
                  value={form.watch("coupon")}
                  onChange={(e) => form.setValue("coupon", e.target.value)}
                  placeholder="ENTER CODE"
                  className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 uppercase font-bold tracking-widest h-12 rounded-xl focus:ring-amber-600/20"
                />
                <p className="text-[9px] text-zinc-400 mt-3 italic tracking-tight uppercase">Discount applied upon submission.</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-medium text-zinc-500 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-medium text-zinc-500 uppercase tracking-widest">
                  <span>Shipping</span>
                  <span className="text-amber-600">{shippingCost === 0 ? "FREE" : `Rs. ${shippingCost}`}</span>
                </div>
                <div className="pt-4 flex justify-between items-end border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Total</span>
                  <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">Rs. {total.toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .label-heading { @apply text-[10px] font-bold text-zinc-400 uppercase tracking-widest; }
        .checkout-input {
          @apply h-12 bg-transparent border-0 border-b border-zinc-200 dark:border-zinc-800 rounded-none focus-visible:ring-0 focus-visible:border-amber-600 transition-all px-0 text-base font-medium placeholder:text-zinc-300 dark:placeholder:text-zinc-800;
        }
        .checkout-input-pill {
          @apply h-12 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl px-4 focus-visible:ring-1 focus-visible:ring-amber-600/50 transition-all shadow-none placeholder:text-zinc-400 text-sm;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 10px; }
      `}</style>
    </div>
  );
}

function EmptyCartView() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center bg-white dark:bg-zinc-950">
      <ShoppingBag size={64} className="text-zinc-200 dark:text-zinc-800 mb-6" />
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Your basket is empty.</h2>
      <Button asChild className="rounded-full px-10 bg-black text-white dark:bg-white dark:text-black hover:scale-105 transition-transform">
        <Link href="/shop">Go Shopping</Link>
      </Button>
    </div>
  );
}