import { z } from "zod";

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase(),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number must be at most 30 characters")
    .regex(/^[\d\s+()-]{7,30}$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  serviceInterest: z.enum(["Study in China", "Product Sourcing"], {
    message: "Please select a service",
  }),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message must be at most 500 characters"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export const SERVICE_OPTIONS = [
  "Study in China",
  "Product Sourcing",
] as const;

/* ============== Study Application Form ============== */
export const PROGRAM_LEVELS = [
  "Bachelor's",
  "Master's",
  "PhD",
  "Language Program",
  "Short Course",
] as const;

export const STUDY_APPLICATION_SCHEMA = z.object({
  // Basic contact
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(50, "First name must be at most 50 characters")
    .transform((v) => v.toUpperCase()),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name must be at most 50 characters")
    .transform((v) => v.toUpperCase()),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase(),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(30, "Phone number must be at most 30 characters")
    .regex(/^[\d\s+()-]{7,30}$/, "Please enter a valid phone number"),
  country: z
    .string()
    .trim()
    .min(2, "Country is required")
    .max(60, "Country must be at most 60 characters"),

  // Academic intent
  targetUniversity: z
    .string()
    .trim()
    .max(120, "University name must be at most 120 characters")
    .optional()
    .or(z.literal("")),
  programLevel: z.enum(PROGRAM_LEVELS, {
    message: "Please select a program level",
  }),
  fieldOfStudy: z
    .string()
    .trim()
    .min(2, "Field of study is required")
    .max(100, "Field of study must be at most 100 characters"),
  startYear: z
    .string()
    .regex(/^\d{4}$/, "Please enter a valid year (e.g. 2026)")
    .refine(
      (y) => Number(y) >= new Date().getFullYear(),
      "Start year must be this year or later",
    ),

  // Funding info
  scholarshipInterest: z.enum(["Yes", "No", "Not sure"], {
    message: "Please select an option",
  }),
  budgetRange: z
    .string()
    .trim()
    .max(60, "Budget must be at most 60 characters")
    .optional()
    .or(z.literal("")),
  englishProficiency: z
    .string()
    .trim()
    .max(60, "Proficiency must be at most 60 characters")
    .optional()
    .or(z.literal("")),

  // Optional message
  message: z
    .string()
    .trim()
    .max(1000, "Message must be at most 1000 characters")
    .optional()
    .or(z.literal("")),
});

export type StudyApplicationData = z.infer<typeof STUDY_APPLICATION_SCHEMA>;

/* ============== Sourcing Inquiry Form ============== */
export const SHIPPING_TERMS = ["FOB", "CIF", "EXW", "DDP", "Not sure"] as const;

export const SOURCING_INQUIRY_SCHEMA = z.object({
  // Basic contact
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase(),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(30, "Phone number must be at most 30 characters")
    .regex(/^[\d\s+()-]{7,30}$/, "Please enter a valid phone number"),
  company: z
    .string()
    .trim()
    .max(120, "Company name must be at most 120 characters")
    .optional()
    .or(z.literal("")),
  country: z
    .string()
    .trim()
    .min(2, "Country is required")
    .max(60, "Country must be at most 60 characters"),

  // Product details
  productCategory: z
    .string()
    .trim()
    .min(2, "Product category is required")
    .max(100, "Category must be at most 100 characters"),
  productDescription: z
    .string()
    .trim()
    .min(10, "Please describe your product (at least 10 characters)")
    .max(1000, "Description must be at most 1000 characters"),
  targetQuantity: z
    .string()
    .trim()
    .min(1, "Quantity is required")
    .max(60, "Quantity must be at most 60 characters"),
  targetPrice: z
    .string()
    .trim()
    .max(60, "Price must be at most 60 characters")
    .optional()
    .or(z.literal("")),
  productLinks: z
    .string()
    .trim()
    .max(500, "Links must be at most 500 characters")
    .optional()
    .or(z.literal("")),

  // Order specs
  timeline: z
    .string()
    .trim()
    .min(2, "Timeline is required")
    .max(60, "Timeline must be at most 60 characters"),
  shippingTerms: z.enum(SHIPPING_TERMS, {
    message: "Please select a shipping term",
  }),
  destinationPort: z
    .string()
    .trim()
    .max(100, "Destination must be at most 100 characters")
    .optional()
    .or(z.literal("")),

  // Optional message
  message: z
    .string()
    .trim()
    .max(1000, "Message must be at most 1000 characters")
    .optional()
    .or(z.literal("")),
});

export type SourcingInquiryData = z.infer<typeof SOURCING_INQUIRY_SCHEMA>;

/* ============== Consultation Booking Form ============== */
export const CONSULTATION_SERVICES = [
  "study",
  "sourcing",
  "general",
] as const;

export const CONSULTATION_MEETING_TYPES = ["online", "phone"] as const;

export const CONSULTATION_SCHEMA = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase(),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number must be at most 30 characters")
    .regex(/^[\d\s+()-]{7,30}$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  service: z.enum(CONSULTATION_SERVICES, {
    message: "Please select a service",
  }),
  meetingType: z.enum(CONSULTATION_MEETING_TYPES, {
    message: "Please select a meeting type",
  }),
  preferredDate: z
    .string()
    .trim()
    .min(1, "Please select a preferred date"),
  preferredTime: z
    .string()
    .trim()
    .min(1, "Please select a preferred time"),
  message: z
    .string()
    .trim()
    .max(1000, "Message must be at most 1000 characters")
    .optional()
    .or(z.literal("")),
});

export type ConsultationFormData = z.infer<typeof CONSULTATION_SCHEMA>;

export const CONSULTATION_TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
] as const;
