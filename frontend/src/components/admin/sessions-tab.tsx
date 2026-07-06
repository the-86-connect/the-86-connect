"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LogOut,
  RefreshCw,
  Loader2,
  Clock,
  Trash2,
  MonitorSmartphone,
  Globe,
  Monitor,
  Smartphone,
  CheckCircle2,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TableSkeleton } from "@/components/ui/skeleton";
import { API_URL, getCsrfToken } from "@/lib/api";

interface AdminSession {
  sessionId: string;
  ip: string;
  userAgent: string;
  loginTime: number;
  expiresAt: number;
  isCurrent: boolean;
}

interface SessionsTabProps {
  active: boolean;
  onLogout: () => void;
}

function formatEpochMs(ms: number): string {
  return new Date(ms).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function parseUserAgent(ua: string): {
  deviceIcon: "smartphone" | "monitor" | "unknown";
  deviceLabel: string;
  browser: string;
  os: string;
} {
  if (!ua || ua === "unknown") {
    return {
      deviceIcon: "unknown",
      deviceLabel: "Unknown device",
      browser: "Unknown",
      os: "Unknown",
    };
  }

  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(ua);
  const isTablet = /iPad|Tablet/i.test(ua);

  let browser = "Unknown";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";

  let os = "Unknown";
  if (/Windows NT 10/i.test(ua)) os = "Windows";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  let deviceLabel = "Desktop";
  let deviceIcon: "smartphone" | "monitor" | "unknown" = "monitor";
  if (isTablet) {
    deviceLabel = "Tablet";
    deviceIcon = "smartphone";
  } else if (isMobile) {
    deviceLabel = "Mobile";
    deviceIcon = "smartphone";
  }

  return { deviceIcon, deviceLabel, browser, os };
}

export default function SessionsTab({ active, onLogout }: SessionsTabProps) {
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [sessionsMax, setSessionsMax] = useState(4);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState("");
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/sessions`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const data = await res.json();
      setSessions(data.sessions ?? []);
      setSessionsMax(data.maxSessions ?? 4);
    } catch (err) {
      setSessionsError("Failed to load sessions. Please try refreshing.");
      console.error("Failed to fetch sessions:", err);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (active) {
      // Data fetch; setState happens asynchronously after await.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchSessions();
    }
  }, [active, fetchSessions]);

  const handleRevokeSession = useCallback(async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      const res = await fetch(`${API_URL}/api/admin/sessions/${sessionId}`, {
        method: "DELETE",
        headers: { "x-csrf-token": getCsrfToken() },
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
    } catch (err) {
      console.error("Failed to revoke session:", err);
      setSessionsError("Failed to revoke session. Please try again.");
    } finally {
      setRevokingId(null);
    }
  }, []);

  const handleRevokeOthers = useCallback(async () => {
    setRevokingAll(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/sessions/revoke-others`, {
        method: "POST",
        headers: { "x-csrf-token": getCsrfToken() },
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      await fetchSessions();
    } catch (err) {
      console.error("Failed to revoke other sessions:", err);
      setSessionsError("Failed to revoke other sessions. Please try again.");
    } finally {
      setRevokingAll(false);
    }
  }, [fetchSessions]);

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-6 rounded-2xl glass-card glass-card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground font-medium">
              Active Devices
            </span>
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <MonitorSmartphone className="h-5 w-5 text-accent" />
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight">
            {sessions.length}
            <span className="text-base text-muted-foreground font-normal">
              {" "}
              / {sessionsMax}
            </span>
          </p>
        </div>
        <div className="p-6 rounded-2xl glass-card glass-card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground font-medium">
              This Device
            </span>
            <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <p className="text-lg font-semibold tracking-tight">
            {sessions.find((s) => s.isCurrent)
              ? `Signed in ${timeAgo(
                  sessions.find((s) => s.isCurrent)!.loginTime,
                )}`
              : "Not found"}
          </p>
        </div>
        <div className="p-6 rounded-2xl glass-card glass-card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground font-medium">
              Limit
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100/60 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-slate-500" />
            </div>
          </div>
          <p className="text-lg font-semibold tracking-tight">
            Max {sessionsMax} devices
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Oldest device is auto-signed out when exceeded
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Active Sessions
          </h2>
          <p className="text-sm text-muted-foreground">
            Devices currently signed in to the admin account
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSessions}
            disabled={sessionsLoading}
            className="cursor-pointer btn-glass rounded-xl border-0 hover:bg-white/95"
          >
            <RefreshCw
              className={cn("h-4 w-4", sessionsLoading && "animate-spin")}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRevokeOthers}
            disabled={
              revokingAll || sessionsLoading || sessions.length <= 1
            }
            className="cursor-pointer btn-glass rounded-xl border-0 hover:bg-white/95"
          >
            {revokingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldAlert className="h-4 w-4" />
            )}
            Sign out other devices
          </Button>
        </div>
      </div>

      {sessionsError && (
        <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{sessionsError}</span>
        </div>
      )}

      {/* Sessions list */}
      <div className="rounded-2xl glass-card overflow-hidden">
        {sessionsLoading ? (
          <div className="p-6">
            <TableSkeleton rows={4} />
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <div className="w-14 h-14 rounded-2xl bg-slate-100/60 flex items-center justify-center mx-auto mb-4">
              <MonitorSmartphone className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p>No active sessions</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100/60">
            {sessions.map((s) => {
              const info = parseUserAgent(s.userAgent);
              return (
                <li
                  key={s.sessionId}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 glass-row"
                >
                  {/* Device icon */}
                  <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    {info.deviceIcon === "smartphone" ? (
                      <Smartphone className="h-5 w-5 text-accent" />
                    ) : info.deviceIcon === "monitor" ? (
                      <Monitor className="h-5 w-5 text-accent" />
                    ) : (
                      <MonitorSmartphone className="h-5 w-5 text-accent" />
                    )}
                  </div>

                  {/* Device details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold tracking-tight">
                        {info.deviceLabel} · {info.os}
                      </p>
                      {s.isCurrent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/15 text-green-600 dark:text-green-400">
                          <CheckCircle2 className="h-3 w-3" />
                          This device
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Globe className="h-3.5 w-3.5" />
                        {s.ip}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MonitorSmartphone className="h-3.5 w-3.5" />
                        {info.browser}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Signed in {timeAgo(s.loginTime)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Expires {formatEpochMs(s.expiresAt)}
                    </p>
                  </div>

                  {/* Revoke button */}
                  <div className="flex-shrink-0">
                    {s.isCurrent ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onLogout}
                        className="cursor-pointer btn-glass rounded-xl border-0"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeSession(s.sessionId)}
                        disabled={revokingId === s.sessionId}
                        className="cursor-pointer btn-glass btn-glass-danger rounded-xl border-0"
                      >
                        {revokingId === s.sessionId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Revoke
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Tip: If you don&apos;t recognize a device, click{" "}
        <span className="font-medium">Revoke</span> to sign it out
        immediately. The next request from that device will be rejected.
      </p>
    </>
  );
}