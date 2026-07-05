"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  AlertCircle,
  Trash2,
  StickyNote,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { API_URL } from "@/lib/api";

interface Note {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

interface SubmissionNotesProps {
  submissionId: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SubmissionNotes({ submissionId }: SubmissionNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_URL}/api/admin/submissions/${submissionId}/notes`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setNotes(data.notes ?? []);
    } catch (err) {
      setError("Failed to load notes");
      console.error("Failed to fetch notes:", err);
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    // Data fetch; setState happens asynchronously after await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotes();
  }, [fetchNotes]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        `${API_URL}/api/admin/submissions/${submissionId}/notes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: trimmed }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Server returned ${res.status}`);
      setContent("");
      setNotes((prev) => [...prev, data.note]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add note");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(noteId: string) {
    setDeletingId(noteId);
    try {
      const res = await fetch(`${API_URL}/api/admin/notes/${noteId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      console.error("Failed to delete note:", err);
      setError("Failed to delete note");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="rounded-2xl bg-white/40 border border-white/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <StickyNote className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Private Notes</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {notes.length} note{notes.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : error && notes.length === 0 ? (
        <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded-lg p-3 mb-3">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {notes.length > 0 && (
        <ul className="space-y-2 mb-4 max-h-56 overflow-y-auto pr-1">
          {notes.map((note) => (
            <li
              key={note.id}
              className="group flex items-start gap-3 p-3 rounded-xl bg-white/70 border border-slate-100"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                  {note.content}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  <span className="font-medium text-foreground/70">{note.authorName}</span>
                  {" · "}
                  {formatDate(note.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(note.id)}
                disabled={deletingId === note.id}
                className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                aria-label="Delete note"
                title="Delete note"
              >
                {deletingId === note.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex flex-col gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a private note about this submission…"
          rows={3}
          className="glass-input rounded-xl border-0 resize-none text-sm"
        />
        <div className="flex items-center justify-between">
          {error && notes.length > 0 && (
            <span className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {error}
            </span>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={saving || !content.trim()}
            className="cursor-pointer rounded-xl ml-auto"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-3.5 w-3.5 mr-1" />
                Add Note
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
