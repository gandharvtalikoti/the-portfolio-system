"use client";

import { useState, useEffect, useRef } from "react";
import Link                            from "next/link";
import { usePathname }                 from "next/navigation";
import { motion }                      from "framer-motion";
import { site }                        from "@/config/site";
import { cn }                          from "@/lib/utils";

export function Navbar() {
  const path      = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden,   setHidden]   = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > lastY.current && y > 120);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      animate={{ y: hidden ? -80 : 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    >
      <div
        className={cn(
          "flex items-center justify-between",
          "px-8 md:px-14 py-6",
          "transition-all duration-500",
          scrolled && [
            "py-4",
            "bg-[#090909]/85",
            "backdrop-blur-md",
            // "border-b border-[var(--border)]",
          ]
        )}
      >
        {/* Name */}
        <Link href="/" className="[text-decoration-color:red]">
          <span
            className="text-[15px] tracking-[0.22em] uppercase text-[var(--text)] hover:text-[var(--muted)] transition-colors duration-300 mr-[30px]"
            style={{ fontFamily: "var(--sans)" }}
          >
            {site.name}
          </span>
        </Link>

        {/* Links */}
        <nav className="flex items-center gap-16 my-[10px]">
          {site.nav.map((item) => {
            const active = path.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className="relative group [text-decoration-color:red]">
                <span
                  className={cn(
                    "text-[15px] tracking-[0.22em] uppercase transition-colors duration-300 mx-[30px]",
                    active ? "text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]"
                  )}
                >
                  {item.label} 
                </span>
               
              </Link>
            );
          })}
        </nav>
      </div>
    </motion.header>
  );
}