const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export type Category = "photography" | "video" | "design" | "code" | "other";

export interface MediaFile {
  id:          string;
  project_id:  string;
  s3_key:      string;
  public_url:  string;
  file_type:   "image" | "video" | "pdf";
  file_name:   string;
  file_size:   number | null;
  order:       number;
  created_at:  string;
}

export interface ProjectListItem {
  id:            string;
  title:         string;
  slug:          string;
  category:      Category;
  tags:          string;
  thumbnail_url: string | null;
  is_published:  boolean;
  order:         number;
  created_at:    string;
}

export interface Project extends ProjectListItem {
  description:  string | null;
  media_files:  MediaFile[];
  updated_at:   string;
}

async function get<T>(path: string, revalidate = 60): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { next: { revalidate } });
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json();
}

export const getProjects = (category?: Category) =>
  get<ProjectListItem[]>(`/projects${category ? `?category=${category}` : ""}`);

export const getProject = (slug: string) =>
  get<Project>(`/projects/${slug}`, 30);