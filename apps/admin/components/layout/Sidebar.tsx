"use client";

/**
 * Sidebar.tsx — Left navigation panel.
 *
 * Shows:
 * - App logo/title
 * - Navigation links (with active state)
 * - Logged-in user email
 * - Logout button
 *
 * Active state: highlights the current page link
 * Mobile: collapses behind a hamburger button
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";

// ─────────────────────────────────────────────
// NAV ITEMS
// Define your navigation links in one place
// Adding a new page = just add an item here
// ─────────────────────────────────────────────

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview & stats",
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderOpen,
    description: "Manage your work",
  },
  {
    label: "Blog",
    href: "/blog",
    icon: FileText,
    description: "Write & manage posts",
  },
];

// ─────────────────────────────────────────────
// SIDEBAR CONTENT
// Extracted as inner component so we can reuse
// it in both desktop and mobile versions
// ─────────────────────────────────────────────

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  // usePathname() gives you the current URL path
  // e.g. "/projects/new"

  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full">

      {/* ── Logo ── */}
      <div className="px-6 py-5">
        <h2 className="font-bold text-lg tracking-tight">
          Portfolio Admin
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Content Management
        </p>
      </div>

      <Separator />

      {/* ── Navigation Links ── */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          // isActive logic:
          // - Dashboard: only active on exact /dashboard
          // - Others: active on /projects AND /projects/new AND /projects/abc-123
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                // base styles for all nav items
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                // active styles
                isActive
                  ? "bg-slate-900 text-white font-medium"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <div>
                <div>{item.label}</div>
                {!isActive && (
                  <div className="text-xs opacity-60">
                    {item.description}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* ── User Info + Logout ── */}
      <div className="px-3 py-4 space-y-2">

        {/* User email display */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50">
          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-slate-600" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium truncate">
              {user?.email}
            </p>
            <p className="text-xs text-muted-foreground">
              Administrator
            </p>
          </div>
        </div>

        {/* Logout button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-red-600 hover:bg-red-50"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN SIDEBAR COMPONENT
// Handles both desktop and mobile layouts
// ─────────────────────────────────────────────

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      {/* hidden on mobile (md:flex shows it on medium+ screens) */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-white h-screen sticky top-0 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile: Hamburger Button ── */}
      {/* only shows on small screens */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen
          ? <X className="h-5 w-5" />
          : <Menu className="h-5 w-5" />
        }
      </button>

      {/* ── Mobile: Overlay ── */}
      {/* dark background behind sidebar on mobile */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile: Slide-in Sidebar ── */}
      {mobileOpen && (
        <aside className="md:hidden fixed left-0 top-0 h-full w-64 bg-white border-r z-50 flex flex-col">
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </aside>
      )}
    </>
  );
}