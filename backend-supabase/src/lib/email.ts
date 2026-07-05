// Email notification service using Resend.
// Identical to the main backend's email.ts but adapted for Supabase backend.

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(payload: EmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "re_xxxxxxxxxx") {
    console.log("[Email] Resend not configured, skipping:", payload.subject);
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `86 Connect <${process.env.FROM_EMAIL || "beijingbridgepath@gmail.com"}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("[Email] Failed to send:", body);
    }
  } catch (error) {
    console.error("[Email] Error:", (error as Error).message);
  }
}

// ─── Admin Notifications ─────────────────────────────────────

export async function notifyAdminNewSubmission(data: {
  name: string;
  email: string;
  service: string;
  referenceCode: string | null;
  submissionId: string;
}): Promise<void> {
  const adminEmail = process.env.NOTIFY_EMAIL || "beijingbridgepath@gmail.com";
  await sendEmail({
    to: adminEmail,
    subject: `New ${data.service} Submission — ${data.referenceCode || data.submissionId.slice(-8)}`,
    html: `<p><strong>${data.name}</strong> (${data.email}) submitted a new <strong>${data.service}</strong> inquiry.</p><p>Reference: ${data.referenceCode || "N/A"}</p>`,
  });
}

export async function notifyAdminNewConsultation(data: {
  name: string;
  email: string;
  service: string;
  preferredDate: Date;
  preferredTime: string;
  consultationId: string;
}): Promise<void> {
  const adminEmail = process.env.NOTIFY_EMAIL || "beijingbridgepath@gmail.com";
  const dateStr = data.preferredDate.toISOString().slice(0, 10);
  await sendEmail({
    to: adminEmail,
    subject: `New Consultation Booking — ${dateStr} ${data.preferredTime}`,
    html: `<p><strong>${data.name}</strong> (${data.email}) booked a <strong>${data.service}</strong> consultation.</p><p>Date: ${dateStr} at ${data.preferredTime}</p>`,
  });
}

export async function notifyAdminCancellation(data: {
  name: string;
  email: string;
  service: string;
  preferredDate: Date;
  preferredTime: string;
  consultationId: string;
}): Promise<void> {
  const adminEmail = process.env.NOTIFY_EMAIL || "beijingbridgepath@gmail.com";
  const dateStr = data.preferredDate.toISOString().slice(0, 10);
  await sendEmail({
    to: adminEmail,
    subject: `Consultation Cancelled — ${dateStr} ${data.preferredTime}`,
    html: `<p><strong>${data.name}</strong> (${data.email}) cancelled their <strong>${data.service}</strong> consultation.</p><p>Date: ${dateStr} at ${data.preferredTime}</p>`,
  });
}

// ─── User Notifications ──────────────────────────────────────

export async function notifyUserBookingReceived(data: {
  to: string;
  name: string;
  service: string;
  preferredDate: Date;
  preferredTime: string;
  consultationId: string;
}): Promise<void> {
  const dateStr = data.preferredDate.toISOString().slice(0, 10);
  await sendEmail({
    to: data.to,
    subject: "Consultation Booking Received — 86 Connect",
    html: `<p>Hi ${data.name},</p><p>Your <strong>${data.service}</strong> consultation has been booked for <strong>${dateStr} at ${data.preferredTime}</strong>.</p><p>We'll confirm shortly.</p>`,
  });
}

export async function notifyUserCancellation(data: {
  to: string;
  name: string;
  service: string;
  preferredDate: Date;
  preferredTime: string;
  consultationId: string;
}): Promise<void> {
  await sendEmail({
    to: data.to,
    subject: "Consultation Cancelled — 86 Connect",
    html: `<p>Hi ${data.name},</p><p>Your <strong>${data.service}</strong> consultation has been cancelled.</p>`,
  });
}

export async function notifyUserStatusChange(data: {
  to: string;
  name: string;
  service: string;
  newStatus: string;
  referenceCode: string | null;
}): Promise<void> {
  await sendEmail({
    to: data.to,
    subject: `Application Status Update — ${data.referenceCode || "86 Connect"}`,
    html: `<p>Hi ${data.name},</p><p>Your <strong>${data.service}</strong> application status has been updated to: <strong>${data.newStatus}</strong>.</p><p>Reference: ${data.referenceCode || "N/A"}</p>`,
  });
}

export async function notifyUserConsultationUpdate(data: {
  to: string;
  name: string;
  status: string;
  meetingUrl?: string | null;
}): Promise<void> {
  let html = `<p>Hi ${data.name},</p><p>Your consultation status has been updated to: <strong>${data.status}</strong>.</p>`;
  if (data.meetingUrl) {
    html += `<p>Meeting link: <a href="${data.meetingUrl}">${data.meetingUrl}</a></p>`;
  }
  await sendEmail({
    to: data.to,
    subject: "Consultation Update — 86 Connect",
    html,
  });
}

export async function notifyUserPasswordReset(data: {
  to: string;
  resetUrl: string;
}): Promise<void> {
  await sendEmail({
    to: data.to,
    subject: "Password Reset — 86 Connect",
    html: `<p>Click the link below to reset your password:</p><p><a href="${data.resetUrl}">${data.resetUrl}</a></p><p>This link expires in 1 hour.</p>`,
  });
}