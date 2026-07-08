"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Pencil,
  X,
  ExternalLink,
  Loader2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Pin,
  PinOff,
  Upload,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { API_URL, getCsrfToken } from "@/lib/api";
import { BlogEditor } from "./blog-editor";

const CATEGORIES = ["Study in China", "Product Sourcing", "Guide"] as const;
const MAX_IMAGES = 3;

interface AdminBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  tags: string[];
  content: string;
  imageUrl: string | null;
  order: number;
  published: boolean;
  pinned: boolean;
  createdAt: string;
}

export function BlogTab() {
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBlogPost | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminBlogPost | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Form state
  const [formSlug, setFormSlug] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formCategory, setFormCategory] = useState<string>("Guide");
  const [formAuthor, setFormAuthor] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formError, setFormError] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/blog`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch blog posts");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load blog posts",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      fetchPosts();
    }, 0);
    return () => clearTimeout(id);
  }, [fetchPosts]);

  const resetForm = () => {
    setFormSlug("");
    setFormTitle("");
    setFormExcerpt("");
    setFormCategory("Guide");
    setFormAuthor("");
    setFormTags("");
    setFormContent("");
    setFormImageUrl("");
    setFormError("");
  };

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!editing) {
      setFormSlug(slugify(val));
    }
  };

  const countContentImages = (html: string): number => {
    const matches = html.match(/<img[^>]+src="([^"]+)"/g);
    return matches ? matches.length : 0;
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/api/upload/single`, {
        method: "POST",
        headers: { "x-csrf-token": getCsrfToken() },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }

      const data = await res.json();
      setFormImageUrl(data.url);
      toast.success("Featured image uploaded");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload image",
      );
    } finally {
      setImageUploading(false);
    }
  };

  const openAdd = () => {
    resetForm();
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (post: AdminBlogPost) => {
    setFormSlug(post.slug);
    setFormTitle(post.title);
    setFormExcerpt(post.excerpt);
    setFormCategory(post.category);
    setFormAuthor(post.author);
    setFormTags(post.tags.join(", "));
    setFormContent(typeof post.content === "string" ? post.content : "");
    setFormImageUrl(post.imageUrl || "");
    setEditing(post);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formSlug.trim() || !formTitle.trim()) {
      setFormError("Slug and title are required");
      return;
    }

    if (!formContent.trim()) {
      setFormError("Content is required");
      return;
    }

    // Check image count (content images + featured image)
    const contentImages = countContentImages(formContent);
    if (contentImages > MAX_IMAGES) {
      setFormError(`Max ${MAX_IMAGES} images allowed in content (found ${contentImages})`);
      return;
    }

    const tags = formTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setActionLoading(true);
    try {
      const body = {
        slug: formSlug.trim(),
        title: formTitle.trim(),
        excerpt: formExcerpt.trim(),
        category: formCategory,
        author: formAuthor.trim(),
        tags,
        content: formContent,
        imageUrl: formImageUrl || null,
      };

      if (editing) {
        const res = await fetch(`${API_URL}/api/admin/blog/${editing.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": getCsrfToken(),
          },
          credentials: "include",
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Failed to update post");
        toast.success("Blog post updated");
      } else {
        const res = await fetch(`${API_URL}/api/admin/blog`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": getCsrfToken(),
          },
          credentials: "include",
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Failed to create post");
        toast.success("Blog post created");
      }

      setModalOpen(false);
      resetForm();
      await fetchPosts();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePublish = async (post: AdminBlogPost) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/blog/${post.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({ published: !post.published }),
      });
      if (!res.ok) throw new Error("Failed to toggle publish status");
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, published: !p.published } : p,
        ),
      );
      toast.success(post.published ? "Post unpublished" : "Post published");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update post",
      );
    }
  };

  const handleTogglePin = async (post: AdminBlogPost) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/blog/${post.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({ pinned: !post.pinned }),
      });
      if (!res.ok) throw new Error("Failed to toggle pin status");
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, pinned: !p.pinned } : p,
        ),
      );
      toast.success(post.pinned ? "Post unpinned" : "Post pinned");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update post",
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/blog/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { "x-csrf-token": getCsrfToken() },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete post");
      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("Blog post deleted");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete post",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/blog/seed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Seed failed");
      toast.success(data.message || "Static posts seeded");
      await fetchPosts();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to seed posts",
      );
    } finally {
      setSeeding(false);
    }
  };

  const movePost = async (post: AdminBlogPost, direction: "up" | "down") => {
    const sorted = [...posts].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((p) => p.id === post.id);
    if (idx === -1) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const swapPost = sorted[swapIdx];

    try {
      const res = await fetch(`${API_URL}/api/admin/blog/reorder`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({
          items: [
            { id: post.id, order: swapPost.order },
            { id: swapPost.id, order: post.order },
          ],
        }),
      });
      if (!res.ok) throw new Error("Reorder failed");
      await fetchPosts();
    } catch {
      await fetchPosts();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Sort: pinned first, then by order
  const sorted = [...posts].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return a.order - b.order;
  });

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
            Manage blog posts displayed on the Resources page. Published posts
            are visible to visitors. Pin posts for quick access.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {sorted.length === 0 && (
            <Button
              onClick={handleSeed}
              disabled={seeding}
              variant="outline"
              className="gap-2 rounded-xl"
            >
              {seeding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Seed Static Posts
            </Button>
          )}
          <Button onClick={openAdd} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            No blog posts yet. Click &ldquo;Seed Static Posts&rdquo; to add the 4 default posts, or create one manually.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={handleSeed} disabled={seeding} variant="outline" className="rounded-xl">
              {seeding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Seed Static Posts
            </Button>
            <Button onClick={openAdd} className="rounded-xl gap-2">
              <Plus className="h-4 w-4" />
              Create Post
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {sorted.map((post, idx) => (
              <div
                key={post.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover shrink-0"
                      />
                    )}
                    {post.pinned && (
                      <Pin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    )}
                    <span className="font-semibold text-sm truncate">
                      {post.title}
                    </span>
                    {!post.published && (
                      <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                        <EyeOff className="h-3 w-3" />
                        Draft
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{post.category}</span>
                    <span>·</span>
                    <span>{post.date}</span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                    <span>·</span>
                    <a
                      href={`/resources/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => movePost(post, "up")}
                    disabled={idx === 0}
                    className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => movePost(post, "down")}
                    disabled={idx === sorted.length - 1}
                    className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleTogglePin(post)}
                    className={`p-2 rounded-lg hover:bg-muted transition-colors ${post.pinned ? "text-amber-500" : ""}`}
                    title={post.pinned ? "Unpin" : "Pin"}
                  >
                    {post.pinned ? (
                      <PinOff className="h-4 w-4" />
                    ) : (
                      <Pin className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleTogglePublish(post)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    title={post.published ? "Unpublish" : "Publish"}
                  >
                    {post.published ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => openEdit(post)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(post)}
                    className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => !actionLoading && setModalOpen(false)}
        >
          <div
            className="w-full max-w-4xl my-8 rounded-2xl bg-card border border-border p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-black text-xl">
                {editing ? "Edit Post" : "New Blog Post"}
              </h2>
              <button
                onClick={() => !actionLoading && setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="blog-title">Title *</Label>
                  <Input
                    id="blog-title"
                    value={formTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="h-11"
                    placeholder="e.g. The Complete Guide to Studying in China"
                    required
                    disabled={actionLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blog-slug">
                    Slug *{" "}
                    <span className="text-muted-foreground font-normal">
                      (auto-generated from title)
                    </span>
                  </Label>
                  <Input
                    id="blog-slug"
                    value={formSlug}
                    onChange={(e) => setFormSlug(slugify(e.target.value))}
                    className="h-11"
                    placeholder="url-friendly-slug"
                    required
                    disabled={actionLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="blog-category">Category *</Label>
                  <select
                    id="blog-category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm"
                    disabled={actionLoading}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blog-author">Author *</Label>
                  <Input
                    id="blog-author"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="h-11"
                    placeholder="e.g. 86 Connect Education Team"
                    required
                    disabled={actionLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="blog-tags">
                  Tags{" "}
                  <span className="text-muted-foreground font-normal">
                    (comma-separated)
                  </span>
                </Label>
                <Input
                  id="blog-tags"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="h-11"
                  placeholder="e.g. study abroad, scholarships"
                  disabled={actionLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="blog-excerpt">Excerpt *</Label>
                <Input
                  id="blog-excerpt"
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  className="h-11"
                  placeholder="A short summary of the post (shown on the listing page)"
                  required
                  disabled={actionLoading}
                />
              </div>

              <div className="text-xs text-muted-foreground">
                Date and read time are auto-generated based on current time and content length.
              </div>

              {/* Featured Image */}
              <div className="space-y-2">
                <Label>Featured Image (max 1, shown on homepage)</Label>
                <div className="flex items-center gap-3">
                  {formImageUrl && (
                    <img
                      src={formImageUrl}
                      alt="Featured"
                      className="w-16 h-16 rounded-xl object-cover border border-border"
                    />
                  )}
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors cursor-pointer text-sm font-medium">
                    {imageUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {formImageUrl ? "Change Image" : "Upload Image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFeaturedImageUpload}
                      disabled={imageUploading}
                    />
                  </label>
                  {formImageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormImageUrl("")}
                      className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Rich Text Editor */}
              <div className="space-y-2">
                <Label>
                  Content *{" "}
                  <span className="text-muted-foreground font-normal text-xs">
                    (max {MAX_IMAGES} images in content, upload via toolbar)
                  </span>
                </Label>
                <BlogEditor
                  content={formContent}
                  onChange={setFormContent}
                  disabled={actionLoading}
                  maxImages={MAX_IMAGES}
                />
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
                  onClick={() => setModalOpen(false)}
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
                  ) : editing ? (
                    <Pencil className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {editing ? "Save Changes" : "Create Post"}
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
              Delete Post?
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