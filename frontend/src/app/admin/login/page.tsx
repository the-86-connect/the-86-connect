"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_LOGIN_ATTEMPTS = 3;
const LOGIN_COOLDOWN_MS = 15 * 60 * 1000;
const STORAGE_KEY = "admin_login_attempts";

function checkLoginThrottle(): { blocked: boolean; remainingSeconds: number } {
  try {
    const data = JSON.parse(
      sessionStorage.getItem(STORAGE_KEY) || '{"count":0,"blockUntil":0}',
    );
    if (Date.now() < data.blockUntil) {
      return {
        blocked: true,
        remainingSeconds: Math.ceil((data.blockUntil - Date.now()) / 1000),
      };
    }
    return { blocked: false, remainingSeconds: 0 };
  } catch {
    return { blocked: false, remainingSeconds: 0 };
  }
}

function recordLoginAttempt(success: boolean) {
  if (success) {
    sessionStorage.removeItem(STORAGE_KEY);
    return;
  }
  try {
    const data = JSON.parse(
      sessionStorage.getItem(STORAGE_KEY) || '{"count":0,"blockUntil":0}',
    );
    data.count++;
    if (data.count >= MAX_LOGIN_ATTEMPTS) {
      data.blockUntil = Date.now() + LOGIN_COOLDOWN_MS;
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage unavailable — silently ignore
  }
}

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [blockedSeconds, setBlockedSeconds] = useState(0);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const throttle = checkLoginThrottle();
    if (throttle.blocked) {
      setBlockedSeconds(throttle.remainingSeconds);
      setError(
        `Too many admin login attempts. Please try again in ${throttle.remainingSeconds} second(s).`,
      );
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const success = await login(password);
      if (success) {
        recordLoginAttempt(true);
        router.push("/admin");
      } else {
        recordLoginAttempt(false);
        setError("Invalid password. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Countdown timer for blocked state
  if (blockedSeconds > 0) {
    setTimeout(() => {
      setBlockedSeconds((s) => {
        if (s <= 1) {
          setError("");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

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
              Enter the admin password to continue
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
              disabled={isLoading || !password || blockedSeconds > 0}
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