import { Request, Response, NextFunction } from "express";

// Bot protection middleware — honeypot + time-based check
export function botCheck(req: Request, res: Response, next: NextFunction): void {
  // Honeypot field check
  if (req.body._honeypot && req.body._honeypot !== "") {
    // Silently accept — bot filled the hidden field
    res.status(200).json({ success: true });
    return;
  }

  // Time-based check: form filled too fast (< 2 seconds)
  const formLoadedAt = req.body.formLoadedAt;
  if (formLoadedAt && typeof formLoadedAt === "number") {
    const elapsed = Date.now() - formLoadedAt;
    if (elapsed < 2000) {
      res.status(200).json({ success: true });
      return;
    }
  }

  next();
}