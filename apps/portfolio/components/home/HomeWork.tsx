"use client";

import { motion }               from "framer-motion";
import Link                     from "next/link";
import Image                    from "next/image";
import type { ProjectListItem } from "@/lib/api";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

interface Props { projects: ProjectListItem[] }

export function HomeWork({ projects }: Props) {
  if (projects.length === 0) return null;

  return (
    <section className="px-8 md:px-14 pb-32 pt-4">

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between mb-8"
      >
        <p style={{
          fontSize:      "13px",
          letterSpacing: "0.5em",
          textTransform: "uppercase",
          color:         "var(--muted)",
          marginBottom:"5px"
        }}>
          My Work
        </p>

        <Link
          href="/work"
          style={{
            fontSize:      "9px",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color:         "var(--muted)",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
        >
          View All →
        </Link>
      </motion.div>

      {/* Grid */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap:                 "12px",
      }}>
        {projects.slice(0, 6).map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, delay: i * 0.07, ease }}
          >
            <HomeCard project={project} />
          </motion.div>
        ))}
      </div>

    </section>
  );
}

function HomeCard({ project }: { project: ProjectListItem }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      style={{ display: "block", textDecoration: "none" }}
      className="group"
    >

      {/* Image container */}
      <div style={{
        position:     "relative",
        width:        "100%",
        paddingBottom: "75%",
        overflow:     "hidden",
        background:   "var(--bg2)",
      }}>

        {project.thumbnail_url ? (
          <Image
            src={project.thumbnail_url}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div style={{
            position:   "absolute",
            inset:      0,
            display:    "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{
              fontSize:      "9px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color:         "var(--faint)",
            }}>
              {project.category}
            </span>
          </div>
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition duration-300" />

        {/* Centered hover content */}
        <div
          className="
            absolute inset-0
            flex flex-col items-center justify-center text-center
            translate-y-2 opacity-0
            group-hover:translate-y-0 group-hover:opacity-100
            transition-all duration-300
          "
        >
          <p
            className="text-[8px] tracking-[0.3em] uppercase mb-1.5"
            style={{ color: "rgba(237,233,227,0.5)" }}
          >
            {project.category}
          </p>

          <h3
            className="text-sm font-medium leading-snug"
            style={{ color: "var(--text)" }}
          >
            {project.title}
          </h3>
        </div>

      </div>

    </Link>
  );
}