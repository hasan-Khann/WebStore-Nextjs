"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Marquee from "@/components/application/main/home/marquee";
import { Reviews } from "./reviews";
import Hero from "./home/hero";
import ProductCard from "./productcard";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef(null);
  const gridRef = useRef(null);
  const parallaxSectionRef = useRef(null);
  const parallaxImageRef = useRef(null);

  useEffect(() => {
    async function fetchTopVariants() {
      try {
        const response = await axios.get("/api/product-variant/top");
        if (response.data?.data) setProducts(response.data.data);
      } catch (err) {
        console.error("Home Data Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTopVariants();
  }, []);

  useGSAP(() => {
    if (loading || !products.length) return;

    // 1. CINEMATIC PRODUCT GRID REVEAL
    // We use a 3D "flip and rise" effect with a very smooth stagger.
    gsap.fromTo(".product-card-anim",
      {
        opacity: 0,
        y: 150,
        rotateX: -25,
        transformOrigin: "50% 0%",
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 1.8,
        ease: "expo.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 85%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        }
      }
    );

    // 2. THE "WINDOW" PARALLAX (True Reveal)
    // The image moves counter to the container's scroll, making it feel "fixed" in depth.
    gsap.fromTo(parallaxImageRef.current,
      { yPercent: -20 },
      {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: parallaxSectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        }
      }
    );

    // 3. MASKED TEXT REVEAL
    // Higher-end feel by making text appear from an invisible boundary
    gsap.from(".reveal-up", {
      yPercent: 100,
      duration: 1.2,
      ease: "power4.out",
      stagger: 0.1,
      scrollTrigger: {
        trigger: parallaxSectionRef.current,
        start: "top 60%",
      }
    });

  }, { dependencies: [loading, products], scope: containerRef });

  return (
    <div ref={containerRef} className="w-full bg-white dark:bg-[#08080a] selection:bg-white selection:text-black overflow-hidden">
      <Hero />
      <Marquee />

      {/* Featured Products */}
      <section className="py-32 px-6 max-w-[1600px] mx-auto min-h-screen">
        <div className="flex flex-col items-start mb-24 space-y-2">
          <div className="overflow-hidden">
             <span className="text-[10px] font-bold tracking-[0.6em] uppercase text-zinc-500 block">
              Curated Selection
            </span>
          </div>
          <h2 className="text-7xl md:text-9xl font-light tracking-tighter uppercase leading-[0.8] dark:text-white flex flex-col">
            <span>Most</span>
            <span className="font-serif italic font-normal text-zinc-300 dark:text-zinc-800 ml-[10vw]">Wanted</span>
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/5] bg-zinc-900 animate-pulse rounded-sm" />
            ))}
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-16 md:gap-x-8" style={{ perspective: "2000px" }}>
            {products.filter(i => i?.variantId).map((variant) => (
              <div key={variant.variantId} className="product-card-anim">
                <ProductCard product={variant} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PARALLAX SECTION: The "Awwwards" Window Reveal */}
      <section ref={parallaxSectionRef} className="relative h-[80vh] md:h-[110vh] w-full overflow-hidden flex items-center justify-center">
        {/* The "Window" Background */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <div
            ref={parallaxImageRef}
            className="absolute -top-[20%] left-0 w-full h-[140%] bg-center bg-cover brightness-[0.6] grayscale-[20%]"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070')" }}
          />
        </div>

        {/* Text Content Overlay */}
        <div className="relative z-10 w-full px-6 flex flex-col items-center text-center">
          <div className="overflow-hidden py-2">
            <h3 className="reveal-up text-[15vw] md:text-[12vw] font-black uppercase tracking-tighter leading-none text-white mix-blend-difference">
              Permanence
            </h3>
          </div>
          
          <div className="overflow-hidden mt-4">
            <p className="reveal-up text-[10px] md:text-xs font-bold uppercase tracking-[0.8em] text-white/50">
              Luxury Redefined
            </p>
          </div>

          <button className="mt-16 group relative px-14 py-5 border-[0.5px] border-white/20 rounded-full text-white overflow-hidden transition-colors hover:border-white duration-700">
            <span className="relative z-10 text-[10px] font-black tracking-[0.4em]">EXPLORE COLLECTION</span>
            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out" />
            <span className="absolute inset-0 flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-20 text-[10px] font-black tracking-[0.4em]">EXPLORE COLLECTION</span>
          </button>
        </div>

        {/* Ambient Overlay to smooth edges */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#08080a] via-transparent to-[#08080a] pointer-events-none z-5" />
      </section>

      <div className="bg-[#08080a]">
        <Reviews />
      </div>
    </div>
  );
}