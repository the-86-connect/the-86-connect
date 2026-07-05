// Client-side form submission throttle
// Uses localStorage to persist cooldown across page reloads.
// This is UX convenience only — real rate limiting is backend.

const STORAGE_KEY = "86connect_submit_cooldowns";
const MAX_SUBMISSIONS = 3;
const WINDOW_MS = 3 * 60 * 1000;
const COOLDOWN_MS = 4 * 60 * 1000;

interface CooldownEntry {
  timestamps: number[];
  cooldownUntil: number | null;
}

function getCooldowns(): Record<string, CooldownEntry> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveCooldowns(data: Record<string, CooldownEntry>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function checkCanSubmit(
  formKey: string,
): { allowed: boolean; waitSeconds: number } {
  const data = getCooldowns();
  const entry = data[formKey];
  if (!entry) return { allowed: true, waitSeconds: 0 };

  const now = Date.now();

  // Active cooldown period
  if (entry.cooldownUntil && now < entry.cooldownUntil) {
    return {
      allowed: false,
      waitSeconds: Math.ceil((entry.cooldownUntil - now) / 1000),
    };
  }

  // Check if too many submissions in window
  const recent = entry.timestamps.filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_SUBMISSIONS) {
    const cooldownUntil = recent[0] + COOLDOWN_MS;
    data[formKey].cooldownUntil = cooldownUntil;
    saveCooldowns(data);
    return {
      allowed: false,
      waitSeconds: Math.ceil((cooldownUntil - now) / 1000),
    };
  }

  return { allowed: true, waitSeconds: 0 };
}

export function recordSubmission(formKey: string): void {
  const data = getCooldowns();
  const entry = data[formKey] || { timestamps: [], cooldownUntil: null };
  entry.timestamps.push(Date.now());
  // Clean expired timestamps
  const now = Date.now();
  entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);
  data[formKey] = entry;
  saveCooldowns(data);
}

export function clearCooldowns(): void {
  localStorage.removeItem(STORAGE_KEY);
}