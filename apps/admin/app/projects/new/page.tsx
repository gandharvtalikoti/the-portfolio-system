"use client";

import { useRouter } from "next/navigation";
import { ProjectForm } from "@/components/forms/ProjectForm";
import { useProjects } from "@/hooks/useProjects";
import type { Project } from "@/lib/api";

export default function NewProjectPage() {
  const { createProject } = useProjects();
  const router = useRouter();

  const handleCreate = async (data: Partial<Project>) => {
    const result = await createProject(data);
    return result;   // ← must return so ProjectForm gets the id
  };

  return (
    <ProjectForm
      title="New Project"
      description="Add a new piece of work to your portfolio"
      onSubmit={handleCreate}
    />
  );
}