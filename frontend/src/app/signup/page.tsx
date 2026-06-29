"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Mail,
  User,
  Lock,
  Phone,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useUserAuth } from "@/context/user-auth-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address"),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[\d\s+()-]{0,30}$/, "Invalid phone format")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long"),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { register } = useUserAuth();
  const [formData, setFormData] = useState<SignupForm>({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignupForm, string>>
  >({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function validateField(field: keyof SignupForm, value: string) {
    const fieldSchema = signupSchema.shape[field];
    const result = fieldSchema.safeParse(value);
    if (result.success) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [field]: result.error.issues[0].message,
      }));
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignupForm, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SignupForm;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const ok = await register(
        formData.email,
        formData.name,
        formData.password,
        formData.phone || undefined,
      );
      if (ok) {
        router.push("/account");
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
              Create Your Account
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Start tracking your applications and sourcing inquiries
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  onBlur={() => validateField("name", formData.name)}
                  className={cn(
                    "pl-9 h-12",
                    errors.name && "border-destructive",
                  )}
                  placeholder="e.g. John Doe"
                  autoComplete="name"
                  disabled={isLoading}
                />
              </div>
              {errors.name && (
                <p className="text-xs font-medium text-destructive">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  onBlur={() => validateField("email", formData.email)}
                  className={cn(
                    "pl-9 h-12",
                    errors.email && "border-destructive",
                  )}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-medium text-destructive">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  onBlur={() => validateField("phone", formData.phone ?? "")}
                  className={cn(
                    "pl-9 h-12",
                    errors.phone && "border-destructive",
                  )}
                  placeholder="+86 123 456 7890"
                  autoComplete="tel"
                  disabled={isLoading}
                />
              </div>
              {errors.phone && (
                <p className="text-xs font-medium text-destructive">
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  maxLength={100}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  onBlur={() => validateField("password", formData.password)}
                  className={cn(
                    "pl-9 pr-12 h-12",
                    errors.password && "border-destructive",
                  )}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-destructive">
                  {errors.password}
                </p>
              )}
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
              disabled={
                isLoading ||
                !formData.name ||
                !formData.email ||
                !formData.password
              }
              className="w-full inline-flex items-center justify-center gap-2 h-12 bg-primary text-white rounded-xl font-black hover:bg-red-700 transition-all duration-200 cursor-pointer press disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-sm text-foreground font-bold mb-1">
              Already have an account?
            </p>
            <Link
              href="/login"
              className="text-primary font-bold hover:underline text-sm"
            >
              Log in here →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
