/**
 * api.ts — All API calls from the admin dashboard to FastAPI.
 *
 * We use axios with an "interceptor" pattern:
 * - Before every request → automatically add the JWT token
 * - After every response → if 401, redirect to login
 *
 * This means you NEVER manually add auth headers anywhere.
 * Just call the function and axios handles the rest.
 */

import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ─────────────────────────────────────────────
// AXIOS INSTANCE
// Pre-configured axios with your base URL
// ─────────────────────────────────────────────

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─────────────────────────────────────────────
// REQUEST INTERCEPTOR
// Runs before every single API call
// Adds JWT token to Authorization header
// ─────────────────────────────────────────────

api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─────────────────────────────────────────────
// RESPONSE INTERCEPTOR
// Runs after every single API response
// If 401 (unauthorized) → clear token → go to login
// ─────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,   // success → just return it
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────
// TYPES
// Mirror your Python schemas exactly
// ─────────────────────────────────────────────

export type ProjectCategory = "photography" | "video" | "design" | "code" | "other";
export type MediaFileType = "image" | "video" | "pdf";

export interface User {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface MediaFile {
  id: string;
  project_id: string;
  s3_key: string;
  public_url: string;
  file_type: MediaFileType;
  file_name: string;
  file_size: number | null;
  order: number;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: ProjectCategory;
  tags: string;
  thumbnail_url: string | null;
  is_published: boolean;
  order: number;
  media_files: MediaFile[];
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────
// AUTH FUNCTIONS
// ─────────────────────────────────────────────

export async function login(email: string, password: string) {
  const { data } = await api.post("/auth/login", { email, password });
  // save token to cookie — expires in 1 day
  Cookies.set("access_token", data.access_token, { expires: 1 });
  return data;
}

export function logout() {
  Cookies.remove("access_token");
  window.location.href = "/login";
}

export async function getMe(): Promise<User> {
  const { data } = await api.get("/auth/me");
  return data;
}

// ─────────────────────────────────────────────
// PROJECT FUNCTIONS
// ─────────────────────────────────────────────

export async function getAdminProjects(): Promise<Project[]> {
  const { data } = await api.get("/projects/admin/all");
  return data;
}

export async function createProject(payload: Partial<Project>): Promise<Project> {
  const { data } = await api.post("/projects", payload);
  return data;
}

export async function updateProject(id: string, payload: Partial<Project>): Promise<Project> {
  const { data } = await api.put(`/projects/${id}`, payload);
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/projects/${id}`);
}

export async function togglePublish(id: string): Promise<Project> {
  const { data } = await api.patch(`/projects/${id}/publish`);
  return data;
}

// ─────────────────────────────────────────────
// BLOG FUNCTIONS
// ─────────────────────────────────────────────

export async function getAdminPosts(): Promise<BlogPost[]> {
  const { data } = await api.get("/blog/admin/all");
  return data;
}

export async function createPost(payload: Partial<BlogPost>): Promise<BlogPost> {
  const { data } = await api.post("/blog", payload);
  return data;
}

export async function updatePost(id: string, payload: Partial<BlogPost>): Promise<BlogPost> {
  const { data } = await api.put(`/blog/${id}`, payload);
  return data;
}

export async function deletePost(id: string): Promise<void> {
  await api.delete(`/blog/${id}`);
}


// ─────────────────────────────────────────────
// UPLOAD FUNCTIONS
// ─────────────────────────────────────────────

export async function uploadFile(
  file: File,
  projectId: string,
  onProgress?: (percent: number) => void
): Promise<MediaFile> {
  /**
   * Upload a single file to S3 via the backend.
   *
   * Why FormData instead of JSON?
   * Files are binary data — can't be JSON serialized.
   * FormData bundles file + text fields together.
   *
   * onProgress callback:
   * axios supports upload progress events.
   * We use this to show a progress bar.
   */
  const formData = new FormData();
  formData.append("file", file);
  formData.append("project_id", projectId);

  const { data } = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      // override the default application/json
      // axios needs this for file uploads
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percent);
      }
    },
  });

  return data;
}

export async function deleteMediaFile(mediaFileId: string): Promise<void> {
  await api.delete(`/upload/${mediaFileId}`);
}

export async function setThumbnail(mediaFileId: string): Promise<void> {
  await api.patch(`/upload/${mediaFileId}/thumbnail`);
}

export async function getProjectById(id: string): Promise<Project> {
  const { data } = await api.get(`/projects/admin/${id}`);
  return data;
}