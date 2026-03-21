import type { Metadata } from "next";
import { getProjects }   from "@/lib/api";
import { WorkGallery }   from "@/components/work/WorkGallery";
import { site }          from "@/config/site";

export const metadata: Metadata = {
  title:       "Work",
  description: `Photography and visual work by ${site.name}`,
};

export default async function WorkPage() {
  const projects = await getProjects().catch(() => []);

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* Page header */}
      <div style={{
        padding:      "160px 56px 64px 56px",
        borderBottom: "1px solid var(--border)",
        marginBottom: "56px",
      }}>

        <p style={{
          fontSize:      "9px",
          letterSpacing: "0.5em",
          textTransform: "uppercase",
          color:         "var(--muted)",
          marginBottom:  "20px",
        }}>
          Portfolio
        </p>

        <div style={{
          display:        "flex",
          alignItems:     "flex-end",
          justifyContent: "space-between",
        }}>
          <h1 style={{
            fontFamily:    "var(--font-playfair), Georgia, serif",
            fontSize:      "clamp(52px, 8vw, 96px)",
            fontWeight:    700,
            color:         "var(--text)",
            lineHeight:    1,
            letterSpacing: "-0.02em",
            margin:        0,
          }}>
            Work
          </h1>
          <p style={{
            fontSize:      "11px",
            color:         "var(--faint)",
            letterSpacing: "0.15em",
            paddingBottom: "12px",
          }}>
            {projects.length} projects
          </p>
        </div>

      </div>

      {/* Gallery */}
      <div>
        <WorkGallery projects={projects} />
      </div>

    </div>
  );
}