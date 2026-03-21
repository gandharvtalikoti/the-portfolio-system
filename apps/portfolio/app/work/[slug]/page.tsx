import type { Metadata }  from "next";
import { notFound }       from "next/navigation";
import { getProject }     from "@/lib/api";
import { ProjectView }    from "@/components/work/ProjectView";
import { site }           from "@/config/site";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const p = await getProject(slug);
    return {
      title:       p.title,
      description: p.description ?? `${p.title} by ${site.name}`,
      openGraph: {
        images: p.thumbnail_url ? [p.thumbnail_url] : [],
      },
    };
  } catch {
    return { title: "Project" };
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  let project;
  try {
    project = await getProject(slug);
  } catch {
    notFound();
  }
  return <ProjectView project={project!} />;
}
// ```

// ---

// ## Step 20 — Test

// Visit **http://localhost:3000/work**
// ```
// ✅ "Work" heading in serif
// ✅ Filter buttons with counts
// ✅ Masonry grid — photos at natural heights
// ✅ Hover photo → dims + title appears centered
// ✅ Click photo → goes to project page
// ```

// Visit any project:
// ```
// ✅ Hero image with parallax
// ✅ Back button
// ✅ Title overlaid on hero bottom
// ✅ Tags + description strip
// ✅ Videos autoplay silently
// ✅ Images in masonry gallery
// ✅ Hover image → dims slightly + frame number appears
// ✅ Click image → lightbox opens
// ✅ Arrow keys or chevrons navigate
// ✅ ESC or click outside closes