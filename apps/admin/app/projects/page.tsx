"use client";

/**
 * Projects List — /projects
 * Table of all your projects with actions.
 */

import { useState } from "react";
import Link from "next/link";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  FolderOpen,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Project } from "@/lib/api";

// colour per category — makes the table scannable
const CATEGORY_STYLES: Record<string, string> = {
  photography: "bg-blue-100   text-blue-800",
  video:       "bg-purple-100 text-purple-800",
  design:      "bg-pink-100   text-pink-800",
  code:        "bg-green-100  text-green-800",
  other:       "bg-slate-100  text-slate-800",
};

export default function ProjectsPage() {
  const {
    projects,
    isLoading,
    error,
    deleteProject,
    togglePublish,
  } = useProjects();

  // track which row is currently being actioned
  // so we can show a spinner on just that button
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [togglingId, setTogglingId]     = useState<string | null>(null);

  // two-step delete: first click shows confirm buttons
  // second click actually deletes
  // prevents accidental deletion
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

const handleToggle = async (project: Project) => {
  setTogglingId(project.id);
  try {
    await togglePublish(project.id);
  } finally {
    setTogglingId(null);
  }
};

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteProject(id);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            {isLoading
              ? "Loading..."
              : `${projects.length} project${projects.length !== 1 ? "s" : ""} total`
            }
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* ── Table ── */}
      <Card>
        <CardContent className="p-0">

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && projects.length === 0 && (
            <div className="text-center py-16 space-y-3">
              <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto" />
              <div>
                <p className="font-medium">No projects yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first project to get started
                </p>
              </div>
              <Button asChild size="sm">
                <Link href="/projects/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Link>
              </Button>
            </div>
          )}

          {/* Projects table */}
          {!isLoading && projects.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">

                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Title
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                      Category
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                      Created
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      className="hover:bg-slate-50 transition-colors"
                    >

                      {/* Title + slug */}
                      <td className="px-4 py-3">
                        <p className="font-medium">{project.title}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          /{project.slug}
                        </p>
                      </td>

                      {/* Category badge */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`
                          inline-flex items-center px-2 py-0.5 rounded-full
                          text-xs font-medium capitalize
                          ${CATEGORY_STYLES[project.category]}
                        `}>
                          {project.category}
                        </span>
                      </td>

                      {/* Created date */}
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {formatDate(project.created_at)}
                      </td>

                      {/* Published status */}
                      <td className="px-4 py-3">
                        <Badge
                          variant={project.is_published ? "default" : "secondary"}
                          className={project.is_published
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : ""
                          }
                        >
                          {project.is_published ? "Live" : "Draft"}
                        </Badge>
                      </td>

                      {/* Action buttons */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">

                          {/* Confirm delete buttons */}
                          {confirmDeleteId === project.id ? (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={deletingId === project.id}
                                onClick={() => handleDelete(project.id)}
                              >
                                {deletingId === project.id
                                  ? <Loader2 className="h-3 w-3 animate-spin" />
                                  : "Delete"
                                }
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setConfirmDeleteId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <>
                              {/* Toggle publish */}
                            {/* Toggle publish */}
<Button
  variant="ghost"
  size="icon"
  title={project.is_published ? "Unpublish" : "Publish"}
  disabled={togglingId === project.id}
  onClick={() => handleToggle(project)}
  className={project.is_published
    ? "text-green-600 hover:text-green-700"
    : "text-muted-foreground"
  }
>
  {togglingId === project.id
    ? <Loader2 className="h-4 w-4 animate-spin" />
    : project.is_published
      ? <Eye className="h-4 w-4" />
      : <EyeOff className="h-4 w-4" />
  }
</Button>

                              {/* Edit */}
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Edit"
                                asChild
                              >
                                <Link href={`/projects/${project.id}`}>
                                  <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>

                              {/* Delete (first click) */}
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Delete"
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setConfirmDeleteId(project.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </CardContent>
      </Card>

    </div>
  );
}