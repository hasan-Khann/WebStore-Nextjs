"use client";

import { useEffect, useMemo, useState, use, useRef, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { Star, Plus, Minus, ShoppingCart, ShieldCheck, Truck, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import gsap from "gsap";
import Slider from "react-slick";
import api from "@/utils/api";
import { cn } from "@/lib/utils";
import { addToCartDB } from "@/store/slices/cartSlice";
import { ReviewsAndRating } from "@/components/application/main/reviewAndrating";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function ProductPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const slug = params.slug;
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [qty, setQty] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [reviewStats, setReviewStats] = useState({ average: "0.0", total: 0 });

  const imageContainerRef = useRef(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    if (!slug) return;
    const fetchPageData = async () => {
      try {
        setLoading(true);
        const prodRes = await api.get(`/api/product/get?slug=${slug}`);
        const product = prodRes.data.data;
        setData(product);

        const firstVariant = product.variants[0];
        setSelectedColor(searchParams.get("color") || firstVariant?.color);
        setSelectedSize(searchParams.get("size") || firstVariant?.size);
        setActiveImage(product.gallery?.[0]?.secure_url || "/placeholder.png");
      } catch (err) {
        toast.error("Collection unavailable");
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, [slug, searchParams]);

  const handleImageChange = (index) => {
    const newImage = data.gallery[index].secure_url;
    setActiveImage(newImage);
    sliderRef.current.slickGoTo(index);

    if (imageContainerRef.current) {
      gsap.fromTo(
        imageContainerRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  };

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    beforeChange: (oldIndex, newIndex) => {
      setActiveImage(data.gallery[newIndex].secure_url);
    },
  };

  const allUniqueColors = useMemo(() =>
    data?.variants ? [...new Set(data.variants.map(v => v.color))] : [], [data]
  );

  const allUniqueSizes = useMemo(() =>
    data?.variants ? [...new Set(data.variants.map(v => v.size))] : [], [data]
  );

  const isCombinationAvailable = (color, size) => {
    if (!data?.variants) return false;
    const variant = data.variants.find(v => v.color === color && v.size === size);
    return variant && variant.stock > 0;
  };

  const currentVariant = useMemo(() => {
    return data?.variants?.find(v => v.color === selectedColor && v.size === selectedSize);
  }, [data, selectedColor, selectedSize]);

  const isOutOfStock = useMemo(() => {
    if (!selectedColor || !selectedSize) return false;
    return !isCombinationAvailable(selectedColor, selectedSize);
  }, [selectedColor, selectedSize, data]);

  const handleAddToCart = async () => {
    if (isOutOfStock) return toast.error("Variant currently out of stock");
    if (!currentVariant) return toast.error("Please select a valid combination");

    try {
      setIsAdding(true);
      await dispatch(
        addToCartDB({
          variantId: currentVariant._id.toString(),
          name: data.name,
          media: activeImage,
          price: currentVariant.price - (currentVariant.discount || 0),
          color: selectedColor,
          size: selectedSize,
          sku: currentVariant.sku,
          quantity: qty,
        })
      ).unwrap();
      toast.success("Added to Collection");
    } catch (error) {
      toast.error(error.message || "Archive error");
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return (
    <div className="h-screen bg-zinc-50 dark:bg-[#0b0b0f] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-[2px] bg-zinc-300 dark:bg-zinc-800 animate-pulse" />
      <span className="font-black tracking-[1em] text-[10px] text-zinc-400 uppercase">Archive Initiated</span>
    </div>
  );

  if (!data) return null;

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-[#0b0b0f] text-zinc-900 dark:text-zinc-100 transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16 pt-20 sm:pt-24 lg:pt-40 pb-10 sm:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-24 items-start">

          <div className="lg:col-span-7 relative lg:sticky lg:top-32 w-full">
            <div className="relative aspect-[4/5] bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-[2.5rem] lg:rounded-[3.5rem] overflow-hidden shadow-2xl">
              <div ref={imageContainerRef} className="w-full h-full">
                <Slider ref={sliderRef} {...sliderSettings} className="w-full h-full">
                  {data.gallery?.map((img, idx) => (
                    <div key={idx} className="relative aspect-[4/5] w-full">
                      <Image 
                        src={img.secure_url} 
                        alt={`${data.name} ${idx}`} 
                        fill 
                        className="object-contain p-6 sm:p-8 lg:p-16 xl:p-20" 
                        priority 
                      />
                    </div>
                  ))}
                </Slider>
              </div>

              <div className="absolute left-4 sm:left-6 bottom-4 sm:bottom-8 right-4 sm:right-6 flex gap-2 sm:gap-3 z-20 overflow-x-auto no-scrollbar pb-2">
                {data.gallery?.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleImageChange(idx)}
                    className={cn(
                      "relative flex-shrink-0 w-14 h-16 sm:w-16 sm:h-20 rounded-2xl border-2 transition-all duration-300 overflow-hidden bg-white dark:bg-zinc-800",
                      activeImage === img.secure_url ? "border-amber-400 scale-110 shadow-xl" : "border-transparent opacity-40 hover:opacity-100"
                    )}
                  >
                    <Image src={img.secure_url} alt="nav" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col w-full">
            <header className="space-y-6 mb-10">
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={cn(i < Math.round(reviewStats.average) ? "fill-amber-400 text-amber-400" : "text-zinc-200 dark:text-zinc-800")} />
                  ))}
                </div>
                <span className="text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">
                  {reviewStats.average} / {reviewStats.total} Reviews
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">Premium Series</span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tight leading-[0.9] sm:leading-[0.85]">
                  {data.name.split(' ')[0]} <br />
                  <span className="text-zinc-300 dark:text-zinc-800 italic font-light lowercase">
                    {data.name.split(' ').slice(1).join(' ')}
                  </span>
                </h1>
              </div>

              <div className="flex items-baseline gap-4">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight">
                  Rs. {currentVariant ? (currentVariant.price - (currentVariant.discount || 0)).toLocaleString() : data.variants[0]?.price.toLocaleString()}
                </span>
                {currentVariant?.discount > 0 && (
                  <span className="text-xl text-zinc-400 line-through decoration-amber-500/50">
                    Rs. {currentVariant.price.toLocaleString()}
                  </span>
                )}
              </div>
            </header>

            <div className="mb-10 prose prose-sm dark:prose-invert">
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm sm:text-base font-medium">
                {data.description || "A masterfully crafted piece designed for the modern collector, blending timeless aesthetics with contemporary utility."}
              </p>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Finish / {selectedColor}</span>
                  <Sparkles size={14} className="text-amber-500 opacity-50" />
                </div>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {allUniqueColors.map(c => (
                    <button
                      key={c}
                      onClick={() => { setSelectedColor(c); setQty(1); }}
                      className={cn(
                        "w-10 h-10 rounded-full border-2 transition-all duration-300 p-1",
                        selectedColor === c ? "border-zinc-900 dark:border-white scale-110 shadow-lg" : "border-transparent opacity-40 hover:opacity-100"
                      )}
                    >
                      <div className="w-full h-full rounded-full" style={{ backgroundColor: c.toLowerCase() }} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Dimensions / {selectedSize}</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {allUniqueSizes.map(s => {
                    const isAvailable = isCombinationAvailable(selectedColor, s);
                    return (
                      <button
                        key={s}
                        disabled={!isAvailable}
                        onClick={() => setSelectedSize(s)}
                        className={cn(
                          "h-14 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                          selectedSize === s
                            ? "bg-zinc-900 text-white dark:bg-white dark:text-black border-transparent shadow-xl -translate-y-0.5"
                            : "border-zinc-200 dark:border-white/10 hover:border-zinc-400",
                          !isAvailable && "opacity-20 cursor-not-allowed grayscale bg-zinc-100 dark:bg-zinc-900/40 border-dashed"
                        )}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <div className="flex items-center bg-zinc-100 dark:bg-white/5 rounded-2xl px-3 h-16 border border-transparent dark:border-white/5">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:text-amber-500"><Minus size={16} /></button>
                  <span className="w-10 text-center font-black text-sm">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="p-2 hover:text-amber-500"><Plus size={16} /></button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || isOutOfStock}
                  className={cn(
                    "w-full sm:flex-1 h-16 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all duration-300 shadow-2xl group",
                    isOutOfStock
                      ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400"
                      : "bg-zinc-900 dark:bg-white text-white dark:text-black"
                  )}
                >
                  {isAdding ? <Loader2 className="animate-spin" /> : isOutOfStock ? "Sold Out" : (
                    <>
                      <ShoppingCart size={18} />
                      Add to Collection
                      <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-10 border-t border-zinc-100 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-white/5 flex items-center justify-center">
                    <ShieldCheck size={20} className="text-amber-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Authentic</span>
                    <span className="block text-[9px] text-zinc-400 uppercase font-bold">Verified Source</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-white/5 flex items-center justify-center">
                    <Truck size={20} className="text-zinc-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Logistic</span>
                    <span className="block text-[9px] text-zinc-400 uppercase font-bold">Express Global</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="border-t border-zinc-100 dark:border-white/5 bg-white dark:bg-[#0b0b0f] py-16 sm:py-20 lg:py-24">
        <ReviewsAndRating productId={data.productId} onStatsUpdate={(stats) => setReviewStats(stats)} />
      </section>
    </main>
  );
}

export default function Page({ params }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductPage params={params} />
    </Suspense>
  );
}