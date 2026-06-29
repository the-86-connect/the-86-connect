import { Request, Response, NextFunction } from 'express';

/**
 * Bot protection middleware for form submissions.
 * - Honeypot: if the hidden `website_url` field is filled, silently succeed
 *   without saving anything (bots auto-fill hidden fields; humans don't).
 * - Time-check: if the form was submitted in under 2 seconds, reject as bot.
 */
export function botCheck(req: Request, res: Response, next: NextFunction) {
  // Honeypot — silently succeed so bots think it worked
  const honeypot = (req.body?.website_url as string | undefined)?.trim();
  if (honeypot && honeypot !== '') {
    return res.status(200).json({
      success: true,
      id: 'bot-trapped',
      newUser: false,
    });
  }

  // Time-check — humans take longer than 2s to fill a form
  const loadedAt = Number(req.body?.formLoadedAt || 0);
  if (loadedAt && Date.now() - loadedAt < 2000) {
    return res
      .status(400)
      .json({ error: 'Submission too fast. Please try again.' });
  }

  next();
}
