/**
 * Webhook notifier for cars.the86connect.com
 *
 * When admin updates tracking status for a car-quote submission,
 * this calls PATCH on the cars app to sync the status back
 * so the user sees it in their account dashboard.
 */

/**
 * Maps our internal car-shipping status keys to the
 * 7 status values the cars app expects.
 *
 * Our keys: pending, booked, loading, in_transit, at_port, customs, delivered
 * Cars app: pending, booking_confirmed, loading, in_transit, at_destination_port, customs_clearance, delivered
 */
export const CARS_APP_STATUS_MAP: Record<string, string> = {
  pending: "pending",
  booked: "booking_confirmed",
  loading: "loading",
  in_transit: "in_transit",
  at_port: "at_destination_port",
  customs: "customs_clearance",
  delivered: "delivered",
};

export async function notifyCarsAppStatusUpdate(params: {
  externalId: string;
  deliveryStatus: string;
  updatedAt?: string;
}): Promise<void> {
  const { externalId, deliveryStatus } = params;
  const updatedAt = params.updatedAt || new Date().toISOString();

  const webhookUrl = process.env.CARS_APP_WEBHOOK_URL;
  const webhookSecret = process.env.CARS_APP_WEBHOOK_SECRET;

  if (!webhookUrl || !webhookSecret) {
    // Webhook not configured — skip silently
    return;
  }

  const carsAppStatus = CARS_APP_STATUS_MAP[deliveryStatus] ?? deliveryStatus;

  try {
    const response = await fetch(webhookUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${webhookSecret}`,
      },
      body: JSON.stringify({
        id: externalId,
        deliveryStatus: carsAppStatus,
        updatedAt,
      }),
      signal: AbortSignal.timeout(10_000), // 10s timeout
    });

    if (response.status === 404) {
      // Quote may have been deleted on the cars app side — not an error
      console.warn(
        `Cars app webhook: quote ${externalId} not found (404) — likely deleted by user`,
      );
      return;
    }

    if (!response.ok) {
      console.error(
        `Cars app webhook failed: ${response.status} ${response.statusText} for quote ${externalId}`,
      );
      return;
    }

    console.log(
      `Cars app webhook: status updated to "${carsAppStatus}" for quote ${externalId}`,
    );
  } catch (error) {
    // Fire-and-forget — never block the admin response
    console.error(
      `Cars app webhook error for quote ${externalId}:`,
      (error as Error).message,
    );
  }
}

/**
 * Notifies the cars app to delete a quote when the corresponding
 * submission or shipment is deleted from this admin panel.
 *
 * @param externalId - The quote ID on the cars app
 * @param hard - If true, tells the cars app this is an admin hard-delete.
 *               If false (default), tells the cars app this is a soft-delete
 *               (user-initiated or admin trash). The cars app should pass
 *               ?hard=true|false so the receiver knows what to do.
 */
export async function notifyCarsAppDelete(
  externalId: string,
  hard = false,
): Promise<void> {
  const webhookSecret = process.env.CARS_APP_WEBHOOK_SECRET;

  if (!webhookSecret) {
    // Webhook not configured — skip silently
    return;
  }

  // The cars app's base URL — derive from the webhook URL or use a separate env var
  const carsAppUrl =
    process.env.CARS_APP_WEBHOOK_URL?.replace(/\/api\/quotes\/?$/, "") ||
    "https://cars.the86connect.com";

  const deleteUrl = `${carsAppUrl}/api/quotes?id=${encodeURIComponent(externalId)}&hard=${hard ? "true" : "false"}`;

  try {
    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${webhookSecret}`,
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (response.status === 404) {
      // Quote already deleted on the cars app side — not an error
      console.warn(
        `Cars app delete webhook: quote ${externalId} not found (404) — already deleted`,
      );
      return;
    }

    if (!response.ok) {
      console.error(
        `Cars app delete webhook failed: ${response.status} ${response.statusText} for quote ${externalId}`,
      );
      return;
    }

    console.log(
      `Cars app delete webhook: quote ${externalId} ${hard ? "hard" : "soft"} deleted`,
    );
  } catch (error) {
    console.error(
      `Cars app delete webhook error for quote ${externalId}:`,
      (error as Error).message,
    );
  }
}