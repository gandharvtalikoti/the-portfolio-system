"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import Image                               from "next/image";
import Link                                from "next/link";
import { site }                            from "@/config/site";

/*
  Animation timing:
  0.0s  → nothing
  0.3s  → location fades up
  0.5s  → letters start revealing one by one
  1.4s  → tagline fades in
  1.8s  → CTA fades in
  2.2s  → scroll indicator appears

  Scroll behaviour:
  0px   → scroll indicator fully visible
  300px → scroll indicator fully gone (≈ 2 scrolls)
*/

const ease = [0.25, 0.46, 0.45, 0.94] as const;

export function Hero() {
  const letters = site.name.toUpperCase().split("");

  // Track how far the user has scrolled
  const { scrollY } = useScroll();

  // Map scroll distance to opacity: 0px → opacity 1, 300px → opacity 0
  // Change 300 to a smaller number to fade faster, larger to fade slower
  const scrollOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Subtle parallax — image drifts up slowly as user scrolls
  const bgY = useTransform(scrollY, [0, 600], ["0%", "12%"]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">

      {/*
        ── BACKGROUND IMAGE ──
        File: /public/bg-hero.webp
        - opacity-[0.13] keeps it moody and subtle
        - scales in slightly on load for a cinematic entrance
        - radial mask dissolves edges so it blends into the dark bg
        - parallax: drifts up as user scrolls for depth
        To make it more visible: increase opacity-[0.13] → opacity-[0.2]
        To widen the visible area: change ellipse 65% 55% to 80% 70%
      */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.5, delay: 0.8, ease: "easeOut" }}
        style={{ y: bgY }}
      >
        <Image
          src="/bg-hero.webp"
          alt="BG IMAGE"
          fill
          priority
          className="object-cover opacity-[0.13]"
          style={{
            maskImage:
              "radial-gradient(ellipse 65% 55% at 50% 50%, black 10%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 65% 55% at 50% 50%, black 10%, transparent 75%)",
          }}
        />
      </motion.div>

      {/* Very subtle radial glow dead center */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3, delay: 0.5 }}
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(255,255,255,0.025) 0%, transparent 70%)",
        }}
      />

      {/* Main content */}
      <div className="relative text-center w-full max-w-6xl mx-auto">

        {/* Location — eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease }}
          className="text-[10px] tracking-[0.55em] uppercase mb-10"
          style={{ color: "var(--muted)" }}
        >
          {site.location}
        </motion.p>

        {/*
          Name — each letter animates individually.
          overflow-hidden on the wrapper clips the
          upward motion so letters "rise into view"
          rather than appearing from visible space.
        */}
        <div className="overflow-hidden pb-[20px]">
          <motion.div
            className="flex items-center justify-center flex-wrap"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.055, delayChildren: 0.5 }}
          >
            {letters.map((letter, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden:  { opacity: 0, y: 80 },
                  visible: { opacity: 1, y: 0  },
                }}
                transition={{ duration: 0.75, ease }}
                style={{
                  fontFamily:    "var(--font-playfair), Georgia, serif",
                  fontSize:      "clamp(72px, 14vw, 160px)",
                  fontWeight:    700,
                  lineHeight:    1,
                  letterSpacing: "-0.02em",
                  color:         "var(--text)",
                  display:       "inline-block",
                  marginRight:   letter === " " ? "0.3em" : "0.01em",
                }}
              >
                {letter}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* Thin divider line */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 1.2, ease }}
          className="mx-auto mt-8 mb-8"
          style={{
            height:          "1px",
            width:           "60px",
            background:      "var(--faint)",
            transformOrigin: "left center",
          }}
        />

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.4, ease }}
          className="text-[11px] tracking-[0.38em] uppercase"
          style={{ color: "var(--muted)", marginTop: "10px" }}
        >
          {site.tagline}
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.8 }}
          className="mt-14"
        >
          <Link
            href="/work"
            className="group inline-flex items-center gap-5 transition-colors duration-400"
            style={{ color: "var(--muted)" }}
          >
            {/* Left line — shrinks on hover */}
            <span
              className="block h-px transition-all duration-500 group-hover:opacity-40"
              style={{ width: "36px", background: "currentColor" }}
            />
            <span className="text-[10px] tracking-[0.4em] uppercase group-hover:text-[var(--text)] transition-colors duration-300 m-[10px]">
              View Work
            </span>
            {/* Right line — grows on hover */}
            <span
              className="block h-px transition-all duration-500 group-hover:w-16"
              style={{ width: "36px", background: "currentColor" }}
            />
          </Link>
        </motion.div>

        {/*
          Scroll indicator — fades out as user scrolls down.
          scrollOpacity maps: 0px → opacity 1, 300px → opacity 0
          So after ~2 scroll wheel ticks it's completely gone.
        */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.2 }}
          style={{ opacity: scrollOpacity }}
          className="flex flex-col items-center gap-2.5 mt-16"
        >
          <span
            className="text-[8px] tracking-[0.5em] uppercase"
            style={{ color: "var(--faint)" }}
          >
            Scroll
          </span>

          {/* Animated line */}
          <div
            className="relative overflow-hidden"
            style={{ width: "1px", height: "40px", background: "var(--faint)" }}
          >
            <motion.div
              style={{
                position:   "absolute",
                top:        0,
                left:       0,
                width:      "100%",
                background: "var(--muted)",
              }}
              animate={{ height: ["0%", "100%", "0%"], top: ["0%", "0%", "100%"] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>

      </div>

    </section>
  );
}