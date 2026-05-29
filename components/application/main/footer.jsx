"use client";

import LinkNext from "next/link";
import { FaFacebookF, FaTwitter, FaInstagram, FaArrowRight } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-black text-zinc-400 border-t border-zinc-900 pt-24 pb-12 relative z-50 overflow-hidden">
      {/* Subtle Background Text for Premium feel */}
      <div className="absolute -bottom-10 -right-10 pointer-events-none select-none opacity-[0.02] font-black text-[12rem] leading-none tracking-tighter text-white">
        MODERN.
      </div>

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="grid gap-16 lg:grid-cols-12 mb-20">
          
          {/* Brand Section */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-6">
              <LinkNext href="/" className="inline-block group">
                <span className="text-3xl font-black text-white tracking-tighter group-hover:text-amber-500 transition-colors duration-500">
                  MODERN<span className="text-amber-600">.</span>
                </span>
              </LinkNext>
              <p className="text-sm leading-relaxed max-w-sm text-zinc-500 font-medium">
                Redefining the standard of online retail with a curated selection of premium goods. Experience the future of shopping through our lens.
              </p>
            </div>

            {/* Newsletter Mini-Form */}
            <div className="max-w-xs group">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-4">Join the Inner Circle</p>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="email@example.com" 
                  className="w-full bg-transparent border-b border-zinc-800 py-3 pr-10 text-sm focus:outline-none focus:border-amber-600 transition-colors placeholder:text-zinc-700"
                />
                <button className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors">
                  <FaArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="flex gap-5">
              {[
                { icon: FaFacebookF, link: "#" },
                { icon: FaTwitter, link: "#" },
                { icon: FaInstagram, link: "#" }
              ].map((social, i) => (
                <LinkNext 
                  key={i} 
                  href={social.link} 
                  className="w-11 h-11 rounded-full bg-zinc-900/50 flex items-center justify-center text-zinc-400 hover:bg-white hover:text-black hover:-translate-y-1 transition-all duration-300 border border-zinc-800/50"
                >
                  <social.icon size={16} />
                </LinkNext>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Company</h4>
              <ul className="space-y-5">
                {["About Us", "Careers", "Journal", "Our Atelier"].map((item) => (
                  <li key={item}>
                    <LinkNext href="#" className="text-xs font-bold uppercase tracking-widest hover:text-white transition-all relative group flex items-center">
                      <span className="w-0 group-hover:w-4 h-[1px] bg-amber-600 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                      {item}
                    </LinkNext>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Client Services</h4>
              <ul className="space-y-5">
                {["FAQ", "Shipping", "Returns", "Size Guide"].map((item) => (
                  <li key={item}>
                    <LinkNext href="#" className="text-xs font-bold uppercase tracking-widest hover:text-white transition-all relative group flex items-center">
                      <span className="w-0 group-hover:w-4 h-[1px] bg-amber-600 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                      {item}
                    </LinkNext>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8 col-span-2 md:col-span-1">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Legal</h4>
              <ul className="space-y-5">
                {["Privacy Policy", "Terms of Service", "Cookies"].map((item) => (
                  <li key={item}>
                    <LinkNext href="#" className="text-xs font-bold uppercase tracking-widest hover:text-white transition-all relative group flex items-center">
                      <span className="w-0 group-hover:w-4 h-[1px] bg-amber-600 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                      {item}
                    </LinkNext>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-zinc-900/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
            <p>© {currentYear} MODERN STORE GLOBAL INC.</p>
            <span className="hidden md:block w-1 h-1 rounded-full bg-zinc-800"></span>
            <p className="hover:text-zinc-400 cursor-pointer transition-colors">Accessibility</p>
          </div>
          
          <div className="flex items-center gap-2">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Crafted for Excellence</p>
            <div className="w-8 h-[1px] bg-zinc-800"></div>
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-amber-600 animate-pulse"></div>
              <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;