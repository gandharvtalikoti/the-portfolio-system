"use client";

import { useState }             from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link                     from "next/link";
import Image                    from "next/image";
import type { ProjectListItem, Category } from "@/lib/api";
import { site }                 from "@/config/site";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

interface Props {
  projects: ProjectListItem[];
}

export function WorkGallery({ projects }: Props) {
  const [active, setActive] = useState<"all" | Category>("all");

  const filtered =
    active === "all"
      ? projects
      : projects.filter((p) => p.category === active);

  /* Only show filter buttons for categories that have projects */
  const used = new Set(projects.map((p) => p.category));
  const filters = site.categories.filter(
    (c) => c.value === "all" || used.has(c.value as Category)
  );

  return (
    <div>

      {/* ── Filter bar ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          display:    "flex",
          flexWrap:   "wrap",
          gap:        "8px",
          marginBottom: "48px",
        }}
      >
        {filters.map((f) => {
          const isActive = active === f.value;
          const count =
            f.value === "all"
              ? projects.length
              : projects.filter((p) => p.category === f.value).length;

          return (
            <button
              key={f.value}
              onClick={() => setActive(f.value as "all" | Category)}
              style={{
                padding:       "7px 18px",
                fontSize:      "9px",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                borderRadius:  "100px",
                border:        isActive
                  ? "1px solid rgba(237,233,227,0.6)"
                  : "1px solid rgba(237,233,227,0.12)",
                background:    isActive
                  ? "rgba(237,233,227,0.06)"
                  : "transparent",
                color:         isActive
                  ? "var(--text)"
                  : "var(--muted)",
                transition:    "all 0.3s ease",
              }}
            >
              {f.label}
              <span style={{
                marginLeft: "6px",
                fontSize:   "8px",
                opacity:    0.45,
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* ── Count ──────────────────────────────── */}
      <motion.p
        layout
        style={{
          fontSize:      "9px",
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color:         "var(--faint)",
          marginBottom:  "28px",
        }}
      >
        {filtered.length} {filtered.length === 1 ? "project" : "projects"}
      </motion.p>

      {/* ── Masonry grid ───────────────────────── */}
      {/* /*
        CSS columns masonry — simplest approach, no JS library.
        Images keep their natural height — portrait photos are
        taller, landscape are shorter. Creates true masonry rhythm.

        columns: 2 on mobile, 3 on desktop.
        columnGap: space between columns.
        Each card has marginBottom for row spacing.
      */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            columns:   "2",
            columnGap: "12px",
          }}
        >
          {filtered.length === 0 ? (
            <div style={{
              textAlign:   "center",
              padding:     "80px 0",
              color:       "var(--faint)",
              fontSize:    "12px",
              letterSpacing: "0.2em",
            }}>
              No projects yet
            </div>
          ) : (
            filtered.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.55,
                  delay:    (i % 3) * 0.06,
                  ease,
                }}
                style={{
                  breakInside:  "avoid",
                  marginBottom: "12px",
                  display:      "block",
                }}
              >
                <WorkCard project={project} />
              </motion.div>
            ))
          )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}

/* ── Individual masonry card ─────────────────────────────── */

function WorkCard({ project }: { project: ProjectListItem }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      style={{ display: "block", textDecoration: "none" }}
      className="group"
    >

      {/*
        No fixed aspect ratio here — this is the key to masonry.
        Image renders at its natural height.
        Portrait images are tall, landscape are short.
        This variation is what makes masonry look editorial.
      */}
      <div style={{
        position: "relative",
        overflow: "hidden",
        background: "var(--bg2)",
      }}>

        {project.thumbnail_url ? (
          <Image
            src={project.thumbnail_url}
            alt={project.title}
            width={800}
            height={600}
            style={{
              width:      "100%",
              height:     "auto",
              display:    "block",
              objectFit:  "cover",
              transition: "transform 0.8s ease, filter 0.7s ease",
            }}
            className="group-hover:scale-[1.04] group-hover:brightness-[0.38]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          /* Placeholder card when no thumbnail */
          <div style={{
            width:          "100%",
            paddingBottom:  "75%",
            background:     "var(--bg2)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
          }}>
            <span style={{
              fontSize:      "9px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color:         "var(--faint)",
              position:      "absolute",
              top:           "50%",
              left:          "50%",
              transform:     "translate(-50%,-50%)",
            }}>
              {project.category}
            </span>
          </div>
        )}

        {/* Centered text on hover — same pattern as HomeWork */}
        <div
          style={{
            position:       "absolute",
            inset:          0,
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            gap:            "10px",
            textAlign:      "center",
            padding:        "20px",
            opacity:        0,
            transition:     "opacity 0.7s ease",
            pointerEvents:  "none",
            zIndex:         10,
          }}
          className="group-hover:opacity-100"
        >
          <span style={{
            fontSize:      "8px",
            letterSpacing: "0.5em",
            textTransform: "uppercase",
            color:         "rgba(237,233,227,0.45)",
          }}>
            {project.category}
          </span>

          <div style={{
            width:      "20px",
            height:     "1px",
            background: "rgba(237,233,227,0.2)",
          }} />

          <h3 style={{
            fontFamily:    "var(--font-playfair), Georgia, serif",
            fontSize:      "clamp(13px, 1.6vw, 19px)",
            fontWeight:    600,
            color:         "#ede9e3",
            lineHeight:    1.3,
            letterSpacing: "-0.01em",
            margin:        0,
          }}>
            {project.title}
          </h3>

        </div>

      </div>

    </Link>
  );
}