import type { Response } from "express";

type AdminEventHandler = (data: unknown) => void;

interface AdminClient {
  id: string;
  res: Response;
  send: (event: string, data: unknown) => void;
}

const clients = new Map<string, AdminClient>();

function makeClient(res: Response): AdminClient {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  return { id, res, send };
}

export function addAdminClient(res: Response): AdminClient {
  const client = makeClient(res);
  clients.set(client.id, client);
  return client;
}

export function removeAdminClient(id: string): void {
  clients.delete(id);
}

export function broadcastToAdmins(event: string, data: unknown): void {
  clients.forEach((client) => {
    try {
      client.send(event, data);
    } catch {
      // client connection is broken; remove it
      clients.delete(client.id);
    }
  });
}

export function getAdminClientCount(): number {
  return clients.size;
}
