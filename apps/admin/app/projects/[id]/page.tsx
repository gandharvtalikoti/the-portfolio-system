"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getProjectById, updateProject } from "@/lib/api";
import { ProjectForm } from "@/components/forms/ProjectForm";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/api";

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ Unwrap params Promise with React.use()
  const { id } = use(params);

  const router = useRouter();
  const [project, setProject]     = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    if (!id) return;

    const loadProject = async () => {
      try {
        setIsLoading(true);
        const data = await getProjectById(id);
        setProject(data);
      } catch (err: any) {
        setError(
          err?.response?.data?.detail || "Failed to load project"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [id]);

  const handleUpdate = async (data: Partial<Project>) => {
    const result = await updateProject(id, data);
    return result;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md py-16 space-y-4">
        <div className="flex items-start gap-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-4">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Could not load project</p>
            <p className="text-xs mt-1 opacity-80">{error}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/projects")}
        >
          ← Back to Projects
        </Button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-muted-foreground">Project not found.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/projects")}
        >
          ← Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <ProjectForm
      title="Edit Project"
      description={`Editing: ${project.title}`}
      initialData={project}
      onSubmit={handleUpdate}
    />
  );
}
// ```

// ---

// ### Step 5 — Test it

// **Test 1 — Edit opens correctly:**
// ```
// Go to /projects
// Click pencil icon on any project
// → Should load with title, category, tags prefilled
// → Media files section should appear immediately
// → Existing uploaded images should show in the grid
// ```

// **Test 2 — Edit saves correctly:**
// ```
// Change the title
// Click "Update Details"
// Go back to /projects
// → Table should show new title
// ```

// **Test 3 — Edit with images:**
// ```
// Open an existing project that has images
// → Images should appear in the grid
// → Upload more images → they appear
// → Delete an image → disappears from grid and S3
// ```

// **Test 4 — Draft project is editable:**
// ```
// Create a draft project (is_published = false)
// Click pencil icon
// → Should load (previously broken because /{slug} only returns published)
// ```

// ---

// ### What was broken and why
// ```
// Problem 1 — Wrong data shape:
//   useProjects() → GET /admin/all → returned ProjectListItem
//   ProjectListItem has NO media_files field
//   ProjectForm tried to read initialData.media_files → undefined
//   File uploader showed nothing

// Problem 2 — Race condition:
//   EditPage called useProjects()
//   Hook started fetching (async)
//   Meanwhile: projects.find() ran immediately
//   projects was still [] (empty, not loaded yet)
//   find() returned undefined → "Project not found"

// Problem 3 — Drafts not accessible:
//   Old edit page used GET /projects/{slug} (public route)
//   That route only returns is_published = true
//   Trying to edit a draft → 404

// All three fixed now with the direct fetch approach.