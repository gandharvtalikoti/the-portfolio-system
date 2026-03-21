"use client";

import DashboardLayout from "@/app/dashboard/layout";

/**
 * ProjectsLayout — wraps all /projects/* pages.
 * Reuses DashboardLayout which has the sidebar + auth guard.
 * So /projects, /projects/new, /projects/[id] are all protected.
 */
export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}