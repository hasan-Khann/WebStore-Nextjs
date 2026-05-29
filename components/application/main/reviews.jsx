// Review
"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Slider from "react-slick";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IoMdStar } from "react-icons/io";
import {
  Quote,
} from "lucide-react";
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
    if (!sectionRef.current) return;

    gsap.fromTo(
      sectionRef.current.querySelectorAll(".reveal"),
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.12,
        duration: 1.2,
        ease: "power4.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
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
    arrows: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1, centerMode: true, centerPadding: "20px" } },
    ],
  };

  if (loading) {
    return (
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[350px] rounded-[2rem] bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-24 px-4 relative overflow-hidden">
      <div className="max-w-[1600px] mx-auto">
        <div className="text-center mb-20 reveal">
          <span className="text-[10px] font-black tracking-[0.5em] text-amber-500 uppercase">
            Testimonials
          </span>
          <h2 className="text-6xl md:text-8xl font-black uppercase mt-6">
            Loved by <span className="italic text-zinc-400">Connoisseurs</span>
          </h2>
        </div>

        <Slider {...settings}>
          {reviews.map((review, idx) => {
            const style = cardStyles[idx % cardStyles.length];
            const userName = review.user?.username || "Client";
            return (
              <div key={idx} className="px-4 reveal">
                <div
                  className={`p-10 rounded-[2.5rem] border backdrop-blur-xl transition-all duration-700 hover:-translate-y-4 ${style.bg} ${style.darkBg} ${style.border} ${style.darkBorder}`}
                >
                  <Quote className={`opacity-10 mb-6 ${style.accent}`} size={40} />
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <IoMdStar key={i} className={i < review.rating ? style.accent : "text-zinc-300"} />
                    ))}
                  </div>
                  <p className="text-xl italic mb-10">
                    "{review.review || review.comment}"
                  </p>
                  <span className="text-xs uppercase tracking-widest font-bold">
                    {userName}
                  </span>
                </div>
              </div>
            );
          })}
        </Slider>
      </div>
    </section>
  );
};