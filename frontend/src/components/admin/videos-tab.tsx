"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Film,
  Plus,
  Trash2,
  Pencil,
  X,
  ExternalLink,
  Loader2,
  PlayCircle,
  Check,
  Copy,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_URL, getCsrfToken } from "@/lib/api";

interface AdminVideo {
  id: string;
  youtubeId: string;
  title: string;
  page: string;
  order: number;
  createdAt: string;
}

function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function VideosTab() {
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editVideo, setEditVideo] = useState<AdminVideo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminVideo | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formYoutubeUrl, setFormYoutubeUrl] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formPage, setFormPage] = useState<"study" | "sourcing">("study");
  const [formError, setFormError] = useState("");

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/videos`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch videos");
      const data = await res.json();
      setVideos(data.videos || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load videos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Data fetch; setState happens asynchronously after await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVideos();
  }, [fetchVideos]);

  const resetForm = () => {
    setFormYoutubeUrl("");
    setFormTitle("");
    setFormPage("study");
    setFormError("");
  };

  const openAdd = () => {
    resetForm();
    setEditVideo(null);
    setAddOpen(true);
  };

  const openEdit = (video: AdminVideo) => {
    resetForm();
    setFormYoutubeUrl(`https://www.youtube.com/watch?v=${video.youtubeId}`);
    setFormTitle(video.title);
    setFormPage(video.page as "study" | "sourcing");
    setEditVideo(video);
    setAddOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const yid = extractYoutubeId(formYoutubeUrl);
    if (!yid) {
      setFormError("Please enter a valid YouTube URL");
      return;
    }

    setActionLoading(true);
    try {
      if (editVideo) {
        const res = await fetch(`${API_URL}/api/admin/videos/${editVideo.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": getCsrfToken(),
          },
          credentials: "include",
          body: JSON.stringify({
            youtubeUrl: formYoutubeUrl,
            title: formTitle,
            page: formPage,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Failed to update video");
      } else {
        const res = await fetch(`${API_URL}/api/admin/videos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": getCsrfToken(),
          },
          credentials: "include",
          body: JSON.stringify({
            youtubeUrl: formYoutubeUrl,
            title: formTitle || undefined,
            page: formPage,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Failed to add video");
      }
      setAddOpen(false);
      resetForm();
      await fetchVideos();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/admin/videos/${deleteTarget.id}`,
        {
          method: "DELETE",
          headers: { "x-csrf-token": getCsrfToken() },
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error("Failed to delete video");
      setVideos((prev) => prev.filter((v) => v.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete video");
    } finally {
      setActionLoading(false);
    }
  };

  const moveVideo = async (video: AdminVideo, direction: "up" | "down") => {
    const pageVideos = videos
      .filter((v) => v.page === video.page)
      .sort((a, b) => a.order - b.order);
    const idx = pageVideos.findIndex((v) => v.id === video.id);
    if (idx === -1) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= pageVideos.length) return;

    const swapVideo = pageVideos[swapIdx];
    const newOrder = swapVideo.order;
    const swapNewOrder = video.order;

    try {
      await fetch(`${API_URL}/api/admin/videos/reorder`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({
          items: [
            { id: video.id, order: newOrder, page: video.page },
            { id: swapVideo.id, order: swapNewOrder, page: swapVideo.page },
          ],
        }),
      });
      await fetchVideos();
    } catch {
      // silent refresh
      await fetchVideos();
    }
  };

  const studyVideos = videos.filter((v) => v.page === "study");
  const sourcingVideos = videos.filter((v) => v.page === "sourcing");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive font-semibold">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Manage YouTube videos displayed on the Study in China and Product
            Sourcing pages.
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" />
          Add Video
        </Button>
      </div>

      <VideoGroup
        title="Study in China Videos"
        icon={<Film className="h-4 w-4" />}
        videos={studyVideos}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        onMove={moveVideo}
      />
      <VideoGroup
        title="Product Sourcing Videos"
        icon={<Film className="h-4 w-4" />}
        videos={sourcingVideos}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        onMove={moveVideo}
      />

      {/* Add/Edit Modal */}
      {addOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => !actionLoading && setAddOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-black text-xl">
                {editVideo ? "Edit Video" : "Add New Video"}
              </h2>
              <button
                onClick={() => !actionLoading && setAddOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="yt-url">YouTube URL *</Label>
                <div className="relative">
                  <PlayCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="yt-url"
                    value={formYoutubeUrl}
                    onChange={(e) => setFormYoutubeUrl(e.target.value)}
                    className="pl-9 h-11"
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                    disabled={actionLoading}
                  />
                </div>
                {extractYoutubeId(formYoutubeUrl) && (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold mt-1">
                    <Check className="h-3.5 w-3.5" />
                    Valid YouTube link detected
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="yt-title">
                  Title{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional — uses YouTube title if left blank)
                  </span>
                </Label>
                <Input
                  id="yt-title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="h-11"
                  placeholder="e.g. Studying at Tsinghua University"
                  disabled={actionLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yt-page">Show on page *</Label>
                <select
                  id="yt-page"
                  value={formPage}
                  onChange={(e) =>
                    setFormPage(e.target.value as "study" | "sourcing")
                  }
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm"
                  disabled={actionLoading}
                >
                  <option value="study">Study in China</option>
                  <option value="sourcing">Product Sourcing</option>
                </select>
              </div>

              {formError && (
                <p className="text-sm text-destructive font-semibold">
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddOpen(false)}
                  disabled={actionLoading}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="gap-2 rounded-xl"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {editVideo ? "Save Changes" : "Add Video"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => !actionLoading && setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display font-black text-xl mb-2">
              Delete Video?
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              Are you sure you want to delete &ldquo;{deleteTarget.title}&rdquo;?
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={actionLoading}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={actionLoading}
                className="gap-2 rounded-xl"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VideoGroup({
  title,
  icon,
  videos,
  onEdit,
  onDelete,
  onMove,
}: {
  title: string;
  icon: React.ReactNode;
  videos: AdminVideo[];
  onEdit: (v: AdminVideo) => void;
  onDelete: (v: AdminVideo) => void;
  onMove: (v: AdminVideo, dir: "up" | "down") => void;
}) {
  const sorted = [...videos].sort((a, b) => a.order - b.order);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <h3 className="font-bold">{title}</h3>
        <span className="ml-auto text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {videos.length} video{videos.length !== 1 ? "s" : ""}
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <Film className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No videos added yet. Click &ldquo;Add Video&rdquo; to get started.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {sorted.map((video, idx) => (
            <div
              key={video.id}
              className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
            >
              <a
                href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative shrink-0 w-24 h-14 rounded-lg overflow-hidden bg-muted group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://i.ytimg.com/vi/${video.youtubeId}/mqdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 flex items-center justify-center transition-colors">
                  <ExternalLink className="h-4 w-4 text-white" />
                </div>
              </a>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{video.title}</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {video.youtubeId}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onMove(video, "up")}
                  disabled={idx === 0}
                  className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onMove(video, "down")}
                  disabled={idx === sorted.length - 1}
                  className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onEdit(video)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(video)}
                  className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
