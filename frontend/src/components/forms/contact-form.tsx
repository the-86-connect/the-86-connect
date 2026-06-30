"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Loader2,
  Send,
  CheckCircle2,
  GraduationCap,
  ShoppingCart,
  Save,
  MessageCircle,
} from "lucide-react";

import {
  contactFormSchema,
  type ContactFormData,
  SERVICE_OPTIONS,
} from "@/lib/validation";
import { submitContactForm } from "@/lib/api";
import { useContact, type ServiceType } from "@/context/contact-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useFormAutosave } from "@/hooks/use-form-autosave";

const SERVICE_ICONS: Record<ServiceType, typeof GraduationCap> = {
  "Study in China": GraduationCap,
  "Product Sourcing": ShoppingCart,
  General: MessageCircle,
};

export function ContactForm() {
  const { selectedService, setSelectedService } = useContact();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      serviceInterest: selectedService ?? undefined,
      message: "",
    },
  });

  const { draftAvailable, lastSaved, clearDraft } =
    useFormAutosave<ContactFormData>({
      formKey: "contact",
      getValues,
      reset,
      watch,
    });

  useEffect(() => {
    if (selectedService && SERVICE_OPTIONS.includes(selectedService)) {
      setValue("serviceInterest", selectedService, { shouldValidate: true });
    }
  }, [selectedService, setValue]);

  const currentService = watch("serviceInterest");

  const onSubmit = async (data: ContactFormData) => {
    try {
      await submitContactForm(data);
      setSubmitted(true);
      toast.success("Message sent successfully!", {
        description: "We will get back to you within 1-2 business days.",
      });
      reset();
      setSelectedService(null);
      clearDraft();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Submission failed. Please try again later.";
      toast.error("Submission failed", {
        description: message,
      });
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="relative mb-5">
          <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-glow-xl animate-ring-pulse">
            <CheckCircle2 className="h-10 w-10 text-white" strokeWidth={2.5} />
          </div>
        </div>
        <h3 className="font-display font-black text-2xl sm:text-3xl mb-2">
          Thank you!
        </h3>
        <p className="text-muted-foreground max-w-sm mb-6 leading-relaxed">
          Your message has been received. Our team will review your inquiry and
          contact you shortly.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setSubmitted(false);
            reset();
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 sm:space-y-5"
      noValidate
    >
      {/* Name + Email row */}
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
            aria-required="true"
            aria-describedby={errors.name ? "name-error" : undefined}
            className={cn(errors.name && "border-destructive")}
            {...register("name")}
          />
          {errors.name && (
            <p
              id="name-error"
              role="alert"
              className="text-xs font-bold text-destructive"
            >
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
            aria-required="true"
            aria-describedby={errors.email ? "email-error" : undefined}
            className={cn(errors.email && "border-destructive")}
            {...register("email")}
          />
          {errors.email && (
            <p
              id="email-error"
              role="alert"
              className="text-xs font-bold text-destructive"
            >
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      {/* Phone (optional) */}
      <div className="space-y-2">
        <Label htmlFor="phone">
          Phone Number{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+86 123 4567 8900"
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? "phone-error" : undefined}
          className={cn(errors.phone && "border-destructive")}
          {...register("phone")}
        />
        {errors.phone && (
          <p
            id="phone-error"
            role="alert"
            className="text-xs font-bold text-destructive"
          >
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* Service Interest (Radio Group) */}
      <div className="space-y-2">
        <span id="service-label" className="text-sm font-bold leading-none">
          Service Interest <span className="text-primary">*</span>
        </span>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          role="radiogroup"
          aria-labelledby="service-label"
        >
          {SERVICE_OPTIONS.map((service) => {
            const isSelected = currentService === service;
            const Icon = SERVICE_ICONS[service];
            return (
              <button
                type="button"
                key={service}
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                onClick={() =>
                  setValue("serviceInterest", service, {
                    shouldValidate: true,
                  })
                }
                className={cn(
                  "group relative text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer press overflow-hidden min-h-[56px]",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-glow-sm"
                    : "border-border bg-card hover:border-primary/40 hover:shadow-3d-sm",
                )}
              >
                {isSelected && (
                  <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                )}
                <div className="relative flex items-center gap-3">
                  <div
                    className={cn(
                      "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                      isSelected
                        ? "bg-gradient-to-br from-primary to-red-700 shadow-glow"
                        : "bg-primary/10",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        isSelected ? "text-white" : "text-primary",
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-foreground">
                      {service}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30",
                    )}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {errors.serviceInterest && (
          <p
            id="service-error"
            role="alert"
            className="text-xs font-bold text-destructive"
          >
            {errors.serviceInterest.message}
          </p>
        )}
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message">
          Message <span className="text-primary">*</span>
        </Label>
        <Textarea
          id="message"
          rows={5}
          maxLength={500}
          placeholder="Tell us about your needs — what program, what products, timeline, etc."
          aria-invalid={!!errors.message}
          aria-required="true"
          aria-describedby={errors.message ? "message-error" : "message-count"}
          className={cn("resize-none", errors.message && "border-destructive")}
          {...register("message")}
        />
        <div className="flex items-center justify-between">
          {errors.message ? (
            <p
              id="message-error"
              role="alert"
              className="text-xs font-bold text-destructive"
            >
              {errors.message.message}
            </p>
          ) : (
            <span />
          )}
          <p
            id="message-count"
            className="text-xs text-muted-foreground font-semibold"
          >
            {watch("message")?.length || 0} / 500
          </p>
        </div>
      </div>

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
      <Button
        type="submit"
        variant="default"
        size="lg"
        className="relative w-full overflow-hidden lift-sm press"
        disabled={isSubmitting}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin relative" />
            <span className="relative">Sending...</span>
          </>
        ) : (
          <>
            <Send className="h-5 w-5 relative" />
            <span className="relative">Send Message</span>
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center font-semibold">
        By submitting, you agree to our handling of your information. We&apos;ll
        respond within 24 hours.
      </p>
    </form>
  );
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}
