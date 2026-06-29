"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { useUserAuth } from "@/context/user-auth-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUserAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const success = await login(email, password);
    if (success) {
      router.push("/account");
    } else {
      setError("Invalid email or password. Please try again.");
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
              Welcome Back
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Log in to track your applications and inquiries
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              disabled={isLoading || !email || !password}
              className="w-full inline-flex items-center justify-center gap-2 h-12 bg-primary text-white rounded-xl font-black hover:bg-red-700 transition-all duration-200 cursor-pointer press disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-sm text-foreground font-bold mb-1">
              Don&apos;t have an account?
            </p>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 h-10 px-5 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black text-sm rounded-xl shadow-md hover:shadow-lg active:translate-y-[1px] active:shadow-sm transition-all cursor-pointer press"
              >
                Create your account →
              </Link>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Or submit a{" "}
              <Link
                href="/study-in-china#apply"
                className="text-primary font-bold hover:underline"
              >
                Study application
              </Link>{" "}
              or{" "}
              <Link
                href="/product-sourcing#inquire"
                className="text-primary font-bold hover:underline"
              >
                Sourcing inquiry
              </Link>{" "}
              and we&apos;ll create one for you automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
