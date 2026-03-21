"use client";

/**
 * AuthContext.tsx — Global authentication state.
 *
 * Provides to the entire app:
 *   user        → the logged-in user object (null if not logged in)
 *   isLoading   → true while we're checking if user is logged in
 *   login()     → call with email+password to log in
 *   logout()    → call to log out
 *
 * How to use in any component:
 *   const { user, login, logout } = useAuth()
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  login as apiLogin,
  logout as apiLogout,
  getMe
} from "@/lib/api";
import type { User } from "@/lib/api";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// ─────────────────────────────────────────────
// CREATE CONTEXT
// ─────────────────────────────────────────────

// We start with null! — the ! tells TypeScript
// "trust me, this will always be inside the Provider"
// so it won't complain about it being null
const AuthContext = createContext<AuthContextType>(null!);

// ─────────────────────────────────────────────
// PROVIDER COMPONENT
// Wrap your entire app with this
// Then any child component can call useAuth()
// ─────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]           = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // start as true because we immediately check for existing session
  const router = useRouter();

  // ── Check for existing session on app load ──
  // When the page loads or refreshes:
  // 1. Check if there's a saved token in cookies
  // 2. If yes → verify it's still valid with GET /auth/me
  // 3. If valid → set user (auto login)
  // 4. If invalid → clear cookie (force login)
  useEffect(() => {
    const token = Cookies.get("access_token");

    if (!token) {
      // no token → definitely not logged in
      setIsLoading(false);
      return;
    }

    // token exists → verify it's still valid
    getMe()
      .then((userData) => {
        setUser(userData);
      })
      .catch(() => {
        // token expired or invalid → clean up
        Cookies.remove("access_token");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []); // [] means run once on mount only

  // ── Login function ──
  // Called by the login page when form is submitted
  const login = async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    // apiLogin already saved the token to cookie
    setUser(data.user);
    router.push("/dashboard");
  };

  // ── Logout function ──
  // Called by the sidebar logout button
  const logout = () => {
    apiLogout(); // removes cookie + redirects to /login
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────
// CUSTOM HOOK
// Makes using the context cleaner
//
// Instead of:
//   const { user } = useContext(AuthContext)
// You write:
//   const { user } = useAuth()
// ─────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}