import { Router } from "express";
import { prisma } from "../lib/prisma";

export const trackingRouter = Router();

const STUDY_STAGES = [
  { key: "submitted", label: "Submitted", description: "Application received" },
  {
    key: "under_review",
    label: "Under Review",
    description: "We are reviewing your application",
  },
  {
    key: "matched",
    label: "University Matched",
    description: "Matched to a partner university",
  },
  {
    key: "verified",
    label: "Documents Verified",
    description: "Your documents have been verified",
  },
  {
    key: "decision",
    label: "Admission Decision",
    description: "Admission decision received",
  },
  {
    key: "visa",
    label: "Visa & Pre-Departure",
    description: "Visa processing and pre-departure",
  },
];

const SOURCING_STAGES = [
  {
    key: "received",
    label: "Inquiry Received",
    description: "We received your inquiry",
  },
  {
    key: "sourcing",
    label: "Supplier Sourcing",
    description: "Finding verified suppliers",
  },
  {
    key: "quotes",
    label: "Quotes Received",
    description: "Supplier quotes received",
  },
  {
    key: "sample",
    label: "Sample Evaluation",
    description: "Samples being evaluated",
  },
  {
    key: "confirmed",
    label: "Order Confirmed",
    description: "Order confirmed with supplier",
  },
  {
    key: "shipping",
    label: "Shipping Arranged",
    description: "Shipping and logistics arranged",
  },
];

trackingRouter.get("/:referenceId", async (req, res) => {
  const referenceId = String(req.params.referenceId).trim();
  const email = String(req.query.email || "")
    .toLowerCase()
    .trim();

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Look up by referenceCode (new format: STU-XXXXXX / SOU-XXXXXX)
    // Falls back to legacy 8-char UUID suffix for old links
    const isLegacyFormat = !referenceId.includes("-");
    const where = isLegacyFormat
      ? { email, id: { endsWith: referenceId.toUpperCase() } }
      : { email, referenceCode: referenceId.toUpperCase() };

    const submissions = await prisma.submission.findMany({
      where,
      select: {
        id: true,
        submissionType: true,
        status: true,
        serviceInterest: true,
        name: true,
        referenceCode: true,
        createdAt: true,
        statusHistory: true,
      },
      take: 1,
    });

    if (submissions.length === 0) {
      return res.status(404).json({ error: "No submission found" });
    }

    const submission = submissions[0];
    const stages =
      submission.submissionType === "sourcing" ? SOURCING_STAGES : STUDY_STAGES;
    const currentStageIndex = Math.max(
      0,
      stages.findIndex((s) => s.key === submission.status),
    );

    // Build a map of status → updatedAt from statusHistory
    const historyMap = new Map<string, string>();
    if (submission.statusHistory) {
      for (const entry of submission.statusHistory as Array<{
        status: string;
        updatedAt: string;
      }>) {
        historyMap.set(entry.status, entry.updatedAt);
      }
    }

    const timeline = stages.map((stage, index) => ({
      ...stage,
      status:
        index < currentStageIndex
          ? "done"
          : index === currentStageIndex
            ? "current"
            : "pending",
      updatedAt: historyMap.get(stage.key) || null,
    }));

    res.json({
      submission: {
        id: submission.id,
        referenceId:
          submission.referenceCode ?? submission.id.slice(-8).toUpperCase(),
        submissionType: submission.submissionType,
        status: submission.status,
        serviceInterest: submission.serviceInterest,
        name: submission.name,
        createdAt: submission.createdAt,
      },
      timeline,
    });
  } catch (error) {
    console.error("Tracking error:", (error as Error).message);
    res.status(500).json({ error: "Failed to fetch tracking data" });
  }
});
