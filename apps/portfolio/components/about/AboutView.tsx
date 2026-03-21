"use client";

import { motion }  from "framer-motion";
import Link        from "next/link";
import { site }    from "@/config/site";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 24 },
  whileInView:{ opacity: 1, y: 0  },
  viewport:   { once: true },
  transition: { duration: 0.7, delay, ease },
});

export function AboutView() {
  return (
    <div style={{ minHeight: "100vh" }}>

      {/* ── Hero text ─────────────────────────── */}
      <div style={{
        padding:   "160px 56px 80px 56px",
        borderBottom: "1px solid var(--border)",
      }}>

        <motion.p
          {...fadeUp(0.1)}
          style={{
            fontSize:      "9px",
            letterSpacing: "0.5em",
            textTransform: "uppercase",
            color:         "var(--muted)",
            marginBottom:  "32px",
          }}
        >
          About
        </motion.p>

        {/* Large opening statement */}
        <motion.h1
          {...fadeUp(0.25)}
          style={{
            fontFamily:    "var(--font-playfair), Georgia, serif",
            fontSize:      "clamp(28px, 4.5vw, 56px)",
            fontWeight:    700,
            color:         "var(--text)",
            lineHeight:    1.2,
            letterSpacing: "-0.02em",
            maxWidth:      "820px",
            margin:        0,
          }}
        >
          {site.bio}
        </motion.h1>

      </div>

      {/* ── Two column info ───────────────────── */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: "1fr 1fr",
        gap:                 "0",
        borderBottom:        "1px solid var(--border)",
      }}>

        {/* Left — what I do */}
        <div style={{
          padding:      "64px 56px",
          borderRight:  "1px solid var(--border)",
        }}>
          <motion.p
            {...fadeUp(0.1)}
            style={{
              fontSize:      "8px",
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color:         "var(--faint)",
              marginBottom:  "24px",
            }}
          >
            What I Do
          </motion.p>

          {[
            "Photography",
            "Video Editing",
            "Visual Storytelling",
            "Commercial Work",
            "Event Coverage",
          ].map((item, i) => (
            <motion.div
              key={item}
              {...fadeUp(0.1 + i * 0.07)}
              style={{
                display:       "flex",
                alignItems:    "center",
                gap:           "16px",
                padding:       "16px 0",
                borderBottom:  "1px solid var(--border)",
              }}
            >
              {/* Number */}
              <span style={{
                fontSize:      "9px",
                letterSpacing: "0.15em",
                color:         "var(--faint)",
                fontVariantNumeric: "tabular-nums",
                minWidth:      "20px",
              }}>
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Service */}
              <span style={{
                fontSize:   "14px",
                color:      "var(--muted)",
                lineHeight: 1,
              }}>
                {item}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Right — details */}
        <div style={{ padding: "64px 56px" }}>

          {/* Location */}
          <motion.div {...fadeUp(0.15)} style={{ marginBottom: "48px" }}>
            <p style={{
              fontSize:      "8px",
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color:         "var(--faint)",
              marginBottom:  "12px",
            }}>
              Based In
            </p>
            <p style={{
              fontSize:   "16px",
              color:      "var(--text)",
              lineHeight: 1,
            }}>
              {site.location}
            </p>
          </motion.div>

          {/* Available for */}
          <motion.div {...fadeUp(0.25)} style={{ marginBottom: "48px" }}>
            <p style={{
              fontSize:      "8px",
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color:         "var(--faint)",
              marginBottom:  "12px",
            }}>
              Available For
            </p>
            <p style={{
              fontSize:   "14px",
              color:      "var(--muted)",
              lineHeight: 1.7,
            }}>
              Commercial shoots, editorial projects,
              event coverage, and long-term collaborations.
              Open to travel across India.
            </p>
          </motion.div>

          {/* Contact */}
          <motion.div {...fadeUp(0.35)}>
            <p style={{
              fontSize:      "8px",
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color:         "var(--faint)",
              marginBottom:  "16px",
            }}>
              Get In Touch
            </p>

            
            <a
              href={`mailto:${site.social.email}`}
              style={{
                display:        "inline-flex",
                alignItems:     "center",
                gap:            "12px",
                fontSize:       "13px",
                color:          "var(--muted)",
                textDecoration: "none",
                transition:     "color 0.3s",
                marginBottom:   "12px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
            >
              <span style={{
                width:      "20px",
                height:     "1px",
                background: "currentColor",
                flexShrink: 0,
              }} />
              {site.social.email}
            </a>

            {site.social.instagram && (
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  gap:            "12px",
                  fontSize:       "13px",
                  color:          "var(--muted)",
                  textDecoration: "none",
                  transition:     "color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
              >
                <span style={{
                  width:      "20px",
                  height:     "1px",
                  background: "currentColor",
                  flexShrink: 0,
                }} />
                Instagram
              </a>
            )}
          </motion.div>

        </div>

      </div>

      {/* ── Philosophy statement ──────────────── */}
      <div style={{ padding: "80px 56px 128px 56px" }}>

        <motion.p
          {...fadeUp(0.1)}
          style={{
            fontSize:      "8px",
            letterSpacing: "0.5em",
            textTransform: "uppercase",
            color:         "var(--faint)",
            marginBottom:  "32px",
          }}
        >
          Philosophy
        </motion.p>

        <motion.blockquote
          {...fadeUp(0.2)}
          style={{
            fontFamily:    "var(--font-playfair), Georgia, serif",
            fontSize:      "clamp(20px, 3vw, 36px)",
            fontWeight:    400,
            fontStyle:     "italic",
            color:         "var(--muted)",
            lineHeight:    1.5,
            maxWidth:      "720px",
            borderLeft:    "1px solid var(--border)",
            paddingLeft:   "32px",
            margin:        0,
          }}
        >
          "Every frame is a decision. Every edit is a choice.
          The work is in finding what's essential."
        </motion.blockquote>

        {/* CTA to work */}
        <motion.div {...fadeUp(0.35)} style={{ marginTop: "64px" }}>
          <Link
            href="/work"
            style={{
              display:        "inline-flex",
              alignItems:     "center",
              gap:            "20px",
              fontSize:       "10px",
              letterSpacing:  "0.4em",
              textTransform:  "uppercase",
              color:          "var(--muted)",
              textDecoration: "none",
              transition:     "color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            <span style={{
              width:      "40px",
              height:     "1px",
              background: "currentColor",
            }} />
            View Work
          </Link>
        </motion.div>

      </div>

    </div>
  );
}