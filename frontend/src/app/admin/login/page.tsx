"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await login(password);
      if (success) {
        router.push("/admin");
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-muted px-4">
      <div className="w-full max-w-md">
        {/* Back to site */}
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to website
        </button>

        <div className="p-8 rounded-xl border border-border bg-card shadow-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-7 w-7 text-accent" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Login</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your password to access the dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="text-sm font-medium text-destructive bg-destructive/5 px-3 py-2 rounded-md"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="accent"
              className="w-full"
              disabled={isLoading || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          {process.env.NODE_ENV === "development" && (
            <p className="text-xs text-muted-foreground text-center mt-6">
              Demo password: <code className="font-mono">admin123</code>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}