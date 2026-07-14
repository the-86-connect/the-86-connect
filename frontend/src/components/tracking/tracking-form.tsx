"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import {
  Loader2,
  Search,
  CheckCircle2,
  Clock,
  Circle,
  AlertCircle,
  ArrowRight,
  GraduationCap,
  ShoppingCart,
  ChevronRight,
  Inbox,
  Ship,
  Car,
  MapPin,
  Calendar,
  Hash,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TimelineSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  trackSubmission,
  getUserProfile,
  type TrackingStage,
  type UserSubmission,
  type CarShipmentDetails,
} from "@/lib/api";
import { useUserAuth } from "@/context/user-auth-context";

const TRACKING_SCHEMA = z.object({
  referenceId: z
    .string()
    .trim()
    .min(4, "Please enter a valid reference ID")
    .max(40, "Reference ID is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase(),
});

type TrackingData = z.infer<typeof TRACKING_SCHEMA>;

export type TrackingStageConfig = {
  label: string;
  description: string;
};

export type TrackingConfig = {
  /** Input placeholder for reference ID */
  referencePlaceholder: string;
  /** Reference ID prefix shown as a hint, e.g. "SIC-" */
  referenceHint?: string;
  /** Stages for the timeline (used as fallback; backend returns its own) */
  stages: TrackingStageConfig[];
  /** Support email shown when tracking fails */
  supportEmail: string;
  /** Label for what is being tracked, e.g. "application" or "quote" */
  noun: string;
  /** Filter submissions list by type: "study" | "sourcing" | "car_shipping" */
  submissionType: "study" | "sourcing" | "car_shipping";
};

type TrackingResult = {
  referenceId: string;
  currentStage: number;
  submittedDate: string;
  lastUpdated: string;
  statusLabel: string;
  timeline: TrackingStage[];
  customerName: string;
  carShipment: CarShipmentDetails | null;
};

interface TrackingFormProps {
  config: TrackingConfig;
}

export function TrackingForm({ config }: TrackingFormProps) {
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isResultLoading, setIsResultLoading] = useState(false);
  const [userSubmissions, setUserSubmissions] = useState<UserSubmission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const searchParams = useSearchParams();
  const autoSubmittedRef = useRef(false);
  const { isAuthenticated, isLoading: authLoading, user } = useUserAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TrackingData>({
    resolver: zodResolver(TRACKING_SCHEMA),
    defaultValues: { referenceId: "", email: "" },
  });

  const onSubmit = useCallback(async (data: TrackingData) => {
    setNotFound(false);
    setResult(null);
    setApiError(null);
    setIsResultLoading(true);

    try {
      const json = await trackSubmission(data.referenceId, data.email);
      const currentIdx = json.timeline.findIndex((s) => s.status === "current");
      const currentStage = currentIdx >= 0 ? currentIdx : 0;
      const currentLabel =
        currentIdx >= 0 ? json.timeline[currentIdx].label : "In Progress";

      setResult({
        referenceId: json.submission.referenceId,
        currentStage,
        submittedDate: new Date(json.submission.createdAt).toLocaleDateString(
          "en-US",
          { year: "numeric", month: "short", day: "numeric" },
        ),
        lastUpdated: (() => {
          // Find the latest updatedAt from completed/current stages
          const timestamps = json.timeline
            .filter(
              (s) =>
                s.updatedAt && (s.status === "done" || s.status === "current"),
            )
            .map((s) => new Date(s.updatedAt!));
          if (timestamps.length === 0) {
            return new Date(json.submission.createdAt).toLocaleDateString(
              "en-US",
              { year: "numeric", month: "short", day: "numeric" },
            );
          }
          const latest = new Date(
            Math.max(...timestamps.map((t) => t.getTime())),
          );
          return latest.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        })(),
        statusLabel:
          currentStage === json.timeline.length - 1
            ? "Completed"
            : currentLabel,
        timeline: json.timeline,
        customerName: json.submission.name,
        carShipment: json.submission.carShipment || null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lookup failed";
      if (
        message.toLowerCase().includes("not found") ||
        message.toLowerCase().includes("no submission")
      ) {
        setNotFound(true);
      } else {
        setApiError(message);
      }
    } finally {
      setIsResultLoading(false);
    }
  }, []);

  // Prefill form and auto-submit when ref and email are in URL query params
  useEffect(() => {
    const ref = searchParams.get("ref");
    const email = searchParams.get("email");

    if (ref) {
      setValue("referenceId", ref);
    }
    if (email) {
      setValue("email", decodeURIComponent(email));
    }

    if (ref && email && !autoSubmittedRef.current) {
      const decodedEmail = decodeURIComponent(email);
      const parsed = TRACKING_SCHEMA.safeParse({
        referenceId: ref,
        email: decodedEmail,
      });
      if (parsed.success) {
        autoSubmittedRef.current = true;
        const timer = setTimeout(() => onSubmit(parsed.data), 0);
        return () => clearTimeout(timer);
      }
    }
  }, [searchParams, setValue, onSubmit]);

  // Fetch user submissions when authenticated and no URL params
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    const ref = searchParams.get("ref");
    const email = searchParams.get("email");
    // Skip fetching if URL params are present (auto-track will handle it)
    if (ref && email) return;
    // Skip for car shipping (admin-created, not user-submitted)
    if (config.submissionType === "car_shipping") return;

    const fetchSubmissions = async () => {
      setIsLoadingSubmissions(true);
      try {
        const data = await getUserProfile();
        const filtered = data.user.submissions.filter(
          (s) => s.submissionType === config.submissionType,
        );
        setUserSubmissions(filtered);
      } catch {
        setUserSubmissions([]);
      } finally {
        setIsLoadingSubmissions(false);
      }
    };
    fetchSubmissions();
  }, [isAuthenticated, authLoading, config.submissionType, searchParams]);

  const handleTrackSubmission = useCallback(
    async (ref: string, email: string) => {
      setShowManualForm(false);
      setValue("referenceId", ref);
      setValue("email", email);
      // Trigger form submit
      await onSubmit({ referenceId: ref, email });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const reset = () => {
    setResult(null);
    setNotFound(false);
    setApiError(null);
    setShowManualForm(false);
  };

  if (result) {
    return (
      <div className="space-y-6">
        {/* Status header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-primary/5 border border-primary/15">
          {isResultLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="h-6 w-32 bg-muted rounded" />
              <div className="h-3 w-28 bg-muted rounded" />
            </div>
          ) : (
            <>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-primary mb-1">
                  {config.noun.charAt(0).toUpperCase() + config.noun.slice(1)}{" "}
                  Status
                </p>
                <p className="font-display font-black text-lg text-foreground">
                  {result.statusLabel}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Reference: {result.referenceId}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-muted-foreground font-bold">
                  Last updated
                </p>
                <p className="text-sm font-black text-foreground">
                  {result.lastUpdated}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Car shipment details */}
        {result.carShipment && (
          <div className="bg-white rounded-2xl border border-border shadow-soft-sm p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Car className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-black text-base text-foreground">
                Shipment Details
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailRow
                icon={Car}
                label="Vehicle"
                value={`${result.carShipment.carModel}${result.carShipment.carYear ? ` (${result.carShipment.carYear})` : ""}`}
              />
              {result.carShipment.vinNumber && (
                <DetailRow
                  icon={Hash}
                  label="VIN Number"
                  value={result.carShipment.vinNumber}
                />
              )}
              {result.carShipment.originPort && (
                <DetailRow
                  icon={MapPin}
                  label="Port of Loading"
                  value={result.carShipment.originPort}
                />
              )}
              {result.carShipment.destinationPort && (
                <DetailRow
                  icon={MapPin}
                  label="Port of Discharge"
                  value={result.carShipment.destinationPort}
                />
              )}
              {result.carShipment.vesselName && (
                <DetailRow
                  icon={Ship}
                  label="Vessel Name"
                  value={result.carShipment.vesselName}
                />
              )}
              {result.carShipment.containerNumber && (
                <DetailRow
                  icon={Hash}
                  label="Container No."
                  value={result.carShipment.containerNumber}
                />
              )}
              {result.carShipment.estimatedDeparture && (
                <DetailRow
                  icon={Calendar}
                  label="Est. Departure"
                  value={new Date(result.carShipment.estimatedDeparture).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                />
              )}
              {result.carShipment.estimatedArrival && (
                <DetailRow
                  icon={Calendar}
                  label="Est. Arrival"
                  value={new Date(result.carShipment.estimatedArrival).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                />
              )}
            </div>
            {result.carShipment.notes && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs font-bold text-muted-foreground mb-1">
                  Notes
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {result.carShipment.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Timeline — uses backend-provided stages */}
        <div className="relative pl-2">
          {isResultLoading ? (
            <TimelineSkeleton stages={4} />
          ) : (
            result.timeline.map((stage, idx) => {
              const isDone = stage.status === "done";
              const isCurrent = stage.status === "current";
              const isPending = stage.status === "pending";

              return (
                <div
                  key={stage.key}
                  className="relative flex gap-4 pb-6 last:pb-0"
                >
                  {/* Vertical line */}
                  {idx < result.timeline.length - 1 && (
                    <div
                      className={cn(
                        "absolute left-[15px] top-8 bottom-0 w-0.5",
                        isDone ? "bg-primary" : "bg-border",
                      )}
                    />
                  )}
                  {/* Icon */}
                  <div
                    className={cn(
                      "relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      isDone && "bg-primary",
                      isCurrent && "bg-primary ring-4 ring-primary/15",
                      isPending && "bg-muted border-2 border-border",
                    )}
                  >
                    {isDone && <CheckCircle2 className="h-5 w-5 text-white" />}
                    {isCurrent && <Clock className="h-4 w-4 text-white" />}
                    {isPending && (
                      <Circle className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pt-1">
                    <p
                      className={cn(
                        "font-black text-sm",
                        isPending ? "text-muted-foreground" : "text-foreground",
                      )}
                    >
                      {stage.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {stage.description}
                    </p>
                    {stage.updatedAt && (isDone || isCurrent) && (
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5 font-medium">
                        {new Date(stage.updatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
                        <Clock className="h-3 w-3" /> Current Step
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-5 h-12 bg-white text-foreground rounded-xl font-bold border border-border hover:border-primary/30 transition-all cursor-pointer press"
          >
            Track another {config.noun}
          </button>
        </div>

        <p className="text-xs text-muted-foreground bg-muted/40 rounded-xl p-3 border border-border">
          <AlertCircle className="h-3.5 w-3.5 inline mr-1.5 text-primary" />
          Need help? Email us at{" "}
          <a
            href={`mailto:${config.supportEmail}`}
            className="text-primary font-bold hover:underline"
          >
            {config.supportEmail}
          </a>{" "}
          with your reference ID.
        </p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="font-display font-black text-xl mb-2">
          {config.noun.charAt(0).toUpperCase() + config.noun.slice(1)} not found
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-5">
          We couldn&apos;t find a record with that reference ID and email.
          Please check your details and try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 h-12 bg-primary text-white rounded-xl font-bold hover:bg-red-700 transition-all cursor-pointer press"
        >
          Try again
        </button>
      </div>
    );
  }

  // --- Submissions list for logged-in users ---
  const hasUrlParams = !!(searchParams.get("ref") && searchParams.get("email"));

  if (!authLoading && isAuthenticated && !showManualForm && !hasUrlParams && config.submissionType !== "car_shipping") {
    const isStudy = config.submissionType === "study";
    const serviceLabel = isStudy ? "applications" : "inquiries";

    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-primary mb-1">
              Your {isStudy ? "Applications" : "Inquiries"}
            </p>
            <p className="font-display font-black text-lg text-foreground">
              Select to track
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowManualForm(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer press"
          >
            <Search className="h-3.5 w-3.5" />
            Track manually
          </button>
        </div>

        {isLoadingSubmissions ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : userSubmissions.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl bg-muted/30 border border-border">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Inbox className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">
              No {isStudy ? "applications" : "inquiries"} yet
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              You don&apos;t have any {serviceLabel} to track.
            </p>
            <button
              type="button"
              onClick={() => setShowManualForm(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              <Search className="h-3.5 w-3.5" />
              Track using reference ID
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {userSubmissions.map((sub) => {
              const ref = sub.referenceCode ?? sub.id.slice(-8).toUpperCase();
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => handleTrackSubmission(ref, user?.email ?? "")}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-border hover:border-primary/30 hover:shadow-soft-sm transition-all cursor-pointer press text-left"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      isStudy ? "bg-blue-50" : "bg-amber-50",
                    )}
                  >
                    {isStudy ? (
                      <GraduationCap className="h-4 w-4 text-blue-600" />
                    ) : (
                      <ShoppingCart className="h-4 w-4 text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {sub.serviceInterest}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Ref: {ref} &middot;{" "}
                      {new Date(sub.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {isAuthenticated && showManualForm && (
        <button
          type="button"
          onClick={() => setShowManualForm(false)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer press"
        >
          <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          Back to my submissions
        </button>
      )}
      <div className="space-y-2">
        <Label htmlFor="referenceId">
          Reference ID <span className="text-primary">*</span>
        </Label>
        <Input
          id="referenceId"
          placeholder={config.referencePlaceholder}
          aria-invalid={!!errors.referenceId}
          className={cn("h-12", errors.referenceId && "border-destructive")}
          {...register("referenceId")}
        />
        {config.referenceHint && !errors.referenceId && (
          <p className="text-xs text-muted-foreground">
            Find it in your confirmation email.{" "}
            {config.referenceHint && (
              <span className="font-bold">e.g. {config.referenceHint}</span>
            )}
          </p>
        )}
        {errors.referenceId && (
          <p role="alert" className="text-xs font-bold text-destructive">
            {errors.referenceId.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email Address <span className="text-primary">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          className={cn("h-12", errors.email && "border-destructive")}
          {...register("email")}
        />
        {errors.email && (
          <p role="alert" className="text-xs font-bold text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      {apiError && (
        <p
          role="alert"
          className="text-sm font-bold text-destructive bg-destructive/5 px-3 py-2 rounded-md"
        >
          {apiError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2 h-14 bg-primary text-white rounded-2xl font-black text-base hover:bg-red-700 transition-all duration-200 cursor-pointer press disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Looking up...</span>
          </>
        ) : (
          <>
            <Search className="h-5 w-5" />
            <span>Track {config.noun}</span>
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </button>

      <p className="text-xs text-muted-foreground text-center font-semibold">
        Enter the reference ID from your confirmation email to check the latest
        status.
      </p>
    </form>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
          {label}
        </p>
        <p className="text-sm font-black text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}
