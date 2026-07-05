"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  RefreshCw,
  Loader2,
  Mail,
  Phone,
  Clock,
  Search,
  Inbox,
  AlertCircle,
  Eye,
  Trash2,
  X,
  User,
  UserPlus,
  KeyRound,
  Pencil,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileWarning,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { TableSkeleton } from "@/components/ui/skeleton";
import { API_URL } from "@/lib/api";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  createdAt: string;
  submissionCount: number;
}

interface UserStats {
  total: number;
  thisMonth: number;
  withPhone: number;
}

interface DeletedUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  createdAt: string;
  deletedAt: string | null;
  submissionCount: number;
  daysUntilPurge: number;
}

interface TrashStats {
  softDeletedUsers: number;
  softDeletedSubmissions: number;
  softDeletedConsultations: number;
}

interface PurgeResult {
  purged: {
    users: number;
    submissions: number;
    consultations: number;
    files: number;
  };
}

interface UsersTabProps {
  active: boolean;
  onSearchSubmissions?: (search: string) => void;
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

export default function UsersTab({ active, onSearchSubmissions }: UsersTabProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    thisMonth: 0,
    withPhone: 0,
  });
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState("");
  const [userSearch, setUserSearch] = useState("");

  // Edit user
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Reset password
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Create user
  const [createOpen, setCreateOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createName, setCreateName] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Delete user
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);

  // View user
  const [viewUser, setViewUser] = useState<User | null>(null);

  // Trash view
  const [trashView, setTrashView] = useState(false);
  const [deletedUsers, setDeletedUsers] = useState<DeletedUser[]>([]);
  const [trashLoading, setTrashLoading] = useState(false);
  const [trashError, setTrashError] = useState("");
  const [purgingIds, setPurgingIds] = useState<string[]>([]);
  const [purgeAllLoading, setPurgeAllLoading] = useState(false);

  // Cleanup modal
  const [cleanupOpen, setCleanupOpen] = useState(false);
  const [cleanupStats, setCleanupStats] = useState<TrashStats | null>(null);
  const [cleanupStatsLoading, setCleanupStatsLoading] = useState(false);
  const [cleanupPurgeLoading, setCleanupPurgeLoading] = useState(false);
  const [cleanOrphansLoading, setCleanOrphansLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setUserLoading(true);
    setUserError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const data = await res.json();
      setUsers(data.users ?? data);
      if (data.stats) {
        setUserStats(data.stats);
      }
    } catch (err) {
      setUserError("Failed to load users. Please try refreshing.");
      console.error("Failed to fetch users:", err);
    } finally {
      setUserLoading(false);
    }
  }, []);

  useEffect(() => {
    if (active) {
      // Data fetch; setState happens asynchronously after await.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchUsers();
    }
  }, [active, fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;
    const q = userSearch.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q)),
    );
  }, [users, userSearch]);

  const openEdit = (u: User) => {
    setUserError("");
    setEditUser(u);
    setEditName(u.name);
    setEditPhone(u.phone || "");
  };

  const openReset = (u: User) => {
    setUserError("");
    setResetUser(u);
    setResetPassword("");
  };

  const openCreate = () => {
    setUserError("");
    setCreateOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setUserError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: createEmail,
          name: createName,
          phone: createPhone,
          password: createPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Server returned ${res.status}`);
      }
      setUsers((prev) => [data.user, ...prev]);
      setCreateOpen(false);
      setCreateEmail("");
      setCreateName("");
      setCreatePhone("");
      setCreatePassword("");
    } catch (err) {
      setUserError(
        err instanceof Error ? err.message : "Failed to create user",
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setEditLoading(true);
    setUserError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Server returned ${res.status}`);
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === data.user.id ? data.user : u)),
      );
      setEditUser(null);
    } catch (err) {
      setUserError(
        err instanceof Error ? err.message : "Failed to update user",
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUser) return;
    setResetLoading(true);
    setUserError("");
    try {
      const res = await fetch(
        `${API_URL}/api/admin/users/${resetUser.id}/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ password: resetPassword }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Server returned ${res.status}`);
      }
      setResetUser(null);
      setResetPassword("");
    } catch (err) {
      setUserError(
        err instanceof Error ? err.message : "Failed to reset password",
      );
    } finally {
      setResetLoading(false);
    }
  };

  const handleDeleteUser = useCallback(async () => {
    if (!deleteUser) return;
    setDeleteUserLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${deleteUser.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
      setUserStats((prev) => ({
        ...prev,
        total: prev.total - 1,
      }));
      setDeleteUser(null);
    } catch (err) {
      setUserError(
        err instanceof Error ? err.message : "Failed to delete user",
      );
      console.error("Failed to delete user:", err);
    } finally {
      setDeleteUserLoading(false);
    }
  }, [deleteUser]);

  const fetchDeletedUsers = useCallback(async () => {
    setTrashLoading(true);
    setTrashError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/users/deleted`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const data = await res.json();
      setDeletedUsers(data.users ?? data ?? []);
    } catch (err) {
      setTrashError("Failed to load deleted users. Please try refreshing.");
      console.error("Failed to fetch deleted users:", err);
    } finally {
      setTrashLoading(false);
    }
  }, []);

  const fetchTrashStats = useCallback(async () => {
    setCleanupStatsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/trash/stats`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const data = await res.json();
      setCleanupStats(data);
    } catch (err) {
      console.error("Failed to fetch trash stats:", err);
      toast.error("Failed to load trash statistics");
    } finally {
      setCleanupStatsLoading(false);
    }
  }, []);

  const toggleTrashView = useCallback(() => {
    setTrashView((prev) => {
      const next = !prev;
      if (next) {
        fetchDeletedUsers();
      }
      return next;
    });
  }, [fetchDeletedUsers]);

  const handlePurgeUser = useCallback(
    async (userId: string) => {
      setPurgingIds((prev) => [...prev, userId]);
      try {
        const res = await fetch(`${API_URL}/api/admin/users/bulk-purge`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ids: [userId] }),
        });
        const data = (await res.json().catch(() => ({}))) as PurgeResult;
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }
        setDeletedUsers((prev) => prev.filter((u) => u.id !== userId));
        const purged = data?.purged;
        toast.success("User purged", {
          description: purged
            ? `Removed ${purged.users} user(s), ${purged.submissions} submission(s), ${purged.consultations} consultation(s), ${purged.files} file(s).`
            : "Soft-deleted records permanently removed.",
        });
      } catch (err) {
        console.error("Failed to purge user:", err);
        toast.error("Failed to purge user");
      } finally {
        setPurgingIds((prev) => prev.filter((id) => id !== userId));
      }
    },
    [],
  );

  const handlePurgeAll = useCallback(async () => {
    setPurgeAllLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/users/bulk-purge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      const data = (await res.json().catch(() => ({}))) as PurgeResult;
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const count = deletedUsers.length;
      setDeletedUsers([]);
      const purged = data?.purged;
      toast.success("All soft-deleted users purged", {
        description: purged
          ? `Removed ${purged.users} user(s), ${purged.submissions} submission(s), ${purged.consultations} consultation(s), ${purged.files} file(s).`
          : `${count} user(s) permanently removed.`,
      });
    } catch (err) {
      console.error("Failed to purge all users:", err);
      toast.error("Failed to purge all users");
    } finally {
      setPurgeAllLoading(false);
    }
  }, [deletedUsers.length]);

  const openCleanup = useCallback(() => {
    setCleanupOpen(true);
    fetchTrashStats();
  }, [fetchTrashStats]);

  const handleCleanupPurgeAll = useCallback(async () => {
    setCleanupPurgeLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/users/bulk-purge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      const data = (await res.json().catch(() => ({}))) as PurgeResult;
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const purged = data?.purged;
      toast.success("Soft-deleted records purged", {
        description: purged
          ? `Removed ${purged.users} user(s), ${purged.submissions} submission(s), ${purged.consultations} consultation(s), ${purged.files} file(s).`
          : "All soft-deleted records permanently removed.",
      });
      // Refresh stats and trash view if open
      fetchTrashStats();
      if (trashView) {
        fetchDeletedUsers();
      }
    } catch (err) {
      console.error("Failed to purge all:", err);
      toast.error("Failed to purge soft-deleted records");
    } finally {
      setCleanupPurgeLoading(false);
    }
  }, [fetchTrashStats, fetchDeletedUsers, trashView]);

  const handleCleanOrphans = useCallback(async () => {
    setCleanOrphansLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/admin/submissions/cleanup-orphans`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Server returned ${res.status}`);
      }
      const removed = data?.deleted ?? data?.removed ?? data?.count;
      toast.success("Orphan files cleaned", {
        description:
          typeof removed === "number"
            ? `${removed} orphan file(s) removed.`
            : "Orphan file cleanup complete.",
      });
    } catch (err) {
      console.error("Failed to clean orphan files:", err);
      toast.error("Failed to clean orphan files");
    } finally {
      setCleanOrphansLoading(false);
    }
  }, []);

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-6 rounded-2xl glass-card glass-card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground font-medium">
              Total Users
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100/60 flex items-center justify-center">
              <User className="h-5 w-5 text-slate-500" />
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight">
            {userStats.total}
          </p>
        </div>
        <div className="p-6 rounded-2xl glass-card glass-card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground font-medium">
              This Month
            </span>
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight">
            {userStats.thisMonth}
          </p>
        </div>
        <div className="p-6 rounded-2xl glass-card glass-card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground font-medium">
              With Phone
            </span>
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <Phone className="h-5 w-5 text-accent" />
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight">
            {userStats.withPhone}
          </p>
        </div>
      </div>

      {/* Users toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {trashView ? (
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50/60 border border-red-200/60">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
            <span className="text-sm font-medium text-red-700">
              Viewing soft-deleted users — these records will be permanently
              purged after their retention window.
            </span>
          </div>
        ) : (
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email, or phone..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="pl-10 glass-input rounded-xl border-0"
              aria-label="Search users"
            />
          </div>
        )}
        {trashView ? (
          <Button
            variant="destructive"
            onClick={handlePurgeAll}
            disabled={purgeAllLoading || deletedUsers.length === 0}
            className="cursor-pointer shrink-0 rounded-xl"
          >
            {purgeAllLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Purge All
          </Button>
        ) : (
          <Button
            onClick={openCreate}
            className="cursor-pointer shrink-0 rounded-xl"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        )}
        <Button
          variant={trashView ? "default" : "outline"}
          onClick={toggleTrashView}
          className="cursor-pointer shrink-0 rounded-xl"
        >
          <Trash2 className="h-4 w-4" />
          {trashView ? "Active Users" : "Trash"}
        </Button>
        <Button
          variant="outline"
          onClick={openCleanup}
          className="cursor-pointer shrink-0 btn-glass rounded-xl border-0 hover:bg-white/95"
        >
          <FileWarning className="h-4 w-4" />
          Cleanup
        </Button>
        <Button
          variant="outline"
          onClick={trashView ? fetchDeletedUsers : fetchUsers}
          disabled={trashView ? trashLoading : userLoading}
          className="cursor-pointer shrink-0 btn-glass rounded-xl border-0 hover:bg-white/95"
        >
          <RefreshCw
            className={cn(
              "h-4 w-4",
              (trashView ? trashLoading : userLoading) && "animate-spin",
            )}
          />
          Refresh
        </Button>
      </div>

      {/* Users table / Trash table */}
      <div className="rounded-2xl glass-card overflow-hidden">
        {trashView
          ? trashLoading ? (
              <div className="p-6">
                <TableSkeleton rows={5} />
              </div>
            ) : trashError ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
                  <AlertCircle className="h-7 w-7 text-destructive" />
                </div>
                <p className="text-destructive font-medium mb-1">
                  {trashError}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchDeletedUsers}
                  className="mt-3 cursor-pointer btn-glass rounded-xl border-0"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              </div>
            ) : deletedUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>
                <p className="text-muted-foreground">
                  Trash is empty. No soft-deleted users.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">
                    Soft-deleted users — {deletedUsers.length} total
                  </caption>
                  <thead>
                    <tr className="border-b border-slate-200/60 bg-white/30">
                      <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-3.5">
                        Name
                      </th>
                      <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-3.5">
                        Email
                      </th>
                      <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-3.5 whitespace-nowrap">
                        Deleted Date
                      </th>
                      <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-3.5 whitespace-nowrap text-center">
                        Submissions
                      </th>
                      <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-3.5 whitespace-nowrap text-center">
                        Days Until Purge
                      </th>
                      <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-3.5 w-32">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedUsers.map((u) => {
                      const isPurging = purgingIds.includes(u.id);
                      return (
                        <tr
                          key={u.id}
                          className="border-b border-slate-100/60 last:border-0 glass-row"
                        >
                          <td className="px-5 py-4 font-medium">{u.name}</td>
                          <td className="px-5 py-4">
                            <a
                              href={`mailto:${u.email}`}
                              className="inline-flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors"
                            >
                              <Mail className="h-3 w-3" />
                              {u.email}
                            </a>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {u.deletedAt ? formatDate(u.deletedAt) : "—"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span
                              className={
                                "inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold " +
                                (u.submissionCount > 0
                                  ? "bg-accent/15 text-accent"
                                  : "bg-slate-100 text-muted-foreground")
                              }
                            >
                              <Inbox className="h-3 w-3" />
                              {u.submissionCount}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span
                              className={
                                "inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold " +
                                (u.daysUntilPurge <= 1
                                  ? "bg-red-100 text-red-700"
                                  : u.daysUntilPurge <= 3
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-slate-100 text-muted-foreground")
                              }
                            >
                              {u.daysUntilPurge} day
                              {u.daysUntilPurge === 1 ? "" : "s"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handlePurgeUser(u.id)}
                              disabled={isPurging}
                              className="cursor-pointer rounded-xl"
                            >
                              {isPurging ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4" />
                                  Purge Now
                                </>
                              )}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          : userLoading ? (
              <div className="p-6">
                <TableSkeleton rows={5} />
              </div>
            ) : userError ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
                  <AlertCircle className="h-7 w-7 text-destructive" />
                </div>
                <p className="text-destructive font-medium mb-1">{userError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchUsers}
                  className="mt-3 cursor-pointer btn-glass rounded-xl border-0"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              </div>
            ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100/60 flex items-center justify-center mb-4">
              <User className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground">
              {users.length === 0
                ? "No users yet."
                : "No users match your search."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Registered users — {filteredUsers.length} of {users.length}{" "}
                total
              </caption>
              <thead>
                <tr className="border-b border-slate-200/60 bg-white/30">
                  <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-3.5">
                    Name
                  </th>
                  <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-3.5">
                    Email
                  </th>
                  <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-3.5 hidden md:table-cell">
                    Phone
                  </th>
                  <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-3.5 whitespace-nowrap text-center">
                    Submissions
                  </th>
                  <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-3.5 whitespace-nowrap">
                    Created
                  </th>
                  <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-3.5 w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-100/60 last:border-0 glass-row"
                  >
                    <td className="px-5 py-4 font-medium">{u.name}</td>
                    <td className="px-5 py-4">
                      <a
                        href={`mailto:${u.email}`}
                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors"
                      >
                        <Mail className="h-3 w-3" />
                        {u.email}
                      </a>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      {u.phone ? (
                        <a
                          href={`tel:${u.phone}`}
                          className="inline-flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors"
                        >
                          <Phone className="h-3 w-3" />
                          {u.phone}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={
                          "inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold " +
                          (u.submissionCount > 0
                            ? "bg-accent/15 text-accent"
                            : "bg-slate-100 text-muted-foreground")
                        }
                      >
                        <Inbox className="h-3 w-3" />
                        {u.submissionCount}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(u.createdAt)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setViewUser(u)}
                          className="p-2 rounded-lg hover:bg-white/60 transition-colors cursor-pointer"
                          aria-label="View user"
                          title="View user details"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          className="p-2 rounded-lg hover:bg-white/60 transition-colors cursor-pointer"
                          aria-label="Edit user"
                          title="Edit user"
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openReset(u)}
                          className="p-2 rounded-lg hover:bg-white/60 transition-colors cursor-pointer"
                          aria-label="Reset password"
                          title="Reset password"
                        >
                          <KeyRound className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteUser(u)}
                          className="p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          aria-label="Delete user"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit user modal */}
      {editUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setEditUser(null)}
        >
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" />
          <div
            className="relative w-full max-w-md rounded-3xl glass-strong p-7 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Edit User</h2>
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <Label
                  htmlFor="edit-name"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  minLength={2}
                  className="glass-input rounded-xl border-0 mt-1.5"
                />
              </div>
              <div>
                <Label
                  htmlFor="edit-phone"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Phone
                </Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="glass-input rounded-xl border-0 mt-1.5"
                />
              </div>
              {userError && (
                <p className="text-sm text-destructive">{userError}</p>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditUser(null)}
                  disabled={editLoading}
                  className="cursor-pointer btn-glass rounded-xl border-0"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editLoading}
                  className="cursor-pointer rounded-xl"
                >
                  {editLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset password modal */}
      {resetUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setResetUser(null)}
        >
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" />
          <div
            className="relative w-full max-w-md rounded-3xl glass-strong p-7 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Reset Password</h2>
              <button
                type="button"
                onClick={() => setResetUser(null)}
                className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Set a new password for{" "}
              <span className="font-medium text-foreground">
                {resetUser.name}
              </span>
              .
            </p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label
                  htmlFor="reset-password"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  New Password
                </Label>
                <Input
                  id="reset-password"
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  required
                  minLength={8}
                  className="glass-input rounded-xl border-0 mt-1.5"
                />
              </div>
              {userError && (
                <p className="text-sm text-destructive">{userError}</p>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setResetUser(null)}
                  disabled={resetLoading}
                  className="cursor-pointer btn-glass rounded-xl border-0"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={resetLoading}
                  className="cursor-pointer rounded-xl"
                >
                  {resetLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create user modal */}
      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setCreateOpen(false)}
        >
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" />
          <div
            className="relative w-full max-w-md rounded-3xl glass-strong p-7 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create New User</h2>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <Label
                  htmlFor="create-name"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Name
                </Label>
                <Input
                  id="create-name"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  required
                  minLength={2}
                  className="glass-input rounded-xl border-0 mt-1.5"
                />
              </div>
              <div>
                <Label
                  htmlFor="create-email"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Email
                </Label>
                <Input
                  id="create-email"
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  required
                  className="glass-input rounded-xl border-0 mt-1.5"
                />
              </div>
              <div>
                <Label
                  htmlFor="create-phone"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Phone
                </Label>
                <Input
                  id="create-phone"
                  type="tel"
                  value={createPhone}
                  onChange={(e) => setCreatePhone(e.target.value)}
                  className="glass-input rounded-xl border-0 mt-1.5"
                />
              </div>
              <div>
                <Label
                  htmlFor="create-password"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Password
                </Label>
                <Input
                  id="create-password"
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  required
                  minLength={8}
                  className="glass-input rounded-xl border-0 mt-1.5"
                />
              </div>
              {userError && (
                <p className="text-sm text-destructive">{userError}</p>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                  disabled={createLoading}
                  className="cursor-pointer btn-glass rounded-xl border-0"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createLoading}
                  className="cursor-pointer rounded-xl"
                >
                  {createLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create User"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View user details modal */}
      {viewUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setViewUser(null)}
        >
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" />
          <div
            className="relative w-full max-w-md rounded-3xl glass-strong p-7 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">User Details</h2>
              <button
                type="button"
                onClick={() => setViewUser(null)}
                className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                <User className="h-7 w-7 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-lg">{viewUser.name}</p>
                <a
                  href={`mailto:${viewUser.email}`}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {viewUser.email}
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Phone</span>
                <span className="text-sm font-medium">
                  {viewUser.phone ? (
                    <a
                      href={`tel:${viewUser.phone}`}
                      className="text-muted-foreground hover:text-accent transition-colors"
                    >
                      {viewUser.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm font-medium">
                  {formatDate(viewUser.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Submissions
                </span>
                <span
                  className={
                    "inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold " +
                    (viewUser.submissionCount > 0
                      ? "bg-accent/15 text-accent"
                      : "bg-muted/50 text-muted-foreground")
                  }
                >
                  <Inbox className="h-3 w-3" />
                  {viewUser.submissionCount}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">User ID</span>
                <span className="text-xs font-mono text-muted-foreground">
                  {viewUser.id.slice(0, 8)}…
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex gap-2 justify-end">
              {viewUser.submissionCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (onSearchSubmissions) {
                      onSearchSubmissions(viewUser.email);
                    }
                    setViewUser(null);
                    window.location.hash = "#submissions";
                  }}
                  className="cursor-pointer btn-glass rounded-xl border-0"
                >
                  <Inbox className="h-4 w-4" />
                  Submissions
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setViewUser(null);
                  openEdit(viewUser);
                }}
                className="cursor-pointer btn-glass rounded-xl border-0"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setViewUser(null);
                  openReset(viewUser);
                }}
                className="cursor-pointer btn-glass rounded-xl border-0"
              >
                <KeyRound className="h-4 w-4" />
                Reset PW
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  const u = viewUser;
                  setViewUser(null);
                  setDeleteUser(u);
                }}
                className="cursor-pointer rounded-xl"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete user confirmation modal */}
      {deleteUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteUser(null)}
        >
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" />
          <div
            className="relative w-full max-w-sm rounded-3xl glass-strong p-7 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-2">Delete user?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              This will permanently remove the user{" "}
              <span className="font-medium text-foreground">
                {deleteUser.name}
              </span>
              . Their submissions will remain but be unlinked. This action
              cannot be undone.
            </p>
            {userError && (
              <p className="text-sm text-destructive mb-4">{userError}</p>
            )}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteUser(null)}
                disabled={deleteUserLoading}
                className="cursor-pointer btn-glass rounded-xl border-0"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={deleteUserLoading}
                className="cursor-pointer rounded-xl"
              >
                {deleteUserLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete User"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Data cleanup modal */}
      {cleanupOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setCleanupOpen(false)}
        >
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" />
          <div
            className="relative w-full max-w-md rounded-3xl glass-strong p-7 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                  <FileWarning className="h-5 w-5 text-amber-600" />
                </div>
                <h2 className="text-lg font-semibold">Data Cleanup</h2>
              </div>
              <button
                type="button"
                onClick={() => setCleanupOpen(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {cleanupStatsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : cleanupStats ? (
              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-50/60 border border-slate-200/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Soft-deleted users
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {cleanupStats.softDeletedUsers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Soft-deleted submissions
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {cleanupStats.softDeletedSubmissions}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Soft-deleted consultations
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {cleanupStats.softDeletedConsultations}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-red-50/60 border border-red-200/60 p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">
                      Purging permanently removes soft-deleted users, their
                      submissions, consultations, and associated files. This
                      action cannot be undone.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleCleanupPurgeAll}
                    disabled={
                      cleanupPurgeLoading ||
                      (cleanupStats.softDeletedUsers === 0 &&
                        cleanupStats.softDeletedSubmissions === 0 &&
                        cleanupStats.softDeletedConsultations === 0)
                    }
                    className="cursor-pointer rounded-xl w-full"
                  >
                    {cleanupPurgeLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Purge All Soft-deleted Records
                      </>
                    )}
                  </Button>
                </div>

                <div className="rounded-2xl bg-amber-50/60 border border-amber-200/60 p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <FileWarning className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      Remove uploaded files that are no longer referenced by any
                      submission.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleCleanOrphans}
                    disabled={cleanOrphansLoading}
                    className="cursor-pointer btn-glass rounded-xl w-full border-0 hover:bg-white/95"
                  >
                    {cleanOrphansLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <FileWarning className="h-4 w-4" />
                        Clean Orphan Files
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Failed to load cleanup statistics.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchTrashStats}
                  className="mt-3 cursor-pointer btn-glass rounded-xl border-0"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              </div>
            )}

            <div className="flex justify-end pt-4 mt-2 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setCleanupOpen(false)}
                className="cursor-pointer btn-glass rounded-xl border-0"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}