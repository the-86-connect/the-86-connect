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
  ShoppingCart,
  KeyRound,
  UserCircle,
  Save,
} from "lucide-react";
import Link from "next/link";

import {
  SOURCING_INQUIRY_SCHEMA,
  SHIPPING_TERMS,
  type SourcingInquiryData,
} from "@/lib/validation";
import {
  submitSourcingInquiry,
  uploadFiles,
  type UploadedAttachment,
} from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useFormAutosave } from "@/hooks/use-form-autosave";

interface PendingFile {
  id: string;
  file: File;
  attachment: UploadedAttachment | null;
  uploading: boolean;
  error: string | null;
}

export function SourcingInquiryForm() {
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
  } = useForm<SourcingInquiryData>({
    resolver: zodResolver(SOURCING_INQUIRY_SCHEMA),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      country: "",
      productCategory: "",
      productName: "",
      productDescription: "",
      targetQuantity: "",
      targetPrice: "",
      productLinks: "",
      timeline: "",
      shippingTerms: undefined,
      destinationPort: "",
      message: "",
    },
  });

  const { draftAvailable, lastSaved, clearDraft } =
    useFormAutosave<SourcingInquiryData>({
      formKey: "sourcing-inquiry",
      getValues,
      reset,
      watch,
    });

  const MAX_FILES = 15;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? []).slice(
      0,
      MAX_FILES - files.length,
    );
    if (newFiles.length === 0) return;

    const pending: PendingFile[] = newFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      attachment: null,
      uploading: true,
      error: null,
    }));

    setFiles((prev) => [...prev, ...pending].slice(0, MAX_FILES));
    if (fileInputRef.current) fileInputRef.current.value = "";

    try {
      const attachments = await uploadFiles(pending.map((p) => p.file));
      setFiles((prev) =>
        prev.map((f) => {
          const idx = pending.findIndex((p) => p.id === f.id);
          if (idx === -1) return f;
          return { ...f, attachment: attachments[idx] ?? null, uploading: false };
        }),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Upload failed";
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

  const onSubmit = async (data: SourcingInquiryData) => {
    try {
      if (hasUploadingFiles) {
        toast.error("Please wait for file uploads to complete");
        return;
      }

      const response = await submitSourcingInquiry(
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
      toast.success("Inquiry submitted successfully!", {
        description: response.newUser
          ? "We've created an account for you. Set a password to track your inquiry."
          : "Our sourcing team will review and contact you within 1-2 business days.",
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
          Inquiry Received!
        </h3>
        <p className="text-muted-foreground max-w-sm mb-6 leading-relaxed">
          Thank you for your inquiry. Our sourcing team will review your
          requirements and contact you within 1-2 business days.
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
              Set a password now to track your inquiry anytime in your account.
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
          Submit another inquiry
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
        description="So we can reach you about your sourcing request."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" required error={errors.name?.message}>
            <Input
              id="name"
              autoComplete="name"
              placeholder="John Smith"
              aria-invalid={!!errors.name}
              className={cn(errors.name && "border-destructive")}
              {...register("name")}
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
          <Field
            label="Company"
            hint="Optional"
            error={errors.company?.message}
          >
            <Input
              id="company"
              autoComplete="organization"
              placeholder="Acme Inc."
              {...register("company")}
            />
          </Field>
        </div>
      </FormSection>

      {/* Section: Product Details */}
      <FormSection
        title="Product Details"
        description="Tell us what you want to source from China."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Product Category"
            required
            error={errors.productCategory?.message}
          >
            <Input
              id="productCategory"
              placeholder="Electronics, Apparel, Machinery..."
              aria-invalid={!!errors.productCategory}
              className={cn(errors.productCategory && "border-destructive")}
              {...register("productCategory")}
            />
          </Field>
          <Field
            label="Product Name"
            required
            error={errors.productName?.message}
          >
            <Input
              id="productName"
              placeholder="e.g. Wireless Bluetooth Earbuds, Cotton T-Shirt, LED Strip Light..."
              aria-invalid={!!errors.productName}
              className={cn(errors.productName && "border-destructive")}
              {...register("productName")}
            />
          </Field>
          <Field
            label="Target Quantity"
            required
            error={errors.targetQuantity?.message}
          >
            <Input
              id="targetQuantity"
              placeholder="1,000 units / 1 container"
              aria-invalid={!!errors.targetQuantity}
              className={cn(errors.targetQuantity && "border-destructive")}
              {...register("targetQuantity")}
            />
          </Field>
          <Field
            label="Target Price"
            hint="Optional"
            error={errors.targetPrice?.message}
          >
            <Input
              id="targetPrice"
              placeholder="$5 per unit"
              {...register("targetPrice")}
            />
          </Field>
          <Field
            label="Product Link"
            hint="Optional"
            error={errors.productLinks?.message}
          >
            <Input
              id="productLinks"
              placeholder="https://example.com/product"
              {...register("productLinks")}
            />
          </Field>
        </div>
        <Field
          label="Product Description"
          required
          error={errors.productDescription?.message}
        >
          <Textarea
            id="productDescription"
            rows={4}
            maxLength={1000}
            placeholder="Describe specifications, materials, certifications, packaging..."
            className={cn(
              "resize-none",
              errors.productDescription && "border-destructive",
            )}
            {...register("productDescription")}
          />
        </Field>
      </FormSection>

      {/* Section: Order Specs */}
      <FormSection
        title="Order Specifications"
        description="Logistics and timeline details."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Timeline" required error={errors.timeline?.message}>
            <Input
              id="timeline"
              placeholder="30 days, 3 months, ASAP..."
              aria-invalid={!!errors.timeline}
              className={cn(errors.timeline && "border-destructive")}
              {...register("timeline")}
            />
          </Field>
          <Field
            label="Shipping Terms"
            required
            error={errors.shippingTerms?.message}
          >
            <Select
              id="shippingTerms"
              placeholder="Select shipping term"
              options={SHIPPING_TERMS as unknown as string[]}
              {...register("shippingTerms")}
            />
          </Field>
          <Field
            label="Destination Port"
            hint="Optional"
            error={errors.destinationPort?.message}
          >
            <Input
              id="destinationPort"
              placeholder="Los Angeles, Hamburg, Rotterdam..."
              {...register("destinationPort")}
            />
          </Field>
        </div>
      </FormSection>

      {/* Section: Documents */}
      <FormSection
        title="Documents"
        description="Upload product photos, spec sheets, design files, or reference images."
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
              PNG, JPG, JPEG, GIF, WebP, BMP, SVG, HEIC, AVIF, TIFF, PDF, DOC
              — up to 15 files, no size limit
            </p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider">
              All Optional
            </span>
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
                      <ShoppingCart className="h-4 w-4 text-primary" />
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
            placeholder="Tell us about certifications, packaging, labeling, or any specific requirements..."
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
            <span>Submit Inquiry</span>
          </>
        )}
      </button>

      <p className="text-xs text-muted-foreground text-center font-semibold">
        By submitting, you agree to our handling of your information. We&apos;ll
        respond within 1-2 business days.
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

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}
