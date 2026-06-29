"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, ArrowLeft, KeyRound } from "lucide-react";
import { useUserAuth } from "@/context/user-auth-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SetPasswordContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setPassword: setPass } = useUserAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-muted px-4 py-12">
        <div className="w-full max-w-md">
          <div className="p-8 rounded-2xl border-2 border-border border-b-[6px] border-b-primary/30 bg-card text-center">
            <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="h-7 w-7 text-destructive" />
            </div>
            <h1 className="font-display font-black text-2xl mb-2">
              Invalid Link
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              This set-password link is missing a token. Please use the link
              from your form submission confirmation.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-primary text-white rounded-xl font-black hover:bg-red-700 transition-all cursor-pointer press"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const success = await setPass(token, password);
    if (success) {
      router.push("/account");
    } else {
      setError(
        "This link is invalid or has expired. Please submit your form again or contact support.",
      );
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-muted px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to website
        </Link>

        <div className="p-8 rounded-2xl border-2 border-border border-b-[6px] border-b-primary/30 bg-card">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2.5 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-red-sm">
                <span className="text-white font-black text-lg">86</span>
              </div>
              <span className="font-display font-black text-2xl tracking-tight">
                Connect
              </span>
            </div>
            <h1 className="font-display font-black text-2xl tracking-tight">
              Set Your Password
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create a password to access your account and track your
              submission.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 h-12"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-9 h-12"
                  required
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="text-sm font-bold text-destructive bg-destructive/5 px-3 py-2 rounded-md"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              className="w-full inline-flex items-center justify-center gap-2 h-12 bg-primary text-white rounded-xl font-black hover:bg-red-700 transition-all duration-200 cursor-pointer press disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Setting password...</span>
                </>
              ) : (
                <span>Set Password & Continue</span>
              )}
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            This link expires in 1 hour for security.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SetPasswordContent />
    </Suspense>
  );
}
