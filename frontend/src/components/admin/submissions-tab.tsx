"use client";

import { Fragment, useState, useMemo, useCallback, useEffect } from "react";
import Image from "next/image";

import {
  RefreshCw,
  Loader2,
  Mail,
  Phone,
  Clock,
  Inbox,
  GraduationCap,
  ShoppingCart,
  AlertCircle,
  Bell,
  Eye,
  Trash2,
  X,
  Pencil,
  Paperclip,
  FileText,
  CheckCircle2,
  Check,
  Copy,
  ChevronDown,
  Download,
  MessageCircle,
  Car,
  Package,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  STUDY_STAGES,
  SOURCING_STAGES,
  CAR_SHIPPING_STAGES,
  getStatusLabel,
  ALL_STATUS_KEYS,
} from "@/lib/submission-status";
import { TableSkeleton } from "@/components/ui/skeleton";
import { BulkActions } from "@/components/admin/bulk-actions";
import { FiltersPanel } from "@/components/admin/filters-panel";
import { SubmissionNotes } from "@/components/admin/submission-notes";
import { convertCarQuoteToShipment } from "@/lib/api";
import { API_URL } from "@/lib/api";

interface AdminAttachment {
  id: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  storageProvider: "cloudinary" | "r2";
}

interface Submission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  serviceInterest: string;
  submissionType: string;
  status: string;
  read: boolean;
  message: string;
  referenceCode: string | null;
  createdAt: string;
  attachments: AdminAttachment[];
}

type FilterType = "all" | "Study in China" | "Product Sourcing" | "Car Quote" | "General";
type ReadFilter = "all" | "read" | "unread";

interface SubmissionsTabProps {
  submissions: Submission[];
  fetchLoading: boolean;
  fetchError: string;
  fetchSubmissions: () => Promise<void>;
  stats: { total: number; study: number; sourcing: number; unread: number };
  onMarkAsRead: (submissionId: string) => Promise<void>;
  onStatusUpdate: (submissionId: string, newStatus: string) => Promise<void>;
  onDeleteSubmission: (submissionId: string) => Promise<void>;
  initialSearch?: string;
  initialReadFilter?: ReadFilter;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getStages(submissionType: string) {
  if (submissionType === "sourcing") return SOURCING_STAGES;
  if (submissionType === "car-quote" || submissionType === "car_shipping") return CAR_SHIPPING_STAGES;
  return STUDY_STAGES;
}

type ParsedField = { label: string; value: string };

function parseSubmissionMessage(message: string): {
  fields: ParsedField[];
  note: string;
} {
  const lines = message
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const fields: ParsedField[] = [];
  let note = "";

  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) {
      note += (note ? "\n" : "") + line;
      continue;
    }
    const label = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    if (!label) {
      note += (note ? "\n" : "") + line;
      continue;
    }
    if (/^message$/i.test(label)) {
      note += (note ? "\n" : "") + value;
    } else {
      fields.push({ label, value: value || "—" });
    }
  }

  return { fields, note: note.trim() };
}

function statusBadgeClass(status: string | null | undefined): string {
  if (!status) return "bg-slate-100 text-slate-600";
  if (["visa", "shipping"].includes(status)) {
    return "bg-emerald-100 text-emerald-700";
  }
  if (["decision", "confirmed"].includes(status)) {
    return "bg-blue-100 text-blue-700";
  }
  if (["verified", "sample"].includes(status)) {
    return "bg-violet-100 text-violet-700";
  }
  if (["matched", "quotes"].includes(status)) {
    return "bg-amber-100 text-amber-700";
  }
  if (["under_review", "sourcing"].includes(status)) {
    return "bg-sky-100 text-sky-700";
  }
  return "bg-slate-100 text-slate-600";
}

const SITE_URL = "https://www.the86connect.com";
const WATERMARK_LOGO = `${SITE_URL}/logo-main.png`;

function isImageMime(mime: string): boolean {
  return mime.startsWith("image/");
}

function downloadSubmissionDoc(sub: Submission): void {
  const dateStr = new Date(sub.createdAt).toISOString().slice(0, 10);
  const serviceSlug = sub.serviceInterest.replace(/[^a-zA-Z0-9]+/g, "-");
  const fileName = `${serviceSlug}_86Connect_${dateStr}.doc`;

  const messageLines = sub.message.split("\n").filter(Boolean);
  const messageRows = messageLines.map((line) => {
    const idx = line.indexOf(":");
    if (idx === -1) return { label: "", value: line };
    return {
      label: line.slice(0, idx).trim(),
      value: line.slice(idx + 1).trim(),
    };
  });

  const imageAttachments = sub.attachments.filter((a) => isImageMime(a.mimeType));
  const nonImageAttachments = sub.attachments.filter(
    (a) => !isImageMime(a.mimeType),
  );

  const attachmentRows =
    sub.attachments.length > 0
      ? sub.attachments
          .map(
            (a) =>
              `<tr><td style="padding:4px 12px;border:1px solid #e2e8f0;">${escapeHtml(a.originalName)}</td><td style="padding:4px 12px;border:1px solid #e2e8f0;">${escapeHtml(a.mimeType)}</td><td style="padding:4px 12px;border:1px solid #e2e8f0;">${formatFileSize(a.size)}</td><td style="padding:4px 12px;border:1px solid #e2e8f0;"><a href="${a.url}" target="_blank" style="color:#dc2626;text-decoration:underline;">Open Link</a></td></tr>`,
          )
          .join("")
      : `<tr><td colspan="4" style="padding:8px 12px;border:1px solid #e2e8f0;color:#64748b;">No attachments</td></tr>`;

  const messageFieldRows = messageRows
    .map(
      (r) =>
        `<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;width:200px;">${r.label || "—"}</td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${escapeHtml(r.value)}</td></tr>`,
    )
    .join("");

  const imagesSection =
    imageAttachments.length > 0
      ? `<h3>Attached Images</h3>
<table>
<tr style="background:#f1f5f9;"><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;">Image</td><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;">File Name</td><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;">Cloudinary Link</td></tr>
${imageAttachments
  .map(
    (a) =>
      `<tr><td style="padding:8px 12px;border:1px solid #e2e8f0;text-align:center;"><img src="${a.url}" alt="${escapeHtml(a.originalName)}" style="max-width:360px;max-height:240px;object-fit:contain;" /></td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${escapeHtml(a.originalName)}</td><td style="padding:6px 12px;border:1px solid #e2e8f0;word-break:break-all;"><a href="${a.url}" target="_blank" style="color:#dc2626;text-decoration:underline;font-size:9pt;">${a.url}</a></td></tr>`,
  )
  .join("")}
</table>`
      : "";

  const nonImageLinksSection =
    nonImageAttachments.length > 0
      ? `<p style="margin-top:12px;font-size:10pt;color:#475569;"><strong>Document Links (Cloudinary):</strong></p>
<ul style="font-size:10pt;color:#334155;">
${nonImageAttachments
  .map(
    (a) =>
      `<li>${escapeHtml(a.originalName)} — <a href="${a.url}" target="_blank" style="color:#dc2626;text-decoration:underline;word-break:break-all;">${a.url}</a></li>`,
  )
  .join("")}
</ul>`
      : "";

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:v="urn:schemas-microsoft-com:vml" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>${sub.serviceInterest} — ${sub.name}</title>
<!--[if gte mso 9]><xml>
<w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument>
<v:shape id="_x0000_s1025" type="#_x0000_t75" style="position:absolute;margin-left:0;margin-top:0;width:540pt;height:150pt;z-index:-251658240;mso-position-horizontal:center;mso-position-horizontal-relative:margin;mso-position-vertical:center;mso-position-vertical-relative:margin;rotation:315;opacity:.08" o:allowincell="f">
<v:imagedata src="${WATERMARK_LOGO}" o:title="86Connect Watermark"/>
</v:shape>
</xml><![endif]-->
<style>
@page { margin: 1in; }
body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #1e293b; position: relative; }
h1 { font-size: 20pt; color: #dc2626; margin: 0 0 4px 0; }
h2 { font-size: 12pt; color: #64748b; font-weight: normal; margin: 0 0 20px 0; }
h3 { font-size: 11pt; color: #334155; margin: 20px 0 8px 0; border-bottom: 2px solid #dc2626; padding-bottom: 4px; }
table { border-collapse: collapse; width: 100%; }
.ref { font-size: 9pt; color: #94a3b8; margin: 0 0 16px 0; }
.watermark {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  opacity: 0.08;
  z-index: -1;
  pointer-events: none;
  width: 500px;
  height: auto;
}
@media print {
  .watermark {
    position: absolute;
    top: 50%;
    left: 50%;
  }
}
</style>
</head>
<body>
<div class="watermark">
<img src="${WATERMARK_LOGO}" alt="86Connect" style="width:100%;height:auto;display:block;" />
</div>
<h1>86Connect</h1>
<h2>${escapeHtml(sub.serviceInterest)} Submission</h2>
<p class="ref">Reference: ${sub.referenceCode ?? sub.id.slice(-8).toUpperCase()} &nbsp;|&nbsp; Submitted: ${formatDate(sub.createdAt)}</p>

<h3>Applicant Information</h3>
<table>
<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;width:200px;">Name</td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${escapeHtml(sub.name)}</td></tr>
<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Email</td><td style="padding:6px 12px;border:1px solid #e2e8f0;"><a href="mailto:${escapeHtml(sub.email)}">${escapeHtml(sub.email)}</a></td></tr>
<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Phone</td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${sub.phone ? escapeHtml(sub.phone) : "Not provided"}</td></tr>
<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Service</td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${escapeHtml(sub.serviceInterest)}</td></tr>
<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Current Status</td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${escapeHtml(getStatusLabel(sub.status))}</td></tr>
</table>

<h3>Application Details</h3>
<table>
${messageFieldRows}
</table>

<h3>Attachments</h3>
<table>
<tr style="background:#f1f5f9;"><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;">File Name</td><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;">Type</td><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;">Size</td><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;">Link</td></tr>
${attachmentRows}
</table>

${imagesSection}
${nonImageLinksSection}

<p style="margin-top:24px;font-size:9pt;color:#94a3b8;">Generated by 86Connect Admin Panel on ${new Date().toLocaleString("en-US")}</p>
</body>
</html>`;

  const blob = new Blob([html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function downloadAttachment(
  submissionId: string,
  attachment: AdminAttachment,
): Promise<void> {
  const res = await fetch(
    `${API_URL}/api/admin/download/${submissionId}/${attachment.id}`,
    { credentials: "include" },
  );
  if (!res.ok) {
    const { toast } = await import("sonner");
    toast.error(`Failed to download ${attachment.originalName}`);
    return;
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = attachment.originalName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function downloadAllAttachments(
  submission: Submission,
  setLoading: (v: boolean) => void,
): Promise<void> {
  if (submission.attachments.length === 0) return;
  setLoading(true);
  try {
    for (const att of submission.attachments) {
      await downloadAttachment(submission.id, att);
      // Small delay between downloads to avoid browser blocking
      await new Promise((r) => setTimeout(r, 300));
    }
  } finally {
    setLoading(false);
  }
}

export default function SubmissionsTab({
  submissions,
  fetchLoading,
  fetchError,
  fetchSubmissions,
  stats,
  onMarkAsRead,
  onStatusUpdate,
  onDeleteSubmission,
  initialSearch,
  initialReadFilter,
}: SubmissionsTabProps) {
  // Filter state
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [readFilter, setReadFilter] = useState<ReadFilter>(initialReadFilter ?? "all");

  // UI state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Submission | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState("");
  const [pendingStatus, setPendingStatus] = useState<string>("");
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [batchDownloadLoading, setBatchDownloadLoading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Car-quote → shipment conversion state
  const [convertTarget, setConvertTarget] = useState<Submission | null>(null);
  const [convertLoading, setConvertLoading] = useState(false);
  const [convertError, setConvertError] = useState("");
  const [convertSuccess, setConvertSuccess] = useState(false);
  const [convertForm, setConvertForm] = useState({
    carModel: "",
    carYear: "",
    vinNumber: "",
    originPort: "",
    destinationPort: "",
    containerNumber: "",
    vesselName: "",
    estimatedDeparture: "",
    estimatedArrival: "",
    notes: "",
  });

  // Open convert modal with pre-filled fields from the submission
  const openConvertModal = useCallback((submission: Submission) => {
    setConvertTarget(submission);
    setConvertError("");
    setConvertSuccess(false);
    setConvertForm({
      carModel: submission.serviceInterest || "",
      carYear: "",
      vinNumber: "",
      originPort: "",
      destinationPort: "",
      containerNumber: "",
      vesselName: "",
      estimatedDeparture: "",
      estimatedArrival: "",
      notes: "",
    });
  }, []);

  // Handle conversion submit
  const handleConvertSubmit = useCallback(async () => {
    if (!convertTarget) return;
    if (!convertForm.carModel.trim()) {
      setConvertError("Car model is required");
      return;
    }
    setConvertLoading(true);
    setConvertError("");
    try {
      await convertCarQuoteToShipment(convertTarget.id, {
        carModel: convertForm.carModel.trim(),
        carYear: convertForm.carYear.trim() || undefined,
        vinNumber: convertForm.vinNumber.trim() || undefined,
        originPort: convertForm.originPort.trim() || undefined,
        destinationPort: convertForm.destinationPort.trim() || undefined,
        containerNumber: convertForm.containerNumber.trim() || undefined,
        vesselName: convertForm.vesselName.trim() || undefined,
        estimatedDeparture: convertForm.estimatedDeparture || undefined,
        estimatedArrival: convertForm.estimatedArrival || undefined,
        notes: convertForm.notes.trim() || undefined,
      });
      setConvertSuccess(true);
      // Refresh submissions list to reflect the type change
      await fetchSubmissions();
    } catch (err) {
      setConvertError((err as Error).message || "Failed to convert quote");
    } finally {
      setConvertLoading(false);
    }
  }, [convertTarget, convertForm, fetchSubmissions]);

  // Sync pendingStatus when selectedSubmission changes
  useEffect(() => {
    if (selectedSubmission) {
      // Sync derived state from selected submission.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPendingStatus(selectedSubmission.status);
      setStatusUpdateError("");
    }
  }, [selectedSubmission]);

  // Sync initialSearch from parent (cross-tab navigation)
  useEffect(() => {
    if (initialSearch) {
      // Sync from parent prop on cross-tab navigation.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  const copyReference = useCallback(
    async (submissionId: string, referenceCode: string | null) => {
      const ref = referenceCode ?? submissionId.slice(-8).toUpperCase();
      try {
        await navigator.clipboard.writeText(ref);
        setCopiedRef(submissionId);
        setTimeout(() => setCopiedRef(null), 1500);
      } catch {
        // clipboard unavailable
      }
    },
    [],
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await onDeleteSubmission(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete submission:", err);
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteTarget, onDeleteSubmission]);

  const handleStatusUpdateLocal = useCallback(
    async (submissionId: string, newStatus: string) => {
      setStatusUpdateLoading(true);
      setStatusUpdateError("");
      try {
        await onStatusUpdate(submissionId, newStatus);
      } catch (err) {
        console.error("Failed to update status:", err);
        setStatusUpdateError(
          err instanceof Error ? err.message : "Failed to update status",
        );
      } finally {
        setStatusUpdateLoading(false);
      }
    },
    [onStatusUpdate],
  );

  const filtered = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return submissions.filter((s) => {
      const matchesFilter = filter === "all"
        || s.serviceInterest === filter
        || (filter === "Car Quote" && (s.submissionType === "car-quote" || s.submissionType === "car_shipping"));
      const matchesSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.message.toLowerCase().includes(search.toLowerCase()) ||
        (s.referenceCode ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      const matchesRead =
        readFilter === "all" ||
        (readFilter === "read" && s.read) ||
        (readFilter === "unread" && !s.read);
      const submittedAt = new Date(s.createdAt);
      let matchesDate = true;
      if (dateFilter === "today") matchesDate = submittedAt >= startOfToday;
      else if (dateFilter === "week") matchesDate = submittedAt >= startOfWeek;
      else if (dateFilter === "month")
        matchesDate = submittedAt >= startOfMonth;
      return (
        matchesFilter &&
        matchesSearch &&
        matchesStatus &&
        matchesDate &&
        matchesRead
      );
    });
  }, [submissions, filter, search, statusFilter, dateFilter, readFilter]);

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllVisible = useCallback(() => {
    setSelectedIds((prev) => {
      const allSelected = filtered.every((s) => prev.has(s.id));
      const next = new Set(prev);
      filtered.forEach((s) => {
        if (allSelected) next.delete(s.id);
        else next.add(s.id);
      });
      return next;
    });
  }, [filtered]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const availableStatuses = useMemo(() => {
    const found = new Set<string>();
    submissions.forEach((s) => {
      if (s.status) found.add(s.status);
    });
    const all = new Set(ALL_STATUS_KEYS);
    found.forEach((s) => all.add(s));
    return Array.from(all);
  }, [submissions]);

  const handleExportCSV = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("service", filter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (readFilter !== "all") params.set("read", readFilter);
      if (search) params.set("search", search);
      if (dateFilter !== "all") {
        const now = new Date();
        const startOfToday = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        if (dateFilter === "today")
          params.set("dateFrom", startOfToday.toISOString());
        else if (dateFilter === "week") {
          const w = new Date(startOfToday);
          w.setDate(startOfToday.getDate() - startOfToday.getDay());
          params.set("dateFrom", w.toISOString());
        } else if (dateFilter === "month") {
          params.set(
            "dateFrom",
            new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
          );
        }
      }
      const qs = params.toString();
      const res = await fetch(
        `${API_URL}/api/admin/submissions/export${qs ? `?${qs}` : ""}`,
        { credentials: "include" },
      );
      if (!res.ok) {
        const { toast } = await import("sonner");
        toast.error("Failed to export CSV");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = `submissions_${dateStr}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      const { toast } = await import("sonner");
      toast.success("CSV downloaded successfully");
    } catch {
      const { toast } = await import("sonner");
      toast.error("Failed to export CSV");
    }
  }, [filter, statusFilter, readFilter, search, dateFilter]);

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="group px-4 py-3 rounded-xl bg-white/60 backdrop-blur-xl border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="w-7 h-7 rounded-lg bg-slate-100/80 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Inbox className="h-3.5 w-3.5 text-slate-600 group-hover:text-primary transition-colors" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Total
            </span>
          </div>
          <p className="text-xl font-bold tracking-tight text-slate-900">
            {stats.total}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            submissions
          </p>
        </div>
        <div className="group px-4 py-3 rounded-xl bg-red-50/60 backdrop-blur-xl border border-red-200/60 shadow-sm hover:shadow-lg hover:border-red-400/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="w-7 h-7 rounded-lg bg-red-100/80 flex items-center justify-center group-hover:bg-red-200/80 transition-colors">
              <GraduationCap className="h-3.5 w-3.5 text-red-600" />
            </div>
            <span className="text-[10px] font-bold text-red-700/70 uppercase tracking-wider">
              Study
            </span>
          </div>
          <p className="text-xl font-bold tracking-tight text-red-700">
            {stats.study}
          </p>
          <p className="text-[11px] text-red-700/60 mt-0.5">applications</p>
        </div>
        <div className="group px-4 py-3 rounded-xl bg-blue-50/60 backdrop-blur-xl border border-blue-200/60 shadow-sm hover:shadow-lg hover:border-blue-400/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100/80 flex items-center justify-center group-hover:bg-blue-200/80 transition-colors">
              <ShoppingCart className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <span className="text-[10px] font-bold text-blue-700/70 uppercase tracking-wider">
              Sourcing
            </span>
          </div>
          <p className="text-xl font-bold tracking-tight text-blue-700">
            {stats.sourcing}
          </p>
          <p className="text-[11px] text-blue-700/60 mt-0.5">inquiries</p>
        </div>
        <div className="group px-4 py-3 rounded-xl bg-amber-50/60 backdrop-blur-xl border border-amber-200/60 shadow-sm hover:shadow-lg hover:border-amber-400/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100/80 flex items-center justify-center group-hover:bg-amber-200/80 transition-colors">
              <Bell className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <span className="text-[10px] font-bold text-amber-700/70 uppercase tracking-wider">
              Unread
            </span>
          </div>
          <p className="text-xl font-bold tracking-tight text-amber-700">
            {stats.unread}
          </p>
          <p className="text-[11px] text-amber-700/60 mt-0.5">
            new messages
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-start">
          <div className="flex-1 min-w-0">
            <FiltersPanel
              filter={filter}
              setFilter={setFilter}
              search={search}
              setSearch={setSearch}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              readFilter={readFilter}
              setReadFilter={setReadFilter}
              availableStatuses={availableStatuses}
            />
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={fetchLoading || filtered.length === 0}
              className="cursor-pointer btn-glass rounded-xl border-0 hover:bg-white/95"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={fetchSubmissions}
              disabled={fetchLoading}
              className="cursor-pointer btn-glass rounded-xl border-0 hover:bg-white/95"
            >
              <RefreshCw
                className={cn("h-4 w-4", fetchLoading && "animate-spin")}
              />
              Refresh
            </Button>
          </div>
        </div>

        <BulkActions
          selectedIds={Array.from(selectedIds)}
          submissions={submissions}
          onClearSelection={clearSelection}
          onActionComplete={fetchSubmissions}
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-sm overflow-hidden">
        {fetchLoading ? (
          <div className="p-8">
            <TableSkeleton rows={6} />
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-destructive font-semibold mb-2">
              {fetchError}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSubmissions}
              className="mt-3 cursor-pointer rounded-xl"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100/80 flex items-center justify-center mb-5">
              <Inbox className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium">
              {submissions.length === 0
                ? "No submissions yet."
                : "No results match your filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Contact form submissions — {filtered.length} of{" "}
                {stats.total} total
              </caption>
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80">
                  <th className="text-left px-4 py-4 w-12">
                    <input
                      type="checkbox"
                      checked={
                        filtered.length > 0 &&
                        filtered.every((s) => selectedIds.has(s.id))
                      }
                      ref={(el) => {
                        if (el) {
                          el.indeterminate =
                            filtered.some((s) => selectedIds.has(s.id)) &&
                            !filtered.every((s) => selectedIds.has(s.id));
                        }
                      }}
                      onChange={selectAllVisible}
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                      aria-label="Select all visible submissions"
                    />
                  </th>
                  <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-4 w-12">
                    #
                  </th>
                  <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-4 w-12"></th>
                  <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-4">
                    Applicant
                  </th>
                  <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-4">
                    Service
                  </th>
                  <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-4 hidden sm:table-cell">
                    Status
                  </th>
                  <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-4 hidden md:table-cell">
                    Date
                  </th>
                  <th className="text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-4 w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, idx) => {
                  const isExpanded = expandedId === s.id;
                  return (
                    <Fragment key={s.id}>
                      <tr
                        className={cn(
                          "border-b border-slate-100/80 transition-all duration-200 cursor-pointer hover:bg-slate-50/80",
                          !isExpanded &&
                            (s.serviceInterest === "Study in China"
                              ? "bg-red-50/40"
                              : s.serviceInterest === "Product Sourcing"
                                ? "bg-white/80"
                                : "bg-slate-50/40"),
                          isExpanded &&
                            (s.serviceInterest === "Study in China"
                              ? "bg-red-50/90 border-l-4 border-l-red-500"
                              : s.serviceInterest === "Product Sourcing"
                                ? "bg-slate-50/90 border-l-4 border-l-primary"
                                : "bg-slate-100/90 border-l-4 border-l-slate-500"),
                        )}
                        onClick={() => toggleExpand(s.id)}
                      >
                        <td
                          className="px-4 py-4 w-12"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.has(s.id)}
                            onChange={() => toggleSelected(s.id)}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                            aria-label={`Select submission from ${s.name}`}
                          />
                        </td>
                        <td className="px-5 py-4 w-12 text-xs font-semibold text-muted-foreground tabular-nums">
                          {!s.read && (
                            <span className="inline-block w-2.5 h-2.5 bg-red-500 rounded-full mr-2 align-middle" />
                          )}
                          {filtered.length - idx}
                        </td>
                        <td className="px-5 py-4 w-12">
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform",
                              isExpanded && "rotate-180",
                            )}
                          />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={cn(
                                "font-semibold",
                                !s.read && "text-slate-900",
                              )}
                            >
                              {s.name}
                            </span>
                            <a
                              href={`mailto:${s.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors w-fit"
                            >
                              <Mail className="h-3 w-3" />
                              {s.email}
                            </a>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
                              s.submissionType === "car-quote" || s.submissionType === "car_shipping"
                                ? "bg-emerald-50 text-emerald-600"
                                : s.serviceInterest === "Study in China"
                                  ? "bg-red-50 text-red-600"
                                  : s.serviceInterest === "Product Sourcing"
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-slate-100 text-slate-700",
                            )}
                          >
                            {s.submissionType === "car-quote" || s.submissionType === "car_shipping" ? (
                              <Car className="h-3.5 w-3.5" />
                            ) : s.serviceInterest === "Study in China" ? (
                              <GraduationCap className="h-3.5 w-3.5" />
                            ) : s.serviceInterest === "Product Sourcing" ? (
                              <ShoppingCart className="h-3.5 w-3.5" />
                            ) : (
                              <MessageCircle className="h-3.5 w-3.5" />
                            )}
                            {s.submissionType === "car-quote" || s.submissionType === "car_shipping"
                              ? "Car Quote"
                              : s.serviceInterest === "Study in China"
                                ? "Study"
                                : s.serviceInterest === "Product Sourcing"
                                  ? "Sourcing"
                                  : "General"}
                          </span>
                        </td>
                        <td
                          className="px-5 py-4 hidden sm:table-cell"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedSubmission(s)}
                            className="group inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-full text-xs font-medium cursor-pointer border border-slate-200 bg-white/60 hover:bg-white hover:border-accent/40 hover:shadow-sm transition-all"
                            aria-label={`Status: ${getStatusLabel(s.status)}. Click to update.`}
                            title="Click to update status"
                          >
                            <span
                              className={cn(
                                "inline-flex items-center gap-1",
                                statusBadgeClass(s.status),
                              )}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {getStatusLabel(s.status)}
                            </span>
                            <Pencil className="h-3 w-3 text-muted-foreground group-hover:text-accent transition-colors" />
                          </button>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell whitespace-nowrap text-muted-foreground">
                          <span className="inline-flex items-center gap-1 text-xs">
                            <Clock className="h-3 w-3" />
                            {formatDate(s.createdAt)}
                          </span>
                        </td>
                        <td
                          className="px-5 py-4 w-32"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSubmission(s);
                                if (!s.read) onMarkAsRead(s.id);
                              }}
                              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                              aria-label="View message"
                              title="View details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                              {!s.read && (
                                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadSubmissionDoc(s)}
                              className="p-2 rounded-lg hover:bg-slate-100/80 transition-colors cursor-pointer"
                              aria-label="Download as document"
                              title="Download as document"
                            >
                              <Download className="h-4 w-4 text-muted-foreground hover:text-primary" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(s)}
                              className="p-2 rounded-lg hover:bg-red-50/80 transition-colors cursor-pointer"
                              aria-label="Delete submission"
                              title="Delete submission"
                            >
                              <Trash2 className="h-4 w-4 text-destructive hover:text-red-700" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="border-b border-slate-100/60">
                          <td
                            colSpan={8}
                            className={cn(
                              "px-5 py-4 border-l-4",
                              s.serviceInterest === "Study in China"
                                ? "bg-red-50/90 border-red-500"
                                : "bg-slate-50/90 border-slate-400",
                            )}
                          >
                            <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                  Reference
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    copyReference(s.id, s.referenceCode)
                                  }
                                  className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-muted-foreground hover:text-accent transition-colors cursor-pointer w-fit"
                                  title="Copy reference ID"
                                  aria-label="Copy reference ID"
                                >
                                  {s.referenceCode ??
                                    s.id.slice(-8).toUpperCase()}
                                  {copiedRef === s.id ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              </div>
                              {s.phone && (
                                <div className="flex flex-col gap-1">
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Phone
                                  </span>
                                  <a
                                    href={`tel:${s.phone}`}
                                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors"
                                  >
                                    <Phone className="h-3 w-3" />
                                    {s.phone}
                                  </a>
                                </div>
                              )}
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                  Files
                                </span>
                                {s.attachments.length > 0 ? (
                                  <div className="inline-flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedSubmission(s)}
                                      className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer w-fit"
                                      aria-label={`View ${s.attachments.length} attachment${s.attachments.length === 1 ? "" : "s"}`}
                                    >
                                      <Paperclip className="h-3.5 w-3.5" />
                                      {s.attachments.length} attachment
                                      {s.attachments.length === 1 ? "" : "s"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        downloadAttachment(s.id, s.attachments[0]);
                                      }}
                                      className="p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                      aria-label={`Download ${s.attachments[0].originalName}`}
                                      title="Download first file"
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">
                                    None
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col gap-1 min-w-[200px] flex-1 max-w-xl">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                  Message
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedSubmission(s)}
                                  className="text-left text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors cursor-pointer"
                                >
                                  <p className="line-clamp-3 leading-relaxed">
                                    {s.message}
                                  </p>
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View message modal */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedSubmission(null)}
        >
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" />
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-strong p-7 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">Message Details</h2>
                <button
                  type="button"
                  onClick={() =>
                    copyReference(
                      selectedSubmission.id,
                      selectedSubmission.referenceCode,
                    )
                  }
                  className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-muted-foreground hover:text-accent transition-colors cursor-pointer w-fit"
                  title="Copy reference ID"
                  aria-label="Copy reference ID"
                >
                  Ref:{" "}
                  {selectedSubmission.referenceCode ??
                    selectedSubmission.id.slice(-8).toUpperCase()}
                  {copiedRef === selectedSubmission.id ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => downloadSubmissionDoc(selectedSubmission)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium glass-pill hover:bg-white/80 transition-all cursor-pointer"
                  aria-label="Download as document"
                  title="Download as document"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  From
                </p>
                <p className="font-medium">{selectedSubmission.name}</p>
                <a
                  href={`mailto:${selectedSubmission.email}`}
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  {selectedSubmission.email}
                </a>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Service
                </p>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
                    selectedSubmission.serviceInterest === "Study in China"
                      ? "bg-accent/10 text-accent"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  {selectedSubmission.serviceInterest}
                </span>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Application Details
                </p>
                {(() => {
                  const { fields, note } = parseSubmissionMessage(
                    selectedSubmission.message,
                  );
                  if (fields.length === 0 && !note) {
                    return (
                      <p className="text-sm text-muted-foreground italic">
                        No details provided.
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-3">
                      {fields.length > 0 && (
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 p-3 rounded-xl bg-white/60 border border-slate-200/60">
                          {fields.map((f, i) => (
                            <div
                              key={i}
                              className="flex flex-col gap-0.5 min-w-0"
                            >
                              <dt className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                                {f.label}
                              </dt>
                              <dd className="text-sm font-semibold text-foreground break-words">
                                {f.value}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      )}
                      {note && (
                        <div className="p-3 rounded-xl bg-accent/5 border border-accent/20">
                          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                            Message
                          </p>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                            {note}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Status update section */}
              <div className="p-4 rounded-2xl bg-white/40 border border-white/60">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Status
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                      statusBadgeClass(selectedSubmission.status),
                    )}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    Current: {getStatusLabel(selectedSubmission.status)}
                  </span>
                </div>

                <label
                  htmlFor="status-select"
                  className="block text-xs text-muted-foreground mb-1.5"
                >
                  Update to
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    id="status-select"
                    value={pendingStatus}
                    onChange={(e) => setPendingStatus(e.target.value)}
                    disabled={statusUpdateLoading}
                    className="flex-1 h-11 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 disabled:opacity-50 cursor-pointer"
                  >
                    {getStages(selectedSubmission.submissionType).map(
                      (stage) => (
                        <option key={stage.key} value={stage.key}>
                          {stage.label}
                        </option>
                      ),
                    )}
                  </select>
                  <Button
                    type="button"
                    onClick={() =>
                      handleStatusUpdateLocal(
                        selectedSubmission.id,
                        pendingStatus,
                      )
                    }
                    disabled={
                      statusUpdateLoading ||
                      pendingStatus === selectedSubmission.status
                    }
                    className="cursor-pointer rounded-xl shrink-0 h-11 px-5 bg-accent text-white hover:bg-red-700 border-0"
                  >
                    {statusUpdateLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Save
                  </Button>
                </div>

                {statusUpdateError && (
                  <p className="mt-2 text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {statusUpdateError}
                  </p>
                )}

                {/* Mini timeline */}
                <div className="mt-4 pt-3 border-t border-slate-200/50">
                  <ol className="flex flex-wrap gap-1.5">
                    {getStages(selectedSubmission.submissionType).map(
                      (stage, idx) => {
                        const currentIdx = getStages(
                          selectedSubmission.submissionType,
                        ).findIndex(
                          (st) => st.key === selectedSubmission.status,
                        );
                        const state =
                          idx < currentIdx
                            ? "done"
                            : idx === currentIdx
                              ? "current"
                              : "pending";
                        return (
                          <li
                            key={stage.key}
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
                              state === "done" &&
                                "bg-emerald-100 text-emerald-700",
                              state === "current" &&
                                "bg-accent/15 text-accent font-medium",
                              state === "pending" &&
                                "bg-slate-100/60 text-muted-foreground",
                            )}
                          >
                            {state === "done" && (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                            {state === "current" && (
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            )}
                            {stage.label}
                          </li>
                        );
                      },
                    )}
                  </ol>
                </div>
              </div>

              {selectedSubmission.attachments.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Attachments ({selectedSubmission.attachments.length})
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        downloadAllAttachments(
                          selectedSubmission,
                          setBatchDownloadLoading,
                        )
                      }
                      disabled={batchDownloadLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {batchDownloadLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      Download All
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {selectedSubmission.attachments.map((att) => (
                      <li
                        key={att.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border"
                      >
                        <div className="relative w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                          {att.mimeType.startsWith("image/") ? (
                            <Image
                              src={att.url}
                              alt={att.originalName}
                              fill
                              sizes="40px"
                              className="object-cover cursor-pointer"
                              unoptimized
                              onClick={() => setLightboxImage(att.url)}
                            />
                          ) : (
                            <FileText className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {att.originalName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(att.size)} · {att.storageProvider}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            downloadAttachment(
                              selectedSubmission.id,
                              att,
                            )
                          }
                          className="shrink-0 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                          aria-label={`Download ${att.originalName}`}
                          title="Download file"
                        >
                          <Download className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Convert car-quote to shipment button */}
              {selectedSubmission.submissionType === "car-quote" && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                      <Truck className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-emerald-900">
                        Ready to ship this vehicle?
                      </p>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        Convert this quote into a shipment order. The customer
                        will receive a tracking email and see updates in their
                        account dashboard.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openConvertModal(selectedSubmission)}
                      className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-sm"
                    >
                      <Package className="h-4 w-4" />
                      Create Shipment
                    </button>
                  </div>
                </div>
              )}

              <SubmissionNotes submissionId={selectedSubmission.id} />

              <p className="text-xs text-muted-foreground">
                Submitted {formatDate(selectedSubmission.createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" />
          <div
            className="relative w-full max-w-sm rounded-3xl glass-strong p-7 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-2">Delete submission?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              This will permanently remove the submission from{" "}
              <span className="font-medium text-foreground">
                {deleteTarget.name}
              </span>
              . This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="cursor-pointer btn-glass rounded-xl border-0"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="cursor-pointer rounded-xl"
              >
                {deleteLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-10"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative max-w-[90vw] max-h-[90vh] rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxImage}
              alt="Full size preview"
              fill
              sizes="90vw"
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      )}

      {/* Convert car-quote to shipment modal */}
      {convertTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => !convertLoading && !convertSuccess && setConvertTarget(null)}
        >
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" />
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-strong p-7 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {convertSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold mb-2">
                  Shipment Created Successfully
                </h2>
                <p className="text-sm text-muted-foreground mb-1">
                  The quote from{" "}
                  <span className="font-medium text-foreground">
                    {convertTarget.name}
                  </span>{" "}
                  has been converted to a shipment order.
                </p>
                <p className="text-xs text-muted-foreground mb-6">
                  A tracking email has been sent to {convertTarget.email}.
                  Status synced to the cars app.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setConvertTarget(null);
                    setSelectedSubmission(null);
                  }}
                  className="cursor-pointer btn-glass rounded-xl border-0"
                >
                  Done
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Package className="h-5 w-5 text-emerald-600" />
                      Create Shipment
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Converting quote from{" "}
                      <span className="font-medium text-foreground">
                        {convertTarget.name}
                      </span>{" "}
                      ({convertTarget.email})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConvertTarget(null)}
                    disabled={convertLoading}
                    className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {convertError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{convertError}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Customer info (read-only) */}
                  <div className="p-3 rounded-xl bg-muted/50 border border-border">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Customer
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Name:</span>{" "}
                        <span className="font-medium">{convertTarget.name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>{" "}
                        <span className="font-medium">{convertTarget.email}</span>
                      </div>
                      {convertTarget.phone && (
                        <div>
                          <span className="text-muted-foreground">Phone:</span>{" "}
                          <span className="font-medium">{convertTarget.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipment details form */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        Car Model <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={convertForm.carModel}
                        onChange={(e) =>
                          setConvertForm((f) => ({
                            ...f,
                            carModel: e.target.value,
                          }))
                        }
                        disabled={convertLoading}
                        placeholder="e.g. BYD Seal"
                        className="w-full px-3 py-2 rounded-xl bg-white/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        Car Year
                      </label>
                      <input
                        type="text"
                        value={convertForm.carYear}
                        onChange={(e) =>
                          setConvertForm((f) => ({
                            ...f,
                            carYear: e.target.value,
                          }))
                        }
                        disabled={convertLoading}
                        placeholder="2024"
                        className="w-full px-3 py-2 rounded-xl bg-white/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        VIN Number
                      </label>
                      <input
                        type="text"
                        value={convertForm.vinNumber}
                        onChange={(e) =>
                          setConvertForm((f) => ({
                            ...f,
                            vinNumber: e.target.value,
                          }))
                        }
                        disabled={convertLoading}
                        placeholder="VIN"
                        className="w-full px-3 py-2 rounded-xl bg-white/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        Origin Port
                      </label>
                      <input
                        type="text"
                        value={convertForm.originPort}
                        onChange={(e) =>
                          setConvertForm((f) => ({
                            ...f,
                            originPort: e.target.value,
                          }))
                        }
                        disabled={convertLoading}
                        placeholder="Shanghai"
                        className="w-full px-3 py-2 rounded-xl bg-white/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        Destination Port
                      </label>
                      <input
                        type="text"
                        value={convertForm.destinationPort}
                        onChange={(e) =>
                          setConvertForm((f) => ({
                            ...f,
                            destinationPort: e.target.value,
                          }))
                        }
                        disabled={convertLoading}
                        placeholder="Dubai"
                        className="w-full px-3 py-2 rounded-xl bg-white/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        Container Number
                      </label>
                      <input
                        type="text"
                        value={convertForm.containerNumber}
                        onChange={(e) =>
                          setConvertForm((f) => ({
                            ...f,
                            containerNumber: e.target.value,
                          }))
                        }
                        disabled={convertLoading}
                        placeholder="CONT-12345"
                        className="w-full px-3 py-2 rounded-xl bg-white/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        Vessel Name
                      </label>
                      <input
                        type="text"
                        value={convertForm.vesselName}
                        onChange={(e) =>
                          setConvertForm((f) => ({
                            ...f,
                            vesselName: e.target.value,
                          }))
                        }
                        disabled={convertLoading}
                        placeholder="MV Ocean Star"
                        className="w-full px-3 py-2 rounded-xl bg-white/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        Estimated Departure
                      </label>
                      <input
                        type="date"
                        value={convertForm.estimatedDeparture}
                        onChange={(e) =>
                          setConvertForm((f) => ({
                            ...f,
                            estimatedDeparture: e.target.value,
                          }))
                        }
                        disabled={convertLoading}
                        className="w-full px-3 py-2 rounded-xl bg-white/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        Estimated Arrival
                      </label>
                      <input
                        type="date"
                        value={convertForm.estimatedArrival}
                        onChange={(e) =>
                          setConvertForm((f) => ({
                            ...f,
                            estimatedArrival: e.target.value,
                          }))
                        }
                        disabled={convertLoading}
                        className="w-full px-3 py-2 rounded-xl bg-white/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        Notes
                      </label>
                      <textarea
                        value={convertForm.notes}
                        onChange={(e) =>
                          setConvertForm((f) => ({
                            ...f,
                            notes: e.target.value,
                          }))
                        }
                        disabled={convertLoading}
                        rows={2}
                        placeholder="Internal notes about this shipment..."
                        className="w-full px-3 py-2 rounded-xl bg-white/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setConvertTarget(null)}
                    disabled={convertLoading}
                    className="cursor-pointer btn-glass rounded-xl border-0"
                  >
                    Cancel
                  </Button>
                  <button
                    type="button"
                    onClick={handleConvertSubmit}
                    disabled={convertLoading}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {convertLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Package className="h-4 w-4" />
                    )}
                    {convertLoading ? "Creating..." : "Create Shipment"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}