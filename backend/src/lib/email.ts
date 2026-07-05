/**
 * Email notification utility for 86 Connect.
 *
 * Uses Resend (https://resend.com) when RESEND_API_KEY is configured.
 * Falls back to console logging in development when no key is set.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || ""; // Admin notification target
const FROM_EMAIL = process.env.FROM_EMAIL || "beijingbridgepath@gmail.com";

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
}

async function sendViaResend(payload: EmailPayload): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `86 Connect <${FROM_EMAIL}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        reply_to: NOTIFY_EMAIL || FROM_EMAIL,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Resend error:", res.status, body);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Resend fetch error:", (err as Error).message);
    return false;
  }
}

function logEmail(payload: EmailPayload) {
  console.log(
    `[EMAIL] To: ${Array.isArray(payload.to) ? payload.to.join(", ") : payload.to} | Subject: ${payload.subject}`,
  );
}

async function send(payload: EmailPayload): Promise<boolean> {
  if (RESEND_API_KEY) {
    return sendViaResend(payload);
  }
  // Development fallback — just log
  logEmail(payload);
  return true;
}

// ─── Notification functions ─────────────────────────────────────────

/** Notify the admin when a new submission arrives */
export async function notifyAdminNewSubmission(data: {
  name: string;
  email: string;
  service: string;
  referenceCode: string | null;
  submissionId: string;
}) {
  if (!NOTIFY_EMAIL) return; // Skip if no admin email configured

  const ref = data.referenceCode ?? data.submissionId.slice(-8).toUpperCase();
  return send({
    to: NOTIFY_EMAIL,
    subject: `New ${data.service} submission — ${ref}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;">
        <h2 style="color:#dc2626;margin:0 0 16px;">New Submission Received</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;width:140px;">Reference</td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${ref}</td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Name</td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${data.name}</td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Email</td><td style="padding:6px 12px;border:1px solid #e2e8f0;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Service</td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${data.service}</td></tr>
        </table>
        <p style="margin-top:20px;font-size:13px;color:#64748b;">
          <a href="https://the86connects.com/admin#submissions" style="color:#dc2626;">View in admin panel</a>
        </p>
      </div>
    `,
  });
}

/** Notify the user when their submission status changes */
export async function notifyUserStatusChange(data: {
  to: string;
  name: string;
  service: string;
  newStatus: string;
  referenceCode: string | null;
  submissionId: string;
}) {
  const ref = data.referenceCode ?? data.submissionId.slice(-8).toUpperCase();
  const statusLabel = data.newStatus
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return send({
    to: data.to,
    subject: `Update on your ${data.service} application — ${ref}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;">
        <h2 style="color:#dc2626;margin:0 0 16px;">Application Status Update</h2>
        <p style="font-size:15px;">Hi ${data.name},</p>
        <p style="font-size:15px;">Your <strong>${data.service}</strong> application has been updated:</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;width:140px;">Reference</td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${ref}</td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">New Status</td><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;color:#dc2626;">${statusLabel}</td></tr>
        </table>
        <p style="margin-top:20px;font-size:13px;color:#64748b;">
          <a href="https://the86connects.com/study-in-china/track-application" style="color:#dc2626;">Track your application</a>
        </p>
        <p style="font-size:13px;color:#94a3b8;margin-top:24px;">— 86 Connect Team</p>
      </div>
    `,
  });
}

/** Notify the admin when a new consultation booking arrives */
export async function notifyAdminNewConsultation(data: {
  name: string;
  email: string;
  service: string;
  preferredDate: Date;
  preferredTime: string;
  consultationId: string;
}) {
  if (!NOTIFY_EMAIL) return; // Skip if no admin email configured

  const serviceLabel =
    data.service === "study"
      ? "Study in China"
      : data.service === "sourcing"
        ? "Product Sourcing"
        : "General Consultation";

  const dateStr = data.preferredDate.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return send({
    to: NOTIFY_EMAIL,
    subject: `New consultation booking — ${data.name}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;">
        <h2 style="color:#dc2626;margin:0 0 16px;">New Consultation Booking</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;width:140px;">Name</td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${data.name}</td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Email</td><td style="padding:6px 12px;border:1px solid #e2e8f0;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Service</td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${serviceLabel}</td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Preferred Date</td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${dateStr}</td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Preferred Time</td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${data.preferredTime}</td></tr>
        </table>
        <p style="margin-top:20px;font-size:13px;color:#64748b;">
          <a href="https://the86connects.com/admin#consultations" style="color:#dc2626;">View in admin panel</a>
        </p>
      </div>
    `,
  });
}

/** Notify the user when their consultation is updated (status/time change) */
export async function notifyUserConsultationUpdate(data: {
  to: string;
  name: string;
  service: string;
  status: string;
  preferredDate: Date;
  preferredTime: string;
  consultationId: string;
  isReschedule?: boolean;
}) {
  const serviceLabel =
    data.service === "study"
      ? "Study in China"
      : data.service === "sourcing"
        ? "Product Sourcing"
        : "General Consultation";

  const statusLabel =
    data.status === "confirmed"
      ? "Confirmed"
      : data.status === "cancelled"
        ? "Cancelled"
        : data.status === "completed"
          ? "Completed"
          : data.status === "rescheduled"
            ? "Rescheduled"
            : data.status.charAt(0).toUpperCase() + data.status.slice(1);

  const dateStr = data.preferredDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hour = parseInt(data.preferredTime);
  const ampm = hour < 12 ? "AM" : "PM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const timeStr = `${displayHour}:00 ${ampm}`;

  const subject =
    data.status === "confirmed"
      ? `Your ${serviceLabel} consultation is confirmed!`
      : data.status === "cancelled"
        ? `Update: Your ${serviceLabel} consultation has been cancelled`
        : data.isReschedule
          ? `Your ${serviceLabel} consultation has been rescheduled`
          : `Update on your ${serviceLabel} consultation`;

  const statusColor =
    data.status === "confirmed"
      ? "#2563eb"
      : data.status === "cancelled"
        ? "#dc2626"
        : data.status === "completed"
          ? "#16a34a"
          : "#dc2626";

  const bodyIntro =
    data.status === "confirmed"
      ? `Great news! Your consultation has been <strong>confirmed</strong>. We'll contact you via WhatsApp or email with the meeting details.`
      : data.status === "cancelled"
        ? `We're sorry to inform you that your consultation has been <strong>cancelled</strong>. If you'd like to reschedule, please book a new time or reply to this email.`
        : data.isReschedule
          ? `Your consultation has been <strong>rescheduled</strong>. Here are the updated details:`
          : `Your consultation status has been updated to <strong>${statusLabel}</strong>.`;

  return send({
    to: data.to,
    subject,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;">
        <h2 style="color:${statusColor};margin:0 0 16px;">Consultation Update</h2>
        <p style="font-size:15px;">Hi ${data.name},</p>
        <p style="font-size:15px;">${bodyIntro}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
          <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;width:150px;">Service</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${serviceLabel}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Status</td><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;color:${statusColor};">${statusLabel}</td></tr>
          ${data.status !== "cancelled" ? `<tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Date</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${dateStr}</td></tr><tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Time</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${timeStr}</td></tr>` : ""}
        </table>
        <p style="margin-top:20px;font-size:13px;color:#64748b;">
          If you have any questions, please reply to this email or <a href="https://wa.me/8617611533296" style="color:#25D366;">chat with us on WhatsApp</a>.
        </p>
        <p style="font-size:13px;color:#94a3b8;margin-top:24px;">— 86 Connect Team</p>
      </div>
    `,
  });
}

/** Send user a booking-received confirmation on initial booking */
export async function notifyUserBookingReceived(data: {
  to: string;
  name: string;
  service: string;
  preferredDate: Date;
  preferredTime: string;
  consultationId: string;
}) {
  const serviceLabel =
    data.service === "study"
      ? "Study in China"
      : data.service === "sourcing"
        ? "Product Sourcing"
        : "General Consultation";

  const dateStr = data.preferredDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hour = parseInt(data.preferredTime);
  const ampm = hour < 12 ? "AM" : "PM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const timeStr = `${displayHour}:00 ${ampm}`;

  return send({
    to: data.to,
    subject: `Booking received — ${serviceLabel} consultation`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;">
        <h2 style="color:#dc2626;margin:0 0 16px;">Booking Received</h2>
        <p style="font-size:15px;">Hi ${data.name},</p>
        <p style="font-size:15px;">We've received your consultation request. Our team will confirm your booking within 24 hours.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
          <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;width:150px;">Service</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${serviceLabel}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Date</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${dateStr}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Time</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${timeStr}</td></tr>
        </table>
        <p style="margin-top:20px;font-size:13px;color:#64748b;">
          Need to make changes? <a href="https://wa.me/8617611533296" style="color:#25D366;">Chat with us on WhatsApp</a> or reply to this email.
        </p>
        <p style="font-size:13px;color:#94a3b8;margin-top:24px;">— 86 Connect Team</p>
      </div>
    `,
  });
}

/** Send user a cancellation confirmation when they cancel their own booking */
export async function notifyUserCancellation(data: {
  to: string;
  name: string;
  service: string;
  preferredDate: Date;
  preferredTime: string;
  consultationId: string;
}) {
  const serviceLabel =
    data.service === "study"
      ? "Study in China"
      : data.service === "sourcing"
        ? "Product Sourcing"
        : "General Consultation";

  const dateStr = data.preferredDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hour = parseInt(data.preferredTime);
  const ampm = hour < 12 ? "AM" : "PM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const timeStr = `${displayHour}:00 ${ampm}`;

  return send({
    to: data.to,
    subject: `Your ${serviceLabel} consultation has been cancelled`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;">
        <h2 style="color:#dc2626;margin:0 0 16px;">Booking Cancelled</h2>
        <p style="font-size:15px;">Hi ${data.name},</p>
        <p style="font-size:15px;">Your consultation has been <strong>cancelled</strong>. The time slot is now available for others to book.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
          <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;width:150px;">Service</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${serviceLabel}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Original Date</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${dateStr}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Original Time</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${timeStr}</td></tr>
        </table>
        <p style="margin-top:24px;text-align:center;">
          <a href="https://the86connects.com/book-consultation" style="display:inline-block;padding:12px 32px;background:#dc2626;color:#fff;text-decoration:none;font-weight:700;border-radius:12px;font-size:15px;">Book a New Consultation</a>
        </p>
        <p style="font-size:13px;color:#94a3b8;margin-top:24px;">— 86 Connect Team</p>
      </div>
    `,
  });
}

/** Notify admin when a user cancels their own booking */
export async function notifyAdminCancellation(data: {
  name: string;
  email: string;
  service: string;
  preferredDate: Date;
  preferredTime: string;
  consultationId: string;
}) {
  if (!NOTIFY_EMAIL) return;

  const serviceLabel =
    data.service === "study"
      ? "Study in China"
      : data.service === "sourcing"
        ? "Product Sourcing"
        : "General Consultation";

  const dateStr = data.preferredDate.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return send({
    to: NOTIFY_EMAIL,
    subject: `Booking cancelled by user — ${data.name}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;">
        <h2 style="color:#dc2626;margin:0 0 16px;">Booking Cancelled by User</h2>
        <p style="font-size:15px;">A user has cancelled their consultation. The time slot is now available again.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
          <tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;width:140px;">Name</td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${data.name}</td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Email</td><td style="padding:6px 12px;border:1px solid #e2e8f0;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Service</td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${serviceLabel}</td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Date</td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${dateStr}</td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Time</td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${data.preferredTime}</td></tr>
        </table>
        <p style="margin-top:20px;font-size:13px;color:#64748b;">
          <a href="https://the86connects.com/admin#consultations" style="color:#dc2626;">View in admin panel</a>
        </p>
      </div>
    `,
  });
}

/** Send password reset link to the user */
export async function notifyUserPasswordReset(data: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  return send({
    to: data.to,
    subject: "Reset your 86 Connect password",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;">
        <h2 style="color:#dc2626;margin:0 0 16px;">Reset Your Password</h2>
        <p style="font-size:15px;">Hi ${data.name},</p>
        <p style="font-size:15px;">We received a request to reset your password. Click the button below to choose a new one:</p>
        <p style="margin:24px 0;text-align:center;">
          <a href="${data.resetUrl}" style="display:inline-block;padding:12px 32px;background:#dc2626;color:#fff;text-decoration:none;font-weight:700;border-radius:12px;font-size:15px;">Reset Password</a>
        </p>
        <p style="font-size:13px;color:#64748b;">Or copy this link: <code style="word-break:break-all;font-size:12px;">${data.resetUrl}</code></p>
        <p style="font-size:13px;color:#94a3b8;margin-top:24px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        <p style="font-size:13px;color:#94a3b8;margin-top:8px;">— 86 Connect Team</p>
      </div>
    `,
  });
}
