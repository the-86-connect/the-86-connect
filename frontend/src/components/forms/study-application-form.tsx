"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
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
  Save,
} from "lucide-react";
import Link from "next/link";

import {
  STUDY_APPLICATION_SCHEMA,
  PROGRAM_LEVELS,
  type StudyApplicationData,
} from "@/lib/validation";
import {
  submitStudyApplication,
  uploadFile,
  type UploadedAttachment,
} from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useFormAutosave } from "@/hooks/use-form-autosave";

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
  const [setPasswordToken, setSetPasswordToken] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [files, setFiles] = useState<PendingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formLoadedAtRef = useRef<number>(Date.now());

  const hasUploadingFiles = files.some((f) => f.uploading);
  const successfulAttachments = files
    .map((f) => f.attachment)
    .filter(Boolean) as UploadedAttachment[];

  useEffect(() => {
    formLoadedAtRef.current = Date.now();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
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

  const { draftAvailable, lastSaved, clearDraft } =
    useFormAutosave<StudyApplicationData>({
      formKey: "study-application",
      getValues,
      reset,
      watch,
    });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? []).slice(
      0,
      5 - files.length,
    );
    if (newFiles.length === 0) return;

    const pending: PendingFile[] = newFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      attachment: null,
      uploading: true,
      error: null,
    }));

    setFiles((prev) => [...prev, ...pending].slice(0, 5));
    if (fileInputRef.current) fileInputRef.current.value = "";

    for (const pendingFile of pending) {
      try {
        const attachment = await uploadFile(pendingFile.file);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === pendingFile.id
              ? { ...f, attachment, uploading: false }
              : f,
          ),
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Upload failed";
        setFiles((prev) =>
          prev.map((f) =>
            f.id === pendingFile.id
              ? { ...f, uploading: false, error: message }
              : f,
          ),
        );
        toast.error("File upload failed", { description: message });
      }
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const onSubmit = async (data: StudyApplicationData) => {
    try {
      if (hasUploadingFiles) {
        toast.error("Please wait for file uploads to complete");
        return;
      }

      const response = await submitStudyApplication(
        {
          ...data,
          website_url: honeypot,
          formLoadedAt: formLoadedAtRef.current,
        },
        successfulAttachments,
      );
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
              options={SCHOLARSHIP_OPTIONS as unknown as string[]}
              register={register}
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
        description="Upload transcripts, passport, or recommendation letters (optional)."
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
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
              PDF, JPG, PNG, DOC up to 5 files
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
                      <img
                        src={f.attachment.url}
                        alt={f.file.name}
                        className="h-8 w-8 rounded object-cover"
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

      {/* Draft indicator */}
      {draftAvailable && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold">
            <Save className="h-3.5 w-3.5" />
            <span>
              Draft saved{lastSaved ? ` · ${timeAgo(lastSaved)}` : ""}
            </span>
          </div>
          <button
            type="button"
            onClick={clearDraft}
            className="text-xs font-bold text-emerald-700/70 hover:text-emerald-800 transition-colors"
          >
            Discard
          </button>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || hasUploadingFiles}
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

/* ============== Helper Components ============== */
function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
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

function Field({
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

function Select({
  id,
  placeholder,
  options,
  ...props
}: {
  id: string;
  placeholder: string;
  options: string[];
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

function RadioGroup({
  name,
  options,
  register,
}: {
  name: keyof StudyApplicationData;
  options: string[];
  register: ReturnType<typeof useForm<StudyApplicationData>>["register"];
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
            value={opt}
            {...register(name)}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-sm font-bold text-foreground">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}
