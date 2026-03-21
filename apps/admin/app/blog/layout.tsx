"use client";

import DashboardLayout from "@/app/dashboard/layout";

/**
 * BlogLayout — wraps all /blog/* pages.
 * Same as ProjectsLayout — reuses DashboardLayout.
 */
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}




// ---

// ### Step 11e — Test everything

// Make sure both servers are running, then open **http://localhost:3000**

// **Test 1 — Auth guard works:**
// Clear your cookie first:
// Browser DevTools → Application → Cookies → localhost:3000
// → delete the access_token cookie

// Now visit http://localhost:3000/dashboard

// You should be redirected to /login immediately.

// **Test 2 — Login works:**
// Log in with your credentials.
// You should land on /dashboard and see:

// ✅ Sidebar on the left with Dashboard, Projects, Blog links
// ✅ Welcome back 👋 message
// ✅ Quick action buttons
// ✅ Your email shown at the bottom of the sidebar


// **Test 3 — Navigation works:**
// Click Projects in the sidebar → URL changes to /projects
// Click Blog → URL changes to /blog

// Both will show a blank page for now — that's fine, we haven't built those pages yet.

// **Test 4 — Active state works:**
// The current page link in the sidebar should be highlighted dark.

// **Test 5 — Logout works:**
// Click Sign out in the sidebar.
// You should be redirected to /login.
// Visiting /dashboard again should redirect back to /login.

// ---

// ### What the auth guard flow looks like

// User visits /dashboard
//         │
//         ▼
// DashboardLayout renders
//         │
//         ▼
// useAuth() → isLoading = true (checking cookie)
//         │
//         ▼
// Show spinner
//         │
//         ▼
// getMe() completes
//         │
//    ┌────┴────┐
//    │         │
//  user      no user
// exists     found
//    │         │
//    ▼         ▼
// Show       redirect
// dashboard  to /login


// ---

// ### Current state

// ✅ Sidebar           — navigation with active states + mobile support
// ✅ DashboardLayout   — auth guard + sidebar wrapper
// ✅ Dashboard page    — welcome page with quick actions
// ✅ Projects layout   — protected, has sidebar
// ✅ Blog layout       — protected, has sidebar
// ✅ Auth flow         — login → dashboard → logout → login
