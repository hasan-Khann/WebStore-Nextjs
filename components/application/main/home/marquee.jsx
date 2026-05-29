"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const Marquee = () => {
  const items = [
    "FREE SHIPPING", "NEW DROPS WEEKLY", "PREMIUM QUALITY", 
    "SECURE CHECKOUT", "24/7 SUPPORT", "LUXURY MATERIALS", "LIMITED EDITION"
  ];
  
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const loop = gsap.to(".marquee-item", {
        xPercent: -100,
        repeat: -1,
        duration: 20,
        ease: "none",
      });

      // Pause on hover
      containerRef.current?.addEventListener("mouseenter", () => loop.pause());
      containerRef.current?.addEventListener("mouseleave", () => loop.play());
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative bg-primary py-6 overflow-hidden border-y border-white/10 flex whitespace-nowrap z-30 cursor-default">
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-primary via-transparent to-primary opacity-30" />
      
      <div className="flex">
        {[...items, ...items].map((text, i) => (
          <div key={i} className="marquee-item flex items-center gap-16 md:gap-24 px-8 md:px-12 group">
            <div className="flex items-center gap-6 md:gap-10">
              <span className="text-[10px] md:text-xs font-black tracking-[0.4em] text-white uppercase">
                {text}
              </span>
              <div className="w-1.5 h-1.5 bg-white/30 rounded-full group-hover:bg-amber-500 group-hover:scale-150 transition-all duration-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marquee;