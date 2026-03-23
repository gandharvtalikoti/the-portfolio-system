"use client";

import { useState, useEffect, use } from "react";
import { useRouter }                from "next/navigation";
import { getProjectById, updateProject } from "@/lib/api";
import { ProjectForm }              from "@/components/forms/ProjectForm";
import { Loader2, AlertCircle }     from "lucide-react";
import { Button }                   from "@/components/ui/button";
import type { Project }             from "@/lib/api";

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }                        = use(params);
  const router                        = useRouter();
  const [project, setProject]         = useState<Project | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState("");

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await getProjectById(id);
        setProject(data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Failed to load project");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const handleUpdate = async (data: Partial<Project>): Promise<void> => {
    await updateProject(id, data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground mx-auto" />
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
