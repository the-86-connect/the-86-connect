"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Loader2,
  Send,
  CheckCircle2,
  Upload,
  X,
  GraduationCap,
  KeyRound,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import {
  STUDY_APPLICATION_SCHEMA,
  PROGRAM_LEVELS,
  type StudyApplicationData,
} from "@/lib/validation";
import {
  submitStudyApplication,
  uploadFiles,
  refreshCsrfToken,
  type UploadedAttachment,
} from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSection, Field, Select, RadioGroup } from "./form-helpers";
import { cn } from "@/lib/utils";
import { useFormAutosave } from "@/hooks/use-form-autosave";
import { checkCanSubmit, recordSubmission } from "@/lib/submit-throttle";
import { CooldownMessage } from "./cooldown-message";

const SCHOLARSHIP_OPTIONS = ["Yes", "No", "Not sure"] as const;

interface PendingFile {
  id: string;
  file: File;
  attachment: UploadedAttachment | null;
  uploading: boolean;
  error: string | null;
}

export function StudyApplicationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [setPasswordToken, setSetPasswordToken] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [files, setFiles] = useState<PendingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formLoadedAt, setFormLoadedAt] = useState(0);

  const hasUploadingFiles = files.some((f) => f.uploading);
  const successfulAttachments = files
    .map((f) => f.attachment)
    .filter(Boolean) as UploadedAttachment[];

  useEffect(() => {
    const id = setTimeout(() => {
      setFormLoadedAt(Date.now());
    }, 0);
    return () => clearTimeout(id);
  }, []);

  // Fetch CSRF token on mount so file uploads work
  useEffect(() => {
    refreshCsrfToken();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<StudyApplicationData>({
    resolver: zodResolver(STUDY_APPLICATION_SCHEMA),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "",
      targetUniversity: "",
      programLevel: undefined,
      fieldOfStudy: "",
      startYear: "",
      scholarshipInterest: undefined,
      budgetRange: "",
      englishProficiency: "",
      message: "",
    },
  });

  const { clearDraft } =
    useFormAutosave<StudyApplicationData>({
      formKey: "study-application",
      getValues,
      reset,
      watch,
    });

  const scholarshipInterest = useWatch({ control, name: "scholarshipInterest" });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? []).slice(
      0,
      15 - files.length,
    );
    if (newFiles.length === 0) return;

    const pending: PendingFile[] = newFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      attachment: null,
      uploading: true,
      error: null,
    }));

    setFiles((prev) => [...prev, ...pending].slice(0, 15));
    if (fileInputRef.current) fileInputRef.current.value = "";

    try {
      const attachments = await uploadFiles(pending.map((p) => p.file));
      setFiles((prev) =>
        prev.map((f) => {
          const idx = pending.findIndex((p) => p.id === f.id);
          if (idx === -1) return f;
          return {
            ...f,
            attachment: attachments[idx] ?? null,
            uploading: false,
          };
        }),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setFiles((prev) =>
        prev.map((f) =>
          pending.some((p) => p.id === f.id)
            ? { ...f, uploading: false, error: message }
            : f,
        ),
      );
      toast.error("File upload failed", { description: message });
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const onSubmit = async (data: StudyApplicationData) => {
    // Client-side rate limit check
    const check = checkCanSubmit("study-application");
    if (!check.allowed) {
      setCooldownSeconds(check.waitSeconds);
      toast.error("Rate limit reached", {
        description: `Please wait ${check.waitSeconds} seconds before submitting again.`,
      });
      return;
    }

    try {
      if (hasUploadingFiles) {
        toast.error("Please wait for file uploads to complete");
        return;
      }

      const response = await submitStudyApplication(
        {
          ...data,
          website_url: honeypot,
          formLoadedAt,
        },
        successfulAttachments,
      );
      recordSubmission("study-application");
      setSubmitted(true);
      setFiles([]);
      setIsNewUser(Boolean(response.newUser));
      setSetPasswordToken(response.setPasswordToken ?? null);
      toast.success("Application submitted successfully!", {
        description: response.newUser
          ? "We've created an account for you. Set a password to track your application."
          : "Our team will review and contact you within 2-3 business days.",
      });
      reset();
      clearDraft();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Submission failed. Please try again later.";
      toast.error("Submission failed", { description: message });
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-5">
          <CheckCircle2 className="h-10 w-10 text-white" strokeWidth={2.5} />
        </div>
        <h3 className="font-display font-black text-2xl sm:text-3xl mb-2">
          Application Received!
        </h3>
        <p className="text-muted-foreground max-w-sm mb-6 leading-relaxed">
          Thank you for applying. Our education team will review your
          application and contact you within 2-3 business days.
        </p>

        {isNewUser && setPasswordToken ? (
          <div className="w-full max-w-sm space-y-3">
            <Link
              href={`/set-password?token=${encodeURIComponent(setPasswordToken)}`}
              className="w-full inline-flex items-center justify-center gap-2 h-14 bg-primary text-white rounded-2xl font-black text-base hover:bg-red-700 transition-all cursor-pointer press"
            >
              <KeyRound className="h-5 w-5" />
              Set Your Password
            </Link>
            <p className="text-xs text-muted-foreground">
              Set a password now to track your application anytime in your
              account.
            </p>
          </div>
        ) : (
          <div className="w-full max-w-sm space-y-3">
            <Link
              href="/account"
              className="w-full inline-flex items-center justify-center gap-2 h-14 bg-primary text-white rounded-2xl font-black text-base hover:bg-red-700 transition-all cursor-pointer press"
            >
              <UserCircle className="h-5 w-5" />
              View in Your Account
            </Link>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setIsNewUser(false);
            setSetPasswordToken(null);
            reset();
            clearDraft();
          }}
          className="mt-4 inline-flex items-center gap-2 px-5 h-12 bg-white text-foreground rounded-xl font-bold border border-border hover:border-primary/30 transition-all cursor-pointer press"
        >
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Honeypot field — hidden from humans, bots fill it */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "auto",
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        <label htmlFor="website_url">Website (leave blank)</label>
        <input
          type="text"
          id="website_url"
          name="website_url"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {/* Section: Basic Contact */}
      <FormSection
        title="Contact Information"
        description="So we can reach you about your application."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First Name" required error={errors.firstName?.message}>
            <Input
              id="firstName"
              autoComplete="given-name"
              placeholder="JOHN"
              style={{ textTransform: "uppercase" }}
              aria-invalid={!!errors.firstName}
              className={cn(errors.firstName && "border-destructive")}
              {...register("firstName")}
            />
          </Field>
          <Field label="Last Name" required error={errors.lastName?.message}>
            <Input
              id="lastName"
              autoComplete="family-name"
              placeholder="SMITH"
              style={{ textTransform: "uppercase" }}
              aria-invalid={!!errors.lastName}
              className={cn(errors.lastName && "border-destructive")}
              {...register("lastName")}
            />
          </Field>
          <Field label="Email Address" required error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="john@example.com"
              aria-invalid={!!errors.email}
              className={cn(errors.email && "border-destructive")}
              {...register("email")}
            />
          </Field>
          <Field label="Phone Number" required error={errors.phone?.message}>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+86 123 4567 8900"
              aria-invalid={!!errors.phone}
              className={cn(errors.phone && "border-destructive")}
              {...register("phone")}
            />
          </Field>
          <Field label="Country" required error={errors.country?.message}>
            <Input
              id="country"
              autoComplete="country-name"
              placeholder="United States"
              aria-invalid={!!errors.country}
              className={cn(errors.country && "border-destructive")}
              {...register("country")}
            />
          </Field>
        </div>
      </FormSection>

      {/* Section: Academic Intent */}
      <FormSection
        title="Academic Intent"
        description="Tell us about your study plans in China."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Target University"
            hint="Optional — leave blank for recommendations"
            error={errors.targetUniversity?.message}
          >
            <Input
              id="targetUniversity"
              placeholder="Tsinghua, Peking University, etc."
              {...register("targetUniversity")}
            />
          </Field>
          <Field
            label="Program Level"
            required
            error={errors.programLevel?.message}
          >
            <Select
              id="programLevel"
              placeholder="Select program level"
              options={PROGRAM_LEVELS as unknown as string[]}
              {...register("programLevel")}
            />
          </Field>
          <Field
            label="Field of Study"
            required
            error={errors.fieldOfStudy?.message}
          >
            <Input
              id="fieldOfStudy"
              placeholder="Computer Science, Business, Medicine..."
              aria-invalid={!!errors.fieldOfStudy}
              className={cn(errors.fieldOfStudy && "border-destructive")}
              {...register("fieldOfStudy")}
            />
          </Field>
          <Field label="Start Year" required error={errors.startYear?.message}>
            <Input
              id="startYear"
              inputMode="numeric"
              placeholder="2026"
              aria-invalid={!!errors.startYear}
              className={cn(errors.startYear && "border-destructive")}
              {...register("startYear")}
            />
          </Field>
        </div>
      </FormSection>

      {/* Section: Funding Info */}
      <FormSection
        title="Funding & Proficiency"
        description="Help us match you with scholarships and suitable programs."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Interested in Scholarship?"
            required
            error={errors.scholarshipInterest?.message}
          >
            <RadioGroup
              name="scholarshipInterest"
              options={SCHOLARSHIP_OPTIONS as unknown as readonly string[]}
              value={scholarshipInterest || ""}
              onChange={(v) => setValue("scholarshipInterest", v as "Yes" | "No" | "Not sure", { shouldValidate: true })}
            />
          </Field>
          <Field
            label="Budget Range (per year)"
            hint="Optional"
            error={errors.budgetRange?.message}
          >
            <Input
              id="budgetRange"
              placeholder="$5,000 - $15,000"
              {...register("budgetRange")}
            />
          </Field>
          <Field
            label="English Proficiency"
            hint="Optional — IELTS, TOEFL, Duolingo score"
            error={errors.englishProficiency?.message}
          >
            <Input
              id="englishProficiency"
              placeholder="IELTS 6.5, TOEFL 90, etc."
              {...register("englishProficiency")}
            />
          </Field>
        </div>
      </FormSection>

      {/* Section: Documents */}
      <FormSection
        title="Documents"
        description={
          <>
            Upload your passport photo, passport ID page, academic transcripts,
            degree certificate, English test score, recommendation letters, or
            any other supporting documents.{" "}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wide">
              All Optional
            </span>
          </>
        }
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg,.heic,.heif,.avif,.tif,.tiff,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-muted/40 transition-all cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Upload className="h-5 w-5 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-foreground">
              Click to upload documents
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              PNG, JPG, JPEG, GIF, WebP, BMP, SVG, HEIC, AVIF, TIFF, PDF, DOC —
              up to 15 files, no size limit
            </p>
          </div>
        </label>

        {files.length > 0 && (
          <ul className="space-y-2 mt-3">
            {files.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/50 border border-border"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {f.attachment?.url &&
                    f.attachment.mimeType.startsWith("image/") ? (
                      <Image
                        src={f.attachment.url}
                        alt={f.file.name}
                        fill
                        className="rounded object-cover"
                        sizes="32px"
                      />
                    ) : (
                      <GraduationCap className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {f.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(f.file.size / 1024).toFixed(0)} KB
                      {f.uploading && " · Uploading..."}
                      {f.error && (
                        <span className="text-destructive ml-1">
                          · {f.error}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(f.id)}
                  className="shrink-0 w-7 h-7 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors"
                  aria-label={`Remove ${f.file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </FormSection>

      {/* Section: Additional Message */}
      <FormSection
        title="Additional Information"
        description="Anything else we should know? (optional)"
      >
        <Field error={errors.message?.message}>
          <Textarea
            id="message"
            rows={4}
            maxLength={1000}
            placeholder="Tell us about your background, goals, or any specific questions..."
            className={cn(
              "resize-none",
              errors.message && "border-destructive",
            )}
            {...register("message")}
          />
        </Field>
      </FormSection>

      {/* Submit */}
      {cooldownSeconds > 0 && (
        <CooldownMessage
          seconds={cooldownSeconds}
          onComplete={() => setCooldownSeconds(0)}
        />
      )}
      <button
        type="submit"
        disabled={isSubmitting || hasUploadingFiles || cooldownSeconds > 0}
        className="w-full inline-flex items-center justify-center gap-2 h-14 bg-primary text-white rounded-2xl font-black text-base hover:bg-red-700 transition-all duration-200 cursor-pointer press disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting || hasUploadingFiles ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>
              {hasUploadingFiles ? "Uploading files..." : "Submitting..."}
            </span>
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            <span>Submit Application</span>
          </>
        )}
      </button>

      <p className="text-xs text-muted-foreground text-center font-semibold">
        By submitting, you agree to our handling of your information. We&apos;ll
        respond within 2-3 business days.
      </p>
    </form>
  );
}


