import { redirect } from "next/navigation";

/**
 * Root page "/"
 * Just redirects to /dashboard.
 * Dashboard will redirect to /login if not authenticated.
 */
export default function RootPage() {
  redirect("/dashboard");
}