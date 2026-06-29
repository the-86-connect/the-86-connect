"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_URL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    : "";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-muted px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <div className="p-8 rounded-2xl border-2 border-border border-b-[6px] border-b-primary/30 bg-card">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
              <h1 className="font-display font-black text-2xl tracking-tight mb-2">
                Check Your Email
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                If an account exists for <strong>{email}</strong>, you&apos;ll
                receive a password reset link shortly. The link expires in 1
                hour.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-primary text-white rounded-xl font-black hover:bg-red-700 transition-all cursor-pointer press"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
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
                  Forgot Password?
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 h-12"
                      required
                      autoFocus
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
                  disabled={isLoading || !email}
                  className="w-full inline-flex items-center justify-center gap-2 h-12 bg-primary text-white rounded-xl font-black hover:bg-red-700 transition-all duration-200 cursor-pointer press disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
