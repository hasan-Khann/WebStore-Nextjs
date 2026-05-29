"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiShoppingBag, FiArrowRight } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { addToCartDB } from "@/store/slices/cartSlice";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const [isAdding, setIsAdding] = useState(false);

  const id = product?.variantId || product?._id;
  const name = product?.productName || product?.name || "Curated Piece";
  const price = product?.price || 0;
  const media = product?.media || [];
  const slug = product?.slug || "";
  const color = product?.color;
  const size = product?.size;
  const stock = product?.stock;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!id) return toast.error("Variant selection error");

    try {
      setIsAdding(true);

      await dispatch(
        addToCartDB({
          variantId: id,
          name,
          price: Number(price) || 0,
          media: media?.[0] || "/placeholder.jpg",
          color: color || "",
          size: size || "",
          quantity: 1,
        })
      ).unwrap();

      toast.success("Added to collection", {
        description: name,
        icon: <FiShoppingBag className="text-black" />,
      });
    } catch (err) {
      toast.error("Could not add to bag");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group relative flex flex-col w-full bg-white dark:bg-transparent">
      {/* IMAGE STAGE */}
      <Link
        href={`/product/${slug}`}
        className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#f9f9f9] dark:bg-zinc-900"
      >
        {/* Primary Image */}
        <Image
          src={media[0] || "/placeholder.jpg"}
          alt={name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
        />

        {/* Secondary Image Reveal */}
        {media[1] && (
          <Image
            src={media[1]}
            alt={`${name} detail`}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover opacity-0 transition-all duration-1000 ease-in-out group-hover:opacity-100 group-hover:scale-105"
          />
        )}

        {/* Status Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          {stock <= 0 ? (
            <span className="px-3 py-1 bg-zinc-900/90 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-sm">
              Out of Stock
            </span>
          ) : stock < 5 ? (
            <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-orange-600 text-[8px] font-black uppercase tracking-[0.2em] rounded-sm shadow-sm">
              Limited Edition
            </span>
          ) : null}
        </div>

        {/* Quick Add Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-30">
          <button
            onClick={handleQuickAdd}
            disabled={isAdding || stock <= 0}
            className="w-full h-12 flex items-center justify-center gap-3 bg-white text-black hover:bg-black hover:text-white transition-colors duration-300 rounded-lg shadow-xl"
          >
            {isAdding ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Quick Add</span>
                <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </Link>

      {/* INFO SECTION */}
      <div className="mt-5 px-1 space-y-1.5">
        <div className="flex justify-between items-start">
          <Link href={`/product/${slug}`} className="flex-1">
            <h4 className="text-[14px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 line-clamp-1 hover:opacity-70 transition-opacity">
              {name}
            </h4>
          </Link>
          <span className="text-[14px] font-black text-zinc-900 dark:text-zinc-100 ml-4">
            {Number(price).toLocaleString()} <span className="text-[9px] font-normal opacity-60">PKR</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {color && (
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
              {color}
            </span>
          )}
          {color && size && <span className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />}
          {size && (
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
              Size {size}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;