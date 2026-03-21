"use client";

/**
 * Login Page — /login
 *
 * What happens:
 * 1. User types email + password
 * 2. Clicks Sign In
 * 3. We call login() from AuthContext
 * 4. AuthContext calls POST /api/auth/login
 * 5. FastAPI checks credentials
 * 6. If correct → JWT token saved → redirect to /dashboard
 * 7. If wrong → show error message
 */

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// shadcn components
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// lucide icons
import { Loader2, Lock, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { login, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // local form state
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // if already logged in → skip login page
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  // ── Form submit handler ──
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // e.preventDefault() stops the browser's default form behaviour
    // which would refresh the page — we handle it ourselves

    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      // login() redirects to /dashboard on success
      // so nothing else runs here after success
    } catch (err: any) {
      // extract error message from FastAPI response
      // FastAPI returns: { "detail": "Incorrect email or password" }
      const message =
        err?.response?.data?.detail ||
        "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // show spinner while checking existing session
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm space-y-6">

        {/* ── Logo / Title area ── */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-900 mb-2">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Portfolio Admin
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to manage your portfolio
          </p>
        </div>

        {/* ── Login Card ── */}
        <Card>
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                    autoFocus
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !email || !password}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>

            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          This is a private page. Only you have access.
        </p>

      </div>
    </div>
  );
}