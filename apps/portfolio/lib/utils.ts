import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function projectYear(dateString: string): string {
  return new Date(dateString).getFullYear().toString();
}

export function projectMonth(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    year:  "numeric",
  });
}