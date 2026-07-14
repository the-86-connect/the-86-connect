import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_PROXY_URL || process.env.NEXT_PUBLIC_API_URL || "";

interface HealthStatus {
  status: "ok" | "degraded" | "error";
  timestamp: string;
  version: string;
  services: {
    frontend: "ok" | "error";
    backend: "ok" | "error" | "unknown";
  };
}

async function checkBackend(): Promise<"ok" | "error"> {
  if (!BACKEND_URL) return "unknown";
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${BACKEND_URL}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok ? "ok" : "error";
  } catch {
    return "error";
  }
}

export async function GET(): Promise<NextResponse<HealthStatus>> {
  const backendStatus = await checkBackend();

  const status: HealthStatus["status"] =
    backendStatus === "ok" || backendStatus === "unknown" ? "ok" : "degraded";

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev",
    services: {
      frontend: "ok",
      backend: backendStatus,
    },
  });
}
