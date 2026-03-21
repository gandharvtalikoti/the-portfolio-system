import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn() — Merges Tailwind classes safely.
 *
 * Problem without cn():
 *   className="px-4 px-8"  →  unpredictable which wins
 *
 * With cn():
 *   cn("px-4", "px-8")  →  "px-8"  (last one wins, correctly)
 *
 * shadcn uses this everywhere. It's automatically installed
 * when you run shadcn init.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * formatDate() — Readable date from ISO string
 * "2024-01-15T10:30:00" → "Jan 15, 2024"
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * slugify() — URL-friendly string
 * "My Cool Project!" → "my-cool-project"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}