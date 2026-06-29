"use client";

import { useState, useMemo } from "react";
import {
  CheckCheck,
  MailOpen,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    : "";

interface Submission {
  id: string;
  submissionType: string;
  status: string;
}

interface BulkActionsProps {
  selectedIds: string[];
  submissions: Submission[];
  onClearSelection: () => void;
  onActionComplete: () => void;
}

const STUDY_STAGES = [
  { key: "submitted", label: "Submitted" },
  { key: "under_review", label: "Under Review" },
  { key: "matched", label: "University Matched" },
  { key: "verified", label: "Documents Verified" },
  { key: "decision", label: "Admission Decision" },
  { key: "visa", label: "Visa & Pre-Departure" },
];

const SOURCING_STAGES = [
  { key: "received", label: "Inquiry Received" },
  { key: "sourcing", label: "Supplier Sourcing" },
  { key: "quotes", label: "Quotes Received" },
  { key: "sample", label: "Sample Evaluation" },
  { key: "confirmed", label: "Order Confirmed" },
  { key: "shipping", label: "Shipping Arranged" },
];

function getStages(submissionType: string) {
  return submissionType === "sourcing" ? SOURCING_STAGES : STUDY_STAGES;
}

export function BulkActions({
  selectedIds,
  submissions,
  onClearSelection,
  onActionComplete,
}: BulkActionsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const selectedCount = selectedIds.length;
  const selectedSubmissions = useMemo(
    () => submissions.filter((s) => selectedIds.includes(s.id)),
    [submissions, selectedIds],
  );

  const commonType = useMemo(() => {
    const types = new Set(selectedSubmissions.map((s) => s.submissionType));
    return types.size === 1 ? selectedSubmissions[0]?.submissionType : null;
  }, [selectedSubmissions]);

  const availableStages = useMemo(() => {
    return commonType ? getStages(commonType) : [];
  }, [commonType]);

  const canUpdateStatus = selectedCount > 0 && commonType !== null;

  async function performOperation(
    operation: "mark-read" | "mark-unread" | "delete" | "update-status",
    status?: string,
  ) {
    setLoading(true);
    setError("");
    try {
      const body: Record<string, unknown> = { ids: selectedIds, operation };
      if (status) body.status = status;
      const res = await fetch(`${API_URL}/api/admin/submissions/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Server returned ${res.status}`);
      }
      onActionComplete();
      onClearSelection();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk action failed");
    } finally {
      setLoading(false);
    }
  }

  if (selectedCount === 0) return null;

  return (
    <div className="rounded-2xl bg-slate-900 text-white p-3 sm:p-4 shadow-lg animate-in slide-in-from-bottom-2 fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10">
            <CheckCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">
              {selectedCount} selected
            </p>
            <p className="text-xs text-white/60">
              Choose an action to apply
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => performOperation("mark-read")}
            disabled={loading}
            className="text-white hover:bg-white/10 hover:text-white disabled:opacity-50 cursor-pointer"
          >
            <MailOpen className="h-4 w-4 mr-1" />
            Mark read
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => performOperation("mark-unread")}
            disabled={loading}
            className="text-white hover:bg-white/10 hover:text-white disabled:opacity-50 cursor-pointer"
          >
            <Tag className="h-4 w-4 mr-1" />
            Mark unread
          </Button>

          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStatusMenuOpen((v) => !v)}
              disabled={loading || !canUpdateStatus}
              className="text-white hover:bg-white/10 hover:text-white disabled:opacity-50 cursor-pointer"
              title={
                canUpdateStatus
                  ? "Update status"
                  : "Selected submissions must be the same type"
              }
            >
              <Tag className="h-4 w-4 mr-1" />
              Update status
            </Button>
            {statusMenuOpen && canUpdateStatus && (
              <div className="absolute left-0 top-full mt-2 z-30 w-52 rounded-xl bg-white text-foreground shadow-xl border border-slate-200/60 p-1.5">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Set status
                </div>
                {availableStages.map((stage) => (
                  <button
                    key={stage.key}
                    type="button"
                    onClick={() => {
                      setStatusMenuOpen(false);
                      performOperation("update-status", stage.key);
                    }}
                    disabled={loading}
                    className="w-full text-left px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    {stage.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setConfirmDelete(true)}
            disabled={loading}
            className="text-red-300 hover:bg-red-500/20 hover:text-red-200 disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>

          <div className="w-px h-5 bg-white/20 hidden sm:block" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={loading}
            className="text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50 cursor-pointer"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 text-xs text-red-300 bg-red-500/10 rounded-lg p-2.5">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="mt-3 flex items-center gap-2 text-xs text-white/70">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Processing…
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="mt-3 p-3 rounded-xl bg-red-500/15 border border-red-400/30">
          <p className="text-sm font-medium text-red-200 mb-2">
            Delete {selectedCount} submission{selectedCount !== 1 ? "s" : ""}? This cannot be undone.
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDelete(false)}
              disabled={loading}
              className="text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                setConfirmDelete(false);
                performOperation("delete");
              }}
              disabled={loading}
              className="cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
