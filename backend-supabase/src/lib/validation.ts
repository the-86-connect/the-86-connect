import { z } from "zod";

// ─── Contact Form ────────────────────────────────────────────
export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  serviceInterest: z.string().min(1, "Please select a service"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// ─── Study Application ───────────────────────────────────────
export const studyApplicationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  targetUniversity: z.string().optional(),
  programLevel: z.enum(["Bachelor", "Master", "PhD", "Language", "Other"]),
  fieldOfStudy: z.string().min(1, "Field of study is required"),
  startYear: z.string().min(1, "Start year is required"),
  scholarshipInterest: z.enum(["Yes", "No", "Not sure"]),
  budgetRange: z.string().optional(),
  englishProficiency: z.string().optional(),
  message: z.string().optional(),
});

// ─── Sourcing Inquiry ────────────────────────────────────────
export const sourcingInquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  productCategory: z.string().min(1, "Product category is required"),
  productName: z.string().min(2, "Product name must be at least 2 characters").max(150),
  productDescription: z.string().min(10, "Description must be at least 10 characters"),
  targetQuantity: z.string().min(1, "Target quantity is required"),
  targetPrice: z.string().optional(),
  productLinks: z.string().optional(),
  timeline: z.string().min(1, "Timeline is required"),
  shippingTerms: z.enum(["FOB", "CIF", "EXW", "DDP", "Not sure"]),
  destinationPort: z.string().optional(),
  message: z.string().optional(),
});

// ─── Consultation ────────────────────────────────────────────
export const consultationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  service: z.string().min(1, "Please select a service"),
  meetingType: z.enum(["online", "phone"]),
  message: z.string().optional(),
  timezone: z.string().optional(),
  availabilitySlotId: z.string().min(1, "Please select a time slot"),
});

// ─── Attachments ─────────────────────────────────────────────
export const attachmentSchema = z.object({
  url: z.string().url().max(2048),
  originalName: z.string().max(255),
  fileName: z.string().max(500),
  mimeType: z.string().max(100),
  size: z.number(),
  storageProvider: z.enum(["supabase"]),
});

export const attachmentsSchema = z.array(attachmentSchema).optional().default([]);

// ─── User Auth ───────────────────────────────────────────────
export const userLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const userRegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
});

export const userSetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const userUpdateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
});

export const userChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const userForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const userResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// ─── Admin ───────────────────────────────────────────────────
export const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const adminRegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2),
  password: z.string().min(8),
  role: z.enum(["admin", "superadmin"]).optional(),
});

export const adminUserCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
  role: z.enum(["admin", "superadmin"]).optional(),
});

export const adminUserUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(["admin", "superadmin"]).optional(),
});

export const adminResetPasswordSchema = z.object({
  password: z.string().min(8),
});

// ─── Availability ────────────────────────────────────────────
export const availabilitySlotCreateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export const availabilityBulkCreateSchema = z.object({
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeFrom: z.string().regex(/^\d{2}:\d{2}$/),
  timeTo: z.string().regex(/^\d{2}:\d{2}$/),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
});

export const availabilityUpdateSchema = z.object({
  status: z.enum(["available", "blocked"]),
});

export const availabilityBulkDeleteSchema = z.object({
  ids: z.array(z.string()).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});