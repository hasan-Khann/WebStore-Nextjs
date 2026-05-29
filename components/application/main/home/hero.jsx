"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const containerRef = useRef(null);
  const bgRef = useRef(null);
  const contentRef = useRef(null);
  const shapesRef = useRef([]);

  const addToShapes = (el) => {
    if (el && !shapesRef.current.includes(el)) {
      shapesRef.current.push(el);
    }
  };

  useEffect(() => {
    const ctx = gsap.context((self) => {
      
      gsap.fromTo(
        self.selector(".hero-reveal"),
        { 
          y: 60, 
          opacity: 0 
        },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power4.out",
          stagger: 0.15,
          delay: 0.2,
        }
      );

      gsap.to(bgRef.current, {
        yPercent: 20,
        scale: 1.1,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(contentRef.current, {
        yPercent: 15,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      shapesRef.current.forEach((shape, index) => {
        const direction = index % 2 === 0 ? 1 : -1;

        gsap.to(shape, {
          y: `+=${20 + index * 10}`,
          x: `+=${direction * (15 + index * 5)}`,
          rotation: direction * 360,
          duration: 10 + index * 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        gsap.to(shape, {
          yPercent: direction * (50 + index * 40),
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-[100dvh] w-full overflow-hidden bg-zinc-950 flex items-center justify-center select-none"
    >
      {/* Background Image Layer */}
      <div ref={bgRef} className="absolute inset-0 w-full h-full will-change-transform">
        <Image
          src="https://images.unsplash.com/photo-1445205170230-053b830c6050"
          alt="Elegance Background"
          fill
          className="object-cover opacity-40 mix-blend-luminosity"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/20 via-zinc-950/50 to-zinc-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#09090b_90%)]" />
      </div>

      {/* Floating Shapes Layer */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          ref={addToShapes}
          className="absolute -bottom-[5%] -right-[5%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/5 blur-[120px] will-change-transform"
        />

        <div
          ref={addToShapes}
          className="absolute top-[18%] left-[12%] w-28 h-28 border border-white/10 backdrop-blur-[6px] bg-white/[0.02] will-change-transform flex items-center justify-center shadow-2xl"
        >
          <div className="w-12 h-12 border border-white/5 bg-white/[0.01]" />
        </div>

        <div
          ref={addToShapes}
          className="absolute top-[35%] right-[12%] w-56 h-56 rounded-full border border-white/[0.08] will-change-transform flex items-center justify-center"
        >
          <div className="absolute inset-4 rounded-full border border-white/5 border-dashed" />
          <div className="w-12 h-12 rounded-full border border-white/20 bg-white/[0.03] backdrop-blur-[2px]" />
        </div>
      </div>

      <div
        ref={contentRef}
        className="relative z-10 text-center px-6 flex flex-col items-center will-change-transform"
      >
        <span className="hero-reveal opacity-0 text-white/40 text-[11px] tracking-[0.6em] uppercase mb-5 font-medium block">
          Est. 2026
        </span>

        <h1 className="flex flex-col text-[15vw] md:text-[10vw] font-black text-white leading-[0.85] tracking-tight italic">
          <span className="hero-reveal opacity-0 block pr-4">Elegance</span>
          <span
            className="hero-reveal opacity-0 text-transparent block pb-4 mt-2"
            style={{ WebkitTextStroke: "1px rgba(255,255,255,0.35)" }}
          >
            Defined
          </span>
        </h1>

        <Link
          href="/shop"
          className="hero-reveal opacity-0 mt-14 relative px-12 py-4 border border-white/15 rounded-full overflow-hidden group inline-block shadow-lg backdrop-blur-sm"
        >
          <span className="relative z-10 text-white text-[11px] tracking-[0.4em] font-bold group-hover:text-black transition-colors duration-500">
            SHOP NOW
          </span>
          <div className="absolute inset-0 bg-white translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
        </Link>
      </div>
    </section>
  );
};

export default Hero;