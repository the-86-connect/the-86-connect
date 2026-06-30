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
    .email("Invalid email format")
    .toLowerCase(),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number must be at most 30 characters")
    .regex(/^[\d\s+()-]{7,30}$/, "Invalid phone format")
    .optional()
    .or(z.literal("")),
  serviceInterest: z.enum(["Study in China", "Product Sourcing", "General"], {
    errorMap: () => ({ message: "Please select a service" }),
  }),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message must be at most 500 characters"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export const adminLoginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export type AdminLoginData = z.infer<typeof adminLoginSchema>;

/* ============== User Auth Schemas ============== */
export const userLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email")
    .toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const userRegisterSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email")
    .toLowerCase(),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
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
    .max(100),
});

export const userSetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long"),
});

export const userUpdateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .optional(),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

/* ============== Study Application Schema ============== */
export const studyApplicationSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .transform((v) => v.toUpperCase()),
  lastName: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .transform((v) => v.toUpperCase()),
  email: z.string().trim().min(1).email().toLowerCase(),
  phone: z
    .string()
    .trim()
    .min(7)
    .max(30)
    .regex(/^[\d\s+()-]{7,30}$/),
  country: z.string().trim().min(2).max(60),
  targetUniversity: z.string().trim().max(120).optional().or(z.literal("")),
  programLevel: z.enum([
    "Bachelor's",
    "Master's",
    "PhD",
    "Language Program",
    "Short Course",
  ]),
  fieldOfStudy: z.string().trim().min(2).max(100),
  startYear: z.string().regex(/^\d{4}$/),
  scholarshipInterest: z.enum(["Yes", "No", "Not sure"]),
  budgetRange: z.string().trim().max(60).optional().or(z.literal("")),
  englishProficiency: z.string().trim().max(60).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

/* ============== Sourcing Inquiry Schema ============== */
export const sourcingInquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().min(1).email().toLowerCase(),
  phone: z
    .string()
    .trim()
    .min(7)
    .max(30)
    .regex(/^[\d\s+()-]{7,30}$/),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  country: z.string().trim().min(2).max(60),
  productCategory: z.string().trim().min(2).max(100),
  productName: z.string().trim().min(2).max(150),
  productDescription: z.string().trim().min(10).max(1000),
  targetQuantity: z.string().trim().min(1).max(60),
  targetPrice: z.string().trim().max(60).optional().or(z.literal("")),
  productLinks: z.string().trim().max(500).optional().or(z.literal("")),
  timeline: z.string().trim().min(2).max(60),
  shippingTerms: z.enum(["FOB", "CIF", "EXW", "DDP", "Not sure"]),
  destinationPort: z.string().trim().max(100).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

/* ============== Admin User Management Schemas ============== */
export const adminUserCreateSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email")
    .toLowerCase(),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[\d\s+()-]{7,30}$/, "Invalid phone format")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
});

export const adminUserUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .optional(),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[\d\s+()-]{7,30}$/, "Invalid phone format")
    .optional()
    .or(z.literal("")),
});

export const adminResetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
});

/* ============== File Attachment Schemas ============== */
export const attachmentSchema = z.object({
  url: z.string().url("Invalid attachment URL"),
  originalName: z.string().min(1, "Original name is required"),
  fileName: z.string().min(1, "File name is required"),
  mimeType: z.string().min(1, "MIME type is required"),
  size: z.number().int().min(0, "File size must be positive"),
  storageProvider: z.enum(["cloudinary", "r2"]),
});

export const attachmentsSchema = z
  .array(attachmentSchema)
  .max(5, "Maximum 5 attachments allowed")
  .optional();

/* ============== Consultation Booking Schema ============== */
export const consultationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  service: z.enum(["study", "sourcing", "general"]).default("general"),
  meetingType: z.enum(["online", "phone"]).default("online"),
  availabilitySlotId: z.string().min(1, "Please select an available time slot"),
  timezone: z.string().default("UTC"),
  message: z
    .string()
    .max(1000, "Message must be less than 1000 characters")
    .optional()
    .default(""),
});

export type ConsultationData = z.infer<typeof consultationSchema>;

/* ============== Availability Slot Schemas ============== */
const TIME_REGEX = /^\d{2}:\d{2}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const availabilitySlotCreateSchema = z
  .object({
    date: z.string().regex(DATE_REGEX, "Invalid date format (use YYYY-MM-DD)"),
    startTime: z.string().regex(TIME_REGEX, "Invalid time format (use HH:MM)"),
    endTime: z.string().regex(TIME_REGEX, "Invalid time format (use HH:MM)"),
  })
  .refine((d) => d.startTime < d.endTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export const availabilityBulkCreateSchema = z
  .object({
    dateFrom: z.string().regex(DATE_REGEX, "Invalid date format"),
    dateTo: z.string().regex(DATE_REGEX, "Invalid date format"),
    timeFrom: z.string().regex(TIME_REGEX, "Invalid time format"),
    timeTo: z.string().regex(TIME_REGEX, "Invalid time format"),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  })
  .refine((d) => d.dateFrom <= d.dateTo, {
    message: "End date must be on or after start date",
    path: ["dateTo"],
  })
  .refine((d) => d.timeFrom < d.timeTo, {
    message: "End time must be after start time",
    path: ["timeTo"],
  });

export const availabilityUpdateSchema = z.object({
  status: z.enum(["available", "blocked"]).optional(),
});

export const availabilityBulkDeleteSchema = z.object({
  ids: z.array(z.string()).optional(),
  dateFrom: z.string().regex(DATE_REGEX).optional(),
  dateTo: z.string().regex(DATE_REGEX).optional(),
});
