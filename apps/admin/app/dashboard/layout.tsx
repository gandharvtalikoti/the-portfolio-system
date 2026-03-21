"use client";

/**
 * DashboardLayout — wraps all protected pages.
 *
 * Job 1: AUTH GUARD
 *   Checks if user is logged in.
 *   If not → redirect to /login.
 *   This runs on every page inside /dashboard.
 *
 * Job 2: LAYOUT
 *   Sidebar on the left.
 *   Page content on the right.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // ── Auth Guard ──
  // After auth check completes (isLoading = false):
  // No user → redirect to login
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // ── Loading state ──
  // Show spinner while checking if user is logged in
  // This prevents a flash of the dashboard before redirect
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // ── Not authenticated ──
  // Render nothing while redirect is happening
  // (useEffect redirect is async, this prevents flash)
  if (!user) {
    return null;
  }

  // ── Authenticated ──
  // Show the full layout with sidebar
  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Left sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-6 md:p-8">
          {children}
          {/* children = whatever page is currently active */}
          {/* e.g. DashboardPage, ProjectsPage, BlogPage */}
        </div>
      </main>

    </div>
  );
}