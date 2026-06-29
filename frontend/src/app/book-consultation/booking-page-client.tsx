"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Loader2,
  CalendarCheck,
  CheckCircle2,
  GraduationCap,
  ShoppingCart,
  MessageSquare,
  Video,
  Phone,
  Calendar,
  Clock,
  ArrowLeft,
  ChevronDown,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import {
  CONSULTATION_SCHEMA,
  CONSULTATION_TIME_SLOTS,
  type ConsultationFormData,
} from "@/lib/validation";
import { submitConsultation } from "@/lib/api";
import { useUserAuth } from "@/context/user-auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const SERVICE_OPTIONS = [
  {
    value: "study" as const,
    label: "Study in China",
    description: "University admissions & scholarships",
    icon: GraduationCap,
  },
  {
    value: "sourcing" as const,
    label: "Product Sourcing",
    description: "Supplier sourcing & manufacturing",
    icon: ShoppingCart,
  },
  {
    value: "general" as const,
    label: "General Inquiry",
    description: "Anything else we can help with",
    icon: MessageSquare,
  },
];

const MEETING_OPTIONS = [
  {
    value: "online" as const,
    label: "Online Meeting",
    description: "Zoom / Google Meet",
    icon: Video,
  },
  {
    value: "phone" as const,
    label: "Phone Call",
    description: "We'll call you",
    icon: Phone,
  },
];

function getTomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function getMaxDateISO(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d.toISOString().split("T")[0];
}

export function BookingPageClient() {
  const [submitted, setSubmitted] = useState(false);
  const { user, isAuthenticated, isLoading: authLoading } = useUserAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(CONSULTATION_SCHEMA),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      service: "general",
      meetingType: "online",
      preferredDate: "",
      preferredTime: "",
      message: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.name) setValue("name", user.name);
      if (user.email) setValue("email", user.email);
      if (user.phone) setValue("phone", user.phone);
    }
  }, [isAuthenticated, user, setValue]);

  const selectedService = watch("service");
  const selectedMeeting = watch("meetingType");
  const selectedDate = watch("preferredDate");
  const selectedTime = watch("preferredTime");
  const messageValue = watch("message") ?? "";

  const onSubmit = async (data: ConsultationFormData) => {
    try {
      await submitConsultation(data);
      setSubmitted(true);
      toast.success("Consultation booked!", {
        description: "We'll contact you within 24 hours to confirm.",
      });
      reset();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Booking failed. Please try again later.";
      toast.error("Booking failed", { description: message });
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-glow-xl animate-ring-pulse">
            <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={2.5} />
          </div>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl mb-3">
          Booking Received!
        </h1>
        <p className="text-muted-foreground max-w-md mb-6 leading-relaxed">
          Thank you for booking a consultation with 86 Connect. Our team will
          review your request and contact you within 24 hours to confirm the
          details and meeting link.
        </p>

        <a
          href="https://wa.me/8617611533296?text=Hi%2086%20Connect%21%20I%20just%20booked%20a%20consultation%20and%20have%20a%20quick%20question."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] text-white font-black text-sm hover:bg-[#20BD5A] transition-colors mb-8"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
          Chat with us on WhatsApp
        </a>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => setSubmitted(false)}
          >
            Book another consultation
          </Button>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 mb-4">
          <CalendarCheck className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-black uppercase tracking-wider text-primary">
            Free Consultation
          </span>
        </div>
        <h1 className="font-display font-black text-4xl sm:text-5xl tracking-[-0.04em] mb-4 leading-[1.05]">
          Book a <span className="text-primary">Consultation</span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Schedule a free 30-minute call with our experts. Get personalized
          guidance on studying in China or sourcing products — no commitment
          required.
        </p>
      </div>

      {/* Logged-in banner */}
      {isAuthenticated && user && !authLoading && (
        <div className="mb-6 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-sm font-semibold">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
            <UserCheck className="h-3.5 w-3.5 text-emerald-700" />
          </div>
          <span>Welcome back, {user.name}! Your details are pre-filled.</span>
          <Link href="/account" className="ml-auto text-xs font-bold text-emerald-700 hover:text-emerald-900 underline">
            My Bookings
          </Link>
        </div>
      )}

      {/* Form card */}
      <div className="bg-white rounded-3xl border border-border shadow-soft-sm p-6 sm:p-8 lg:p-10 card-shine">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 sm:space-y-6"
          noValidate
        >
          {/* Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-primary">*</span>
              </Label>
              <Input
                id="name"
                autoComplete="name"
                placeholder="John Smith"
                aria-invalid={!!errors.name}
                className={cn(errors.name && "border-destructive")}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs font-bold text-destructive">
                  {errors.name.message}
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
                placeholder="john@example.com"
                aria-invalid={!!errors.email}
                className={cn(errors.email && "border-destructive")}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs font-bold text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number{" "}
              <span className="text-muted-foreground font-normal">
                (recommended for phone meetings)
              </span>
            </Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+86 123 4567 8900"
              aria-invalid={!!errors.phone}
              className={cn(errors.phone && "border-destructive")}
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-xs font-bold text-destructive">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Service Interest */}
          <div className="space-y-2">
            <span className="text-sm font-bold leading-none">
              Service Interest <span className="text-primary">*</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SERVICE_OPTIONS.map((option) => {
                const isSelected = selectedService === option.value;
                const Icon = option.icon;
                return (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() =>
                      setValue("service", option.value, {
                        shouldValidate: true,
                      })
                    }
                    className={cn(
                      "group relative text-left p-3.5 rounded-2xl border-2 transition-all duration-300 cursor-pointer press overflow-hidden min-h-[88px]",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-glow-sm"
                        : "border-border bg-card hover:border-primary/40 hover:shadow-3d-sm",
                    )}
                  >
                    <div className="relative flex items-start gap-3">
                      <div
                        className={cn(
                          "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300",
                          isSelected
                            ? "bg-gradient-to-br from-primary to-red-700 shadow-glow"
                            : "bg-primary/10",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 transition-colors",
                            isSelected ? "text-white" : "text-primary",
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-foreground">
                          {option.label}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Meeting Type */}
          <div className="space-y-2">
            <span className="text-sm font-bold leading-none">
              Meeting Type <span className="text-primary">*</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MEETING_OPTIONS.map((option) => {
                const isSelected = selectedMeeting === option.value;
                const Icon = option.icon;
                return (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() =>
                      setValue("meetingType", option.value, {
                        shouldValidate: true,
                      })
                    }
                    className={cn(
                      "group relative text-left p-3.5 rounded-2xl border-2 transition-all duration-300 cursor-pointer press overflow-hidden",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-glow-sm"
                        : "border-border bg-card hover:border-primary/40 hover:shadow-3d-sm",
                    )}
                  >
                    <div className="relative flex items-center gap-3">
                      <div
                        className={cn(
                          "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300",
                          isSelected
                            ? "bg-gradient-to-br from-primary to-red-700 shadow-glow"
                            : "bg-primary/10",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 transition-colors",
                            isSelected ? "text-white" : "text-primary",
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-foreground">
                          {option.label}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Date */}
            <div className="space-y-2">
              <Label>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Preferred Date <span className="text-primary">*</span>
                </span>
              </Label>
              <div className="relative group">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60 group-focus-within:text-primary pointer-events-none transition-colors z-10" />
                <input
                  id="preferredDate"
                  type="date"
                  min={getTomorrowISO()}
                  max={getMaxDateISO()}
                  aria-invalid={!!errors.preferredDate}
                  className={cn(
                    "w-full h-12 rounded-xl border-2 border-border bg-white pl-10 pr-4 text-sm font-semibold text-foreground transition-all cursor-pointer",
                    "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 focus:shadow-glow-sm",
                    "placeholder:text-muted-foreground",
                    "[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:transition-opacity [&::-webkit-calendar-picker-indicator]:p-0 [&::-webkit-calendar-picker-indicator]:ml-auto",
                    errors.preferredDate && "border-destructive focus:border-destructive focus:ring-destructive/10",
                  )}
                  {...register("preferredDate")}
                />
              </div>
              {errors.preferredDate && (
                <p className="text-xs font-bold text-destructive">
                  {errors.preferredDate.message}
                </p>
              )}
            </div>

            {/* Time */}
            <div className="space-y-2">
              <Label>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Preferred Time <span className="text-primary">*</span>
                </span>
              </Label>
              <div className="relative group">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60 group-focus-within:text-primary pointer-events-none transition-colors z-10" />
                <select
                  id="preferredTime"
                  aria-invalid={!!errors.preferredTime}
                  className={cn(
                    "w-full h-12 rounded-xl border-2 border-border bg-white pl-10 pr-10 text-sm font-semibold text-foreground transition-all cursor-pointer appearance-none",
                    "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 focus:shadow-glow-sm",
                    errors.preferredTime && "border-destructive focus:border-destructive focus:ring-destructive/10",
                  )}
                  {...register("preferredTime")}
                  value={selectedTime}
                >
                  <option value="" className="text-muted-foreground">Select a time</option>
                  {CONSULTATION_TIME_SLOTS.map((slot) => {
                    const hour = parseInt(slot);
                    const ampm = hour < 12 ? "AM" : "PM";
                    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                    return (
                      <option key={slot} value={slot}>
                        {displayHour}:00 {ampm}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary pointer-events-none transition-colors" />
              </div>
              {errors.preferredTime && (
                <p className="text-xs font-bold text-destructive">
                  {errors.preferredTime.message}
                </p>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">
              Message{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="message"
              rows={4}
              maxLength={1000}
              placeholder="Anything specific you'd like to discuss? (optional)"
              aria-invalid={!!errors.message}
              className={cn("resize-none", errors.message && "border-destructive")}
              {...register("message")}
            />
            <div className="flex items-center justify-end">
              <p className="text-xs text-muted-foreground font-semibold">
                {messageValue.length} / 1000
              </p>
            </div>
          </div>

          {/* Summary hint */}
          {(selectedDate || selectedTime) && (
            <div className="px-4 py-3 rounded-xl bg-primary/5 border border-primary/15 text-sm">
              <p className="font-bold text-foreground">Booking summary:</p>
              <p className="text-muted-foreground mt-1">
                {selectedService === "study"
                  ? "Study in China"
                  : selectedService === "sourcing"
                    ? "Product Sourcing"
                    : "General consultation"}
                {" · "}
                {selectedMeeting === "online" ? "Online meeting" : "Phone call"}
                {selectedDate &&
                  ` · ${new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}`}
                {selectedTime &&
                  ` · ${(() => {
                    const h = parseInt(selectedTime);
                    const a = h < 12 ? "AM" : "PM";
                    const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
                    return `${dh}:00 ${a}`;
                  })()}`}
              </p>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            variant="default"
            size="lg"
            className="relative w-full overflow-hidden lift-sm press"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Booking...</span>
              </>
            ) : (
              <>
                <CalendarCheck className="h-5 w-5" />
                <span>Book Free Consultation</span>
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center font-semibold">
            Free 30-minute session · No commitment · We respond within 24 hours
          </p>
        </form>
      </div>

      {/* Trust signals */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: Clock,
            title: "30-Minute Session",
            description: "Enough time to cover your key questions",
          },
          {
            icon: CheckCircle2,
            title: "Expert Advisors",
            description: "Talk to specialists in your area of interest",
          },
          {
            icon: ArrowLeft,
            title: "No Commitment",
            description: "Free consultation, no obligation to proceed",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-white rounded-2xl border border-border p-4 text-center"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2.5">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm font-bold text-foreground mb-1">
                {item.title}
              </div>
              <div className="text-xs text-muted-foreground leading-tight">
                {item.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
