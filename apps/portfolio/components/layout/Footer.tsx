"use client";

import Link    from "next/link";
import { site } from "@/config/site";
import { MouseEvent } from "react";

export function Footer() {
  return (
    <footer style={{
      borderTop:      "1px solid var(--border)",
      padding:        "32px 56px",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "space-between",
      flexWrap:       "wrap",
      gap:            "16px",
    }}>

      <span style={{
        fontSize:      "9px",
        letterSpacing: "0.3em",
        textTransform: "uppercase",
        color:         "var(--faint)",
      }}>
        {site.name} © {new Date().getFullYear()}
      </span>

      <span style={{
        fontSize:      "9px",
        letterSpacing: "0.3em",
        textTransform: "uppercase",
        color:         "var(--faint)",
      }}>
        {site.location}
      </span>

      <div style={{ display: "flex", gap: "24px" }}>
        {site.social.instagram && (
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize:       "9px",
              letterSpacing:  "0.3em",
              textTransform:  "uppercase",
              color:          "var(--faint)",
              textDecoration: "none",
              transition:     "color 0.3s",
            }}
            onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "var(--faint)")}
          >
            Instagram
          </a>
        )}
        <a
          href={`mailto:${site.social.email}`}
          style={{
            fontSize:       "9px",
            letterSpacing:  "0.3em",
            textTransform:  "uppercase",
            color:          "var(--faint)",
            textDecoration: "none",
            transition:     "color 0.3s",
          }}
          onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "var(--text)")}
          onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "var(--faint)")}
        >
          Email
        </a>
      </div>

    </footer>
  );
}
// ```

// ---

// ## Why this happened
// ```
// Next.js App Router rule:

// Server Component  → runs on server, no browser APIs
//                     cannot have onClick, onMouseEnter etc.
//                     cannot use useState, useEffect

// Client Component  → runs in browser
//                     can have all event handlers
//                     needs "use client" at the top

// Footer had onMouseEnter/onMouseLeave
// but no "use client" directive
// → Next.js threw this error

// Same rule applies to any component with:
//   onClick, onMouseEnter, onMouseLeave
//   onChange, onSubmit, onKeyDown
//   useState, useEffect, useRef
//   → must have "use client" at top