"use client";

import { Label } from "@/components/ui/label";
import type React from "react";

/* ============== Shared Form Helpers ==============
   Extracted from study-application-form.tsx and sourcing-inquiry-form.tsx
   to eliminate duplication. */

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display font-black text-lg text-foreground">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export function Field({
  label,
  hint,
  required,
  error,
  children,
}: {
  label?: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      {label && (
        <Label>
          {label} {required && <span className="text-primary">*</span>}
          {hint && (
            <span className="text-muted-foreground font-normal text-xs ml-1">
              ({hint})
            </span>
          )}
        </Label>
      )}
      {children}
      {error && (
        <p role="alert" className="text-xs font-bold text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function Select({
  id,
  placeholder,
  options,
  ...props
}: {
  id: string;
  placeholder: string;
  options: readonly string[];
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      id={id}
      className="flex h-12 w-full rounded-xl border-2 border-border bg-card px-4 py-2 text-base font-medium text-foreground transition-all duration-200 focus-visible:outline-none focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <label
          key={opt}
          className="inline-flex items-center gap-2 px-4 h-12 rounded-xl border-2 border-border bg-card cursor-pointer hover:border-primary/40 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5"
        >
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-sm font-bold text-foreground">{opt}</span>
        </label>
      ))}
    </div>
  );
}