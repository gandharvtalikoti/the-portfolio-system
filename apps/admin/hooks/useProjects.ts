"use client";

/**
 * useProjects.ts — Everything related to project data.
 *
 * Any component that needs projects just calls:
 *   const { projects, createProject, deleteProject } = useProjects()
 *
 * This hook handles:
 * - Fetching all projects from the API
 * - Loading and error states
 * - Create, update, delete, toggle publish
 * - Keeping the UI in sync after every change
 */

import { useState, useEffect, useCallback } from "react";
import {
  getAdminProjects,
  createProject as apiCreate,
  updateProject as apiUpdate,
  deleteProject as apiDelete,
  togglePublish as apiToggle,
  type Project,
} from "@/lib/api";

export function useProjects() {
  const [projects, setProjects]   = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  // ── Fetch all projects ──
  // useCallback means this function reference stays stable
  // so we can safely put it in useEffect dependencies
  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAdminProjects();
      setProjects(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || "Failed to load projects"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // fetch on first render
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // ── Create ──
  const createProject = async (payload: Partial<Project>) => {
    const newProject = await apiCreate(payload);
    // add to start of list so it appears at the top immediately
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  };

  // ── Update ──
  const updateProject = async (id: string, payload: Partial<Project>) => {
    const updated = await apiUpdate(id, payload);
    // replace the old version with the updated one
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? updated : p))
    );
    return updated;
  };

  // ── Delete ──
  const deleteProject = async (id: string) => {
    await apiDelete(id);
    // remove from list immediately
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // ── Toggle published/draft ──
  const togglePublish = async (id: string) => {
    const updated = await apiToggle(id);
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? updated : p))
    );
    return updated;
  };

  return {
    projects,
    isLoading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    togglePublish,
  };
}



// ---

// ### Step 12b — ProjectForm component

// This single form handles both creating AND editing.

// How:

// /projects/new      → no initialData prop → empty form → calls createProject
// /projects/[id]     → initialData prop    → prefilled  → calls updateProject
