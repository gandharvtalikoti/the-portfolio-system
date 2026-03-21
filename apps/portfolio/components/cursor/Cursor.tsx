"use client";

/*
  Two layers:
  dot  — 6px filled circle, follows mouse exactly
  ring — 36px hollow circle, follows with spring delay

  On hover over links/buttons:
  dot shrinks to 0, ring scales to 1.8x
*/

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function Cursor() {
  const [visible,  setVisible]  = useState(false);
  const [hovering, setHovering] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const rx = useSpring(mx, { stiffness: 120, damping: 18, mass: 0.4 });
  const ry = useSpring(my, { stiffness: 120, damping: 18, mass: 0.4 });

  useEffect(() => {
    /* Touch devices — skip entirely */
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const move = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      setVisible(true);
    };

    const over = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest("a, button, [data-hover]");
      setHovering(!!el);
    };

    window.addEventListener("mousemove",  move);
    window.addEventListener("mouseover",  over);
    document.addEventListener("mouseleave", () => setVisible(false));
    document.addEventListener("mouseenter", () => setVisible(true));

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, [mx, my]);

  if (typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches) return null;

  return (
    <>
      {/* Dot */}
      <motion.div
        style={{
          position:   "fixed",
          top:        0,
          left:       0,
          x:          mx,
          y:          my,
          translateX: "-50%",
          translateY: "-50%",
          zIndex:     99999,
          pointerEvents: "none",
          width:      6,
          height:     6,
          borderRadius: "50%",
          background: "var(--text)",
        }}
        animate={{
          opacity: visible && !hovering ? 1 : 0,
          scale:   hovering ? 0 : 1,
        }}
        transition={{ duration: 0.15 }}
      />

      {/* Ring */}
      <motion.div
        style={{
          position:   "fixed",
          top:        0,
          left:       0,
          x:          rx,
          y:          ry,
          translateX: "-50%",
          translateY: "-50%",
          zIndex:     99998,
          pointerEvents: "none",
          width:      36,
          height:     36,
          borderRadius: "50%",
          border:     "1px solid rgba(237,233,227,0.35)",
        }}
        animate={{
          opacity: visible ? 1 : 0,
          scale:   hovering ? 1.7 : 1,
        }}
        transition={{ duration: 0.2 }}
      />
    </>
  );
}