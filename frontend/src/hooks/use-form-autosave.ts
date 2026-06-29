"use client";

import { useEffect, useState } from "react";

const AUTOSAVE_DEBOUNCE_MS = 800;
const AUTOSAVE_EXPIRY_MS = 1000 * 60 * 60 * 24 * 7;

export function useFormAutosave<T extends Record<string, unknown>>({
  formKey,
  getValues,
  reset,
  watch,
}: {
  formKey: string;
  getValues: () => T;
  reset: (values?: Partial<T>) => void;
  watch: () => T;
}) {
  const STORAGE_KEY = `86connect_form_draft_${formKey}`;
  const [draftAvailable, setDraftAvailable] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { data: T; savedAt: number };
      if (!parsed.data || typeof parsed !== "object") return;
      if (parsed.savedAt && Date.now() - parsed.savedAt > AUTOSAVE_EXPIRY_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      reset(parsed.data as Partial<T>);
      setDraftAvailable(true);
      setLastSaved(new Date(parsed.savedAt));
    } catch {
    }
  }, [STORAGE_KEY, reset]);

  const watchedValues = watch();

  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        const values = getValues();
        const hasContent = Object.values(values).some(
          (v) =>
            v !== undefined &&
            v !== null &&
            v !== "" &&
            !(Array.isArray(v) && v.length === 0),
        );
        if (!hasContent) {
          localStorage.removeItem(STORAGE_KEY);
          setDraftAvailable(false);
          setLastSaved(null);
          return;
        }
        const now = Date.now();
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ data: values, savedAt: now }),
        );
        setDraftAvailable(true);
        setLastSaved(new Date(now));
      } catch {
      }
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [watchedValues, STORAGE_KEY, getValues]);

  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    setDraftAvailable(false);
    setLastSaved(null);
  };

  return { clearDraft, draftAvailable, lastSaved };
}
