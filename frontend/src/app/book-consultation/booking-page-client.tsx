"use client";
 
import { useState, useEffect, useMemo } from "react";
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
  ArrowLeft,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import {
  CONSULTATION_SCHEMA,
  type ConsultationFormData,
} from "@/lib/validation";
import {
  submitConsultation,
  fetchAvailableSlots,
  type AvailabilitySlot,
} from "@/lib/api";
import { useUserAuth } from "@/context/user-auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookingDatePicker } from "@/components/ui/booking-date-picker";
import { BookingTimeSlots } from "@/components/ui/booking-time-slots";
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

/**
 * Convert a time string stored in China Standard Time (UTC+8) to the user's
 * local timezone. Returns a Date object representing the local time.
 *
 * @param dateStr - ISO date prefix, e.g. "2026-07-02"
 * @param timeStr - China time "HH:MM", e.g. "12:00"
 */
function chinaTimeToLocal(dateStr: string, timeStr: string): Date {
  // Interpret the given date+time as China Standard Time (UTC+8)
  return new Date(`${dateStr}T${timeStr}:00+08:00`);
}

/**
 * Format a Date as a short local time string, e.g. "4:00 AM"
 */
function formatLocalTime(d: Date): string {
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format a China time "HH:MM" as a 12-hour string, e.g. "12:00 PM"
 */
function formatChinaTime(timeStr: string): string {
  const hour = parseInt(timeStr.split(":")[0], 10);
  const ampm = hour < 12 ? "AM" : "PM";
  const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${h12}:00 ${ampm}`;
}

export function BookingPageClient() {
  const [submitted, setSubmitted] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
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
      availabilitySlotId: "",
      message: "",
    },
  });

  const loadSlots = async () => {
    setSlotsLoading(true);
    setSlotsError("");
    try {
      const from = getTomorrowISO();
      const to = getMaxDateISO();
      const slots = await fetchAvailableSlots(from, to);
      setAvailableSlots(slots);
    } catch (err) {
      setSlotsError(
        err instanceof Error
          ? err.message
          : "Failed to load available time slots.",
      );
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.name) setValue("name", user.name);
      if (user.email) setValue("email", user.email);
      if (user.phone) setValue("phone", user.phone);
    }
  }, [isAuthenticated, user, setValue]);

  const selectedService = watch("service");
  const selectedMeeting = watch("meetingType"); // kept for form default, not shown in UI
  const selectedSlotId = watch("availabilitySlotId");
  const messageValue = watch("message") ?? "";

  // Unique sorted list of dates that have at least one available slot
  const availableDates = useMemo(() => {
    const set = new Set<string>();
    availableSlots.forEach((s) => set.add(s.date.split("T")[0]));
    return Array.from(set).sort();
  }, [availableSlots]);

  // Slots available for the selected date (match by date part only)
  const timesForDate = useMemo(() => {
    if (!selectedDate) return [];
    return availableSlots.filter((s) => s.date.split("T")[0] === selectedDate);
  }, [availableSlots, selectedDate]);

  // The currently selected slot object (for the booking summary)
  const selectedSlot = useMemo(
    () => availableSlots.find((s) => s.id === selectedSlotId) ?? null,
    [availableSlots, selectedSlotId],
  );

  const onSubmit = async (data: ConsultationFormData) => {
    try {
      await submitConsultation(data);
      setSubmitted(true);
      toast.success("Consultation booked!", {
        description: "We'll contact you within 24 hours to confirm.",
      });
      reset();
      // Refresh slots since the booked one is no longer available
      loadSlots();
      setSelectedDate("");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Booking failed. Please try again later.";
      toast.error("Booking failed", { description: message });
      // If the slot was just booked by someone else, refresh the list
      if (/just booked|already/i.test(message)) {
        loadSlots();
        setValue("availabilitySlotId", "");
        setSelectedDate("");
      }
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
          Booking Submitted!
        </h1>
        <p className="text-muted-foreground max-w-md mb-6 leading-relaxed">
          Your consultation request has been submitted successfully. Please
          check your WhatsApp, account, or email — we&apos;ll contact you soon
          to confirm.
        </p>

        <a
          href="https://wa.me/8617611533296?text=Hi%2086%20Connect%21%20I%20just%20booked%20a%20consultation%20and%20have%20a%20quick%20question."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] text-white font-black text-sm hover:bg-[#20BD5A] transition-colors mb-8"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
          Chat with us on WhatsApp
        </a>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={() => setSubmitted(false)}>
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
          <Link
            href="/account"
            className="ml-auto text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
          >
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

          {/* Date + Time */}
          {slotsLoading ? (
            <div className="space-y-5">
              <div>
                <Label className="mb-2 block">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Available Dates <span className="text-primary">*</span>
                  </span>
                </Label>
                <div className="h-64 rounded-2xl border-2 border-border bg-white flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-sm font-semibold text-muted-foreground">
                      Loading available dates…
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : slotsError || availableSlots.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center">
              <Calendar className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-bold text-foreground mb-1">
                {slotsError
                  ? "Couldn't load available times"
                  : "No available time slots right now"}
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                {slotsError
                  ? slotsError
                  : "Please check back soon — our team is setting up the calendar."}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadSlots}
                className="gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Date picker — horizontal scrollable */}
              <BookingDatePicker
                availableDates={availableDates}
                selectedDate={selectedDate}
                onDateSelect={(d) => {
                  setSelectedDate(d);
                  setValue("availabilitySlotId", "", { shouldValidate: false });
                }}
              />

              {/* Time slot buttons — shown when a date is selected */}
              {selectedDate && (
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-foreground">
                    Available times{" "}
                    <span className="text-muted-foreground text-xs font-semibold ml-1">
                      (China time zone)
                    </span>
                  </h3>
                  <BookingTimeSlots
                    slots={timesForDate}
                    selectedSlotId={selectedSlotId}
                    onSlotSelect={(id) =>
                      setValue("availabilitySlotId", id, { shouldValidate: true })
                    }
                    timeFormatter={(slot) => {
                      const datePart = slot.date.split("T")[0];
                      const localDate = chinaTimeToLocal(datePart, slot.startTime);
                      return {
                        primary: formatLocalTime(localDate),
                        secondary: `${formatChinaTime(slot.startTime)} CST`,
                      };
                    }}
                  />
                  {errors.availabilitySlotId && (
                    <p className="text-xs font-bold text-destructive mt-1">
                      {errors.availabilitySlotId.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">
              Message{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="message"
              rows={4}
              maxLength={1000}
              placeholder="Anything specific you'd like to discuss? (optional)"
              aria-invalid={!!errors.message}
              className={cn(
                "resize-none",
                errors.message && "border-destructive",
              )}
              {...register("message")}
            />
            <div className="flex items-center justify-end">
              <p className="text-xs text-muted-foreground font-semibold">
                {messageValue.length} / 1000
              </p>
            </div>
          </div>

          {/* Summary hint */}
          {(selectedDate || selectedSlot) && (
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
                {(selectedSlot?.date ?? selectedDate) &&
                  (() => {
                    const raw = selectedSlot?.date ?? selectedDate;
                    const datePart = raw.split("T")[0];
                    return ` · ${new Date(datePart + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}`;
                  })()}
                {selectedSlot &&
                  ` · ${(() => {
                    const datePart = selectedSlot.date.split("T")[0];
                    const localDate = chinaTimeToLocal(datePart, selectedSlot.startTime);
                    return formatLocalTime(localDate);
                  })()}`}
                {selectedSlot &&
                  ` · CST ${(() => {
                    const h = parseInt(selectedSlot.startTime.split(":")[0], 10);
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
            icon: Video,
            title: "15–30 Min Session",
            description: "Zoom · VooV · Tencent · Google Meet",
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
