"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Slider from "react-slick";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IoMdStar } from "react-icons/io";
import { Quote } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

dayjs.extend(relativeTime);
gsap.registerPlugin(ScrollTrigger);

const cardStyles = [
  { bg: "bg-emerald-50/40", darkBg: "dark:bg-emerald-950/10", border: "border-emerald-100/50", darkBorder: "dark:border-emerald-500/10", accent: "text-emerald-600", fill: "bg-emerald-600" },
  { bg: "bg-amber-50/40", darkBg: "dark:bg-amber-950/10", border: "border-amber-100/50", darkBorder: "dark:border-amber-500/10", accent: "text-amber-600", fill: "bg-amber-600" },
  { bg: "bg-blue-50/40", darkBg: "dark:bg-blue-950/10", border: "border-blue-100/50", darkBorder: "dark:border-blue-500/10", accent: "text-blue-600", fill: "bg-blue-600" },
  { bg: "bg-rose-50/40", darkBg: "dark:bg-rose-950/10", border: "border-rose-100/50", darkBorder: "dark:border-rose-500/10", accent: "text-rose-600", fill: "bg-rose-600" },
];

export const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get("/api/review?globalFilter=5&size=6");
        let data = [];
        if (res.data?.type === "success") data = res.data.data;
        else if (res.data?.data) data = res.data.data;
        else if (Array.isArray(res.data)) data = res.data;
        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    if (!sectionRef.current || loading) return;

    gsap.fromTo(
      sectionRef.current.querySelectorAll(".reveal"),
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.12,
        duration: 1.2,
        ease: "power4.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
        },
      }
    );
  }, [loading]);

  const settings = {
    dots: true,
    infinite: reviews.length > 1,
    speed: 900,
    autoplay: true,
    autoplaySpeed: 4500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  if (loading) {
    return (
      <section className="py-16 md:py-24 px-4 sm:px-6 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="h-[300px] md:h-[385px] rounded-2xl sm:rounded-[2.5rem] bg-zinc-100 dark:bg-zinc-900 animate-pulse" 
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-16 md:py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-[1600px] mx-auto">
        
        <div className="text-center mb-12 md:mb-20 reveal">
          <span className="text-[10px] font-black tracking-[0.5em] text-amber-500 uppercase block mb-2">
            Testimonials
          </span>
          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-none mt-4">
            Loved by <br className="xs:hidden sm:block md:hidden" />
            <span className="italic text-zinc-400">Connoisseurs</span>
          </h2>
        </div>

        <div className="pb-8 pt-4">
          <Slider {...settings}>
            {reviews.map((review, idx) => {
              const style = cardStyles[idx % cardStyles.length];
              const userName = review.user?.username || "Client";
              return (
                <div key={idx} className="px-2 md:px-4 reveal h-full py-2">
                  <div
                    className={`p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2.5rem] border backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between min-h-[320px] h-full ${style.bg} ${style.darkBg} ${style.border} ${style.darkBorder}`}
                  >
                    <div>
                      <Quote className={`opacity-10 mb-4 md:mb-6 ${style.accent}`} size={36} />
                      
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <IoMdStar 
                            key={i} 
                            className={i < review.rating ? style.accent : "text-zinc-300 dark:text-zinc-700"} 
                          />
                        ))}
                      </div>

                      <p className="text-lg md:text-xl italic font-medium line-clamp-6 mb-6 text-zinc-800 dark:text-zinc-200">
                        "{review.review || review.comment}"
                      </p>
                    </div>

                    <span className="text-xs uppercase tracking-widest font-bold block mt-auto text-zinc-600 dark:text-zinc-400">
                      {userName}
                    </span>
                  </div>
                </div>
              );
            })}
          </Slider>
        </div>

      </div>
    </section>
  );
};