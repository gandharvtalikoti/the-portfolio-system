"use client";

import { useState, useRef, useEffect } from "react";
import Image                           from "next/image";
import Link                            from "next/link";
import {
  motion, AnimatePresence,
  useScroll, useTransform,
}                                      from "framer-motion";
import { X, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import type { Project }                from "@/lib/api";

interface Props { project: Project }

export function ProjectView({ project }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const heroRef                 = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target:  heroRef,
    offset:  ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);

  const images = project.media_files.filter((f) => f.file_type === "image");
  const videos = project.media_files.filter((f) => f.file_type === "video");

  const prev = () =>
    setLightbox((i) => (i === null ? null : i === 0 ? images.length - 1 : i - 1));
  const next = () =>
    setLightbox((i) => (i === null ? null : i === images.length - 1 ? 0 : i + 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightbox === null) return;
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape")     setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* ── Hero image ────────────────────────── */}
      {project.thumbnail_url && (
        <div
          ref={heroRef}
          style={{
            position: "relative",
            width:    "100%",
            height:   "88vh",
            overflow: "hidden",
          }}
        >
          {/* /* Parallax image  */}
          <motion.div
            style={{
              position: "absolute",
              inset:    0,
              y:        heroY,
              scale:    1.08,
            }}
          >
            <Image
              src={project.thumbnail_url}
              alt={project.title}
              fill
              priority
              style={{ objectFit: "cover" }}
              sizes="100vw"
            />
          </motion.div>

          {/* /* Gradient — top for navbar, bottom for title  */}
          <div style={{
            position:   "absolute",
            inset:      0,
            background: "linear-gradient(to bottom, rgba(9,9,9,0.55) 0%, transparent 35%, transparent 55%, rgba(9,9,9,0.85) 100%)",
          }} />

          {/* /* Back button  */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              position: "absolute",
              top:      "100px",
              left:     "56px",
              zIndex:   10,
            }}
          >
            <Link
              href="/work"
              style={{
                display:        "inline-flex",
                alignItems:     "center",
                gap:            "10px",
                fontSize:       "9px",
                letterSpacing:  "0.35em",
                textTransform:  "uppercase",
                color:          "rgba(237,233,227,0.5)",
                textDecoration: "none",
                transition:     "color 0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ede9e3")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(237,233,227,0.5)")}
            >
              <ArrowLeft size={12} />
              All Work
            </Link>
          </motion.div>

          {/* /* Title at bottom of hero  */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            style={{
              position: "absolute",
              bottom:   "56px",
              left:     "56px",
              right:    "56px",
              zIndex:   10,
            }}
          >
            <p style={{
              fontSize:      "8px",
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              color:         "rgba(237,233,227,0.4)",
              marginBottom:  "12px",
            }}>
              {project.category}
            </p>
            <h1 style={{
              fontFamily:    "var(--font-playfair), Georgia, serif",
              fontSize:      "clamp(32px, 5vw, 64px)",
              fontWeight:    700,
              color:         "#ede9e3",
              lineHeight:    1.1,
              letterSpacing: "-0.02em",
              margin:        0,
            }}>
              {project.title}
            </h1>
          </motion.div>

        </div>
      )}

      {/* No thumbnail fallback */}
      {!project.thumbnail_url && (
        <div style={{
          padding:      "160px 56px 48px 56px",
          borderBottom: "1px solid var(--border)",
        }}>
          <Link
            href="/work"
            style={{
              display:        "inline-flex",
              alignItems:     "center",
              gap:            "10px",
              fontSize:       "9px",
              letterSpacing:  "0.35em",
              textTransform:  "uppercase",
              color:          "var(--muted)",
              textDecoration: "none",
              marginBottom:   "48px",
            }}
          >
            <ArrowLeft size={12} />
            All Work
          </Link>
          <h1 style={{
            fontFamily:    "var(--font-playfair), Georgia, serif",
            fontSize:      "clamp(40px, 6vw, 72px)",
            fontWeight:    700,
            color:         "var(--text)",
            lineHeight:    1.1,
            margin:        0,
          }}>
            {project.title}
          </h1>
        </div>
      )}

      {/* ── Info strip ────────────────────────── */}
      <div style={{
        padding:      "48px 56px",
        borderBottom: "1px solid var(--border)",
        display:      "flex",
        gap:          "80px",
        flexWrap:     "wrap",
      }}>

        {/* Tags */}
        {project.tags && (
          <div>
            <p style={{
              fontSize:      "8px",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color:         "var(--faint)",
              marginBottom:  "12px",
            }}>
              Tags
            </p>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {project.tags.split(",").map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding:       "5px 12px",
                    fontSize:      "9px",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color:         "var(--muted)",
                    border:        "1px solid var(--border)",
                    borderRadius:  "100px",
                  }}
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {project.description && (
          <div style={{ maxWidth: "520px" }}>
            <p style={{
              fontSize:      "8px",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color:         "var(--faint)",
              marginBottom:  "12px",
            }}>
              About
            </p>
            <p style={{
              fontSize:   "14px",
              color:      "var(--muted)",
              lineHeight: 1.75,
            }}>
              {project.description}
            </p>
          </div>
        )}

      </div>

      {/* ── Videos ────────────────────────────── */}
      {videos.length > 0 && (
        <div style={{ padding: "56px 56px 0 56px" }}>
          <p style={{
            fontSize:      "8px",
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color:         "var(--faint)",
            marginBottom:  "24px",
          }}>
            Film — {videos.length}
          </p>

          <div style={{
            display:             "grid",
            gridTemplateColumns: videos.length === 1 ? "1fr" : "1fr 1fr",
            gap:                 "12px",
            maxWidth:            videos.length === 1 ? "860px" : "100%",
          }}>
            {videos.map((v) => (
              <div
                key={v.id}
                style={{
                  position:   "relative",
                  overflow:   "hidden",
                  background: "var(--bg2)",
                  borderRadius: "2px",
                }}
              >
                <video
                  src={v.public_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    width:     "100%",
                    height:    "auto",
                    display:   "block",
                    objectFit: "cover",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Image gallery ─────────────────────── */}
      {images.length > 0 && (
        <div style={{ padding: "56px 56px 128px 56px" }}>
          <p style={{
            fontSize:      "8px",
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color:         "var(--faint)",
            marginBottom:  "24px",
          }}>
            Frames — {images.length}
          </p>

          {/* /*
            True masonry — CSS columns.
            Images render at their natural height.
            No fixed aspect ratio.
            Portrait photos are tall, landscape are wide.
            This is what makes the gallery feel like a real photography portfolio.
           */}
          <div style={{
            columns:   "3",
            columnGap: "10px",
          }}>
            {images.map((img, i) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: (i % 3) * 0.06 }}
                onClick={() => setLightbox(i)}
                style={{
                  breakInside:  "avoid",
                  marginBottom: "10px",
                  display:      "block",
                  cursor:       "zoom-in",
                  position:     "relative",
                  overflow:     "hidden",
                }}
                className="group"
              >
                <Image
                  src={img.public_url}
                  alt={img.file_name}
                  width={800}
                  height={600}
                  style={{
                    width:      "100%",
                    height:     "auto",
                    display:    "block",
                    objectFit:  "cover",
                    transition: "filter 0.5s ease",
                  }}
                  className="group-hover:brightness-75"
                  sizes="33vw"
                />

                {/* /* Frame number on hover  */}
                <div
                  style={{
                    position:   "absolute",
                    bottom:     "10px",
                    right:      "10px",
                    opacity:    0,
                    transition: "opacity 0.4s ease",
                    fontSize:   "9px",
                    letterSpacing: "0.2em",
                    color:      "rgba(237,233,227,0.6)",
                  }}
                  className="group-hover:opacity-100"
                >
                  {String(i + 1).padStart(2, "0")}
                </div>

              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── Lightbox ──────────────────────────── */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position:       "fixed",
              inset:          0,
              zIndex:         9999,
              background:     "rgba(9,9,9,0.97)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
            }}
            onClick={() => setLightbox(null)}
          >

            {/* /* Top bar  */}
            <div style={{
              position: "absolute",
              top:      0,
              left:     0,
              right:    0,
              padding:  "20px 24px",
              display:  "flex",
              alignItems:     "center",
              justifyContent: "space-between",
            }}>
              <span style={{
                fontSize:      "9px",
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color:         "rgba(237,233,227,0.25)",
              }}>
                {project.title}
              </span>
              <span style={{
                fontSize:      "9px",
                letterSpacing: "0.3em",
                color:         "rgba(237,233,227,0.25)",
              }}>
                {lightbox + 1} / {images.length}
              </span>
              <button
                onClick={() => setLightbox(null)}
                style={{
                  background: "none",
                  border:     "none",
                  color:      "rgba(237,233,227,0.4)",
                  cursor:     "pointer",
                  padding:    "4px",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ede9e3")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(237,233,227,0.4)")}
              >
                <X size={18} />
              </button>
            </div>

            {/* /* Prev  */}
            {images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                style={{
                  position:   "absolute",
                  left:       "20px",
                  top:        "50%",
                  transform:  "translateY(-50%)",
                  background: "none",
                  border:     "none",
                  color:      "rgba(237,233,227,0.3)",
                  cursor:     "pointer",
                  padding:    "12px",
                  transition: "color 0.2s",
                  zIndex:     10,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ede9e3")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(237,233,227,0.3)")}
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* /* Image  */}
            <motion.div
              key={lightbox}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.18 }}
              style={{
                position: "relative",
                width:    "85vw",
                height:   "82vh",
                margin:   "0 60px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[lightbox].public_url}
                alt={images[lightbox].file_name}
                fill
                style={{ objectFit: "contain" }}
                sizes="90vw"
              />
            </motion.div>

            {/* /* Next  */}
            {images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                style={{
                  position:   "absolute",
                  right:      "20px",
                  top:        "50%",
                  transform:  "translateY(-50%)",
                  background: "none",
                  border:     "none",
                  color:      "rgba(237,233,227,0.3)",
                  cursor:     "pointer",
                  padding:    "12px",
                  transition: "color 0.2s",
                  zIndex:     10,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ede9e3")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(237,233,227,0.3)")}
              >
                <ChevronRight size={24} />
              </button>
            )}

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}