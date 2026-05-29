"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCartDB,
  updateQtyDB,
  removeItemDB,
  clearCartDB
} from "@/store/slices/cartSlice";
import {
  FiShoppingBag,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiArrowRight,
} from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";

export const CartSidebar = () => {
  const dispatch = useDispatch();

  const { items = [], totalQuantity = 0, totalPrice = 0 } =
    useSelector((state) => state.cart || {});
  const { user } = useSelector((state) => state.auth || {});

  const [hydrated, setHydrated] = React.useState(false);

  const handleOpen = (open) => {
    if (open && user && !hydrated) {
      dispatch(fetchCartDB());
      setHydrated(true);
    }
  };

  return (
    <Sheet onOpenChange={handleOpen}>
      <SheetTrigger asChild>
        <button className="relative p-2.5 bg-zinc-100 dark:bg-white/5 rounded-full active:scale-90 transition-transform duration-200 outline-none border border-zinc-200/50 dark:border-white/10">
          <FiShoppingBag size={18} className="text-zinc-900 dark:text-zinc-100" />
          {totalQuantity > 0 && (
            <span className="absolute -top-1 -right-1 bg-zinc-900 dark:bg-white text-white dark:text-black text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full shadow-md">
              {totalQuantity}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="fixed top-0 right-0 h-full w-full sm:max-w-[420px] flex flex-col p-0 bg-white dark:bg-[#0b0b0f] border-l border-zinc-100 dark:border-white/5 shadow-2xl z-[150]"
      >
        <div className="flex-grow overflow-y-auto px-6 sm:px-8 py-8 space-y-8 scrollbar-hide">
          <div className="flex justify-between items-end mb-6">
            <SheetTitle className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">
              Bag
            </SheetTitle>
            {items.length > 0 && (
              <button
                onClick={() => dispatch(clearCartDB())}
                className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest hover:text-red-500 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center opacity-40">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4">
                Collection Empty
              </p>
              <Link
                href="/shop"
                className="text-[10px] font-black border-b border-zinc-900 dark:border-white pb-1 uppercase tracking-widest"
              >
                View Shop
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-5 items-center group">
                  <div className="relative h-24 w-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.media || "/placeholder.jpg"}
                      alt={item.name || "Product"}
                      fill
                      sizes="80px" // ✅ fix layout shift
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex-grow space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-[11px] font-black uppercase text-zinc-900 dark:text-white leading-tight">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => dispatch(removeItemDB(item.variantId))}
                        className="text-zinc-300 hover:text-red-500 transition-colors shrink-0 ml-4"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>

                    <p className="text-[9px] text-zinc-400 font-bold uppercase">
                      {item.size} / {item.color}
                    </p>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs font-black tracking-tighter">
                        Rs.{" "}
                        {(Number(item.price || 0) *
                          Number(item.quantity || 0)
                        ).toLocaleString()}
                      </span>

                      <div className="flex items-center gap-3 bg-zinc-100/50 dark:bg-white/5 px-2 py-1 rounded-lg border border-zinc-100 dark:border-white/5">
                        <button
                          className="p-1 hover:bg-white dark:hover:bg-white/10 rounded transition-colors"
                          onClick={() =>
                            dispatch(
                              updateQtyDB({
                                variantId: item.variantId,
                                action: "dec",
                              })
                            )
                          }
                        >
                          <FiMinus size={10} />
                        </button>

                        <span className="text-[10px] font-bold w-4 text-center">
                          {item.quantity}
                        </span>

                        <button
                          className="p-1 hover:bg-white dark:hover:bg-white/10 rounded transition-colors"
                          onClick={() =>
                            dispatch(
                              updateQtyDB({
                                variantId: item.variantId,
                                action: "inc",
                              })
                            )
                          }
                        >
                          <FiPlus size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-8 border-t border-zinc-100 dark:border-white/5 bg-white dark:bg-[#0b0b0f]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                Subtotal
              </span>
              <span className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white">
                Rs. {Number(totalPrice || 0).toLocaleString()}
              </span>
            </div>

            <Link
              href="/checkout"
              className="w-full h-14 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 group transition-all hover:opacity-90"
            >
              Checkout
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};