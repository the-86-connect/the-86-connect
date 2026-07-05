import type { Response } from "express";

// Server-Sent Events for real-time admin notifications.
// In Supabase, you could also use Supabase Realtime, but SSE is kept
// for backward compatibility during the migration period.

const clients = new Map<string, Response>();

export function addAdminClient(id: string, res: Response): void {
  clients.set(id, res);
  res.on("close", () => {
    clients.delete(id);
  });
}

export function removeAdminClient(id: string): void {
  clients.delete(id);
}

export function broadcastToAdmins(event: string, data: unknown): void {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const [id, res] of clients) {
    try {
      res.write(payload);
    } catch {
      clients.delete(id);
    }
  }
}