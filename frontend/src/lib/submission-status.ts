export interface Stage {
  key: string;
  label: string;
}

export const STUDY_STAGES: Stage[] = [
  { key: "submitted", label: "Submitted" },
  { key: "under_review", label: "Under Review" },
  { key: "matched", label: "University Matched" },
  { key: "verified", label: "Documents Verified" },
  { key: "decision", label: "Admission Decision" },
  { key: "visa", label: "Visa & Pre-Departure" },
];

export const SOURCING_STAGES: Stage[] = [
  { key: "received", label: "Inquiry Received" },
  { key: "sourcing", label: "Supplier Sourcing" },
  { key: "quotes", label: "Quotes Received" },
  { key: "sample", label: "Sample Evaluation" },
  { key: "confirmed", label: "Order Confirmed" },
  { key: "shipping", label: "Shipping Arranged" },
];

export const CAR_SHIPPING_STAGES: Stage[] = [
  { key: "pending", label: "Shipment Pending" },
  { key: "booked", label: "Booking Confirmed" },
  { key: "loading", label: "Loading" },
  { key: "in_transit", label: "In Transit" },
  { key: "at_port", label: "At Destination Port" },
  { key: "customs", label: "Customs Clearance" },
  { key: "delivered", label: "Delivered" },
];

const ALL_STATUSES: (Stage | { key: null; label: string })[] = [
  { key: null, label: "Submitted" },
  ...STUDY_STAGES,
  ...SOURCING_STAGES,
  ...CAR_SHIPPING_STAGES,
];

const STATUS_LABEL_MAP = new Map<string | null, string>();
ALL_STATUSES.forEach((s) => STATUS_LABEL_MAP.set(s.key, s.label));

export function getStatusLabel(status: string | null | undefined): string {
  if (!status) return "Submitted";
  return (
    STATUS_LABEL_MAP.get(status) ??
    status
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

export const ALL_STATUS_KEYS = STUDY_STAGES.concat(SOURCING_STAGES).map(
  (s) => s.key,
);
