"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useApiKeys } from "@/contexts/ApiKeysContext";
import {
  validateGroqKey,
  type ValidationResult,
} from "@/lib/validateGroqKey";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ApiKeysModal({ open, onClose }: Props) {
  const { groqKey, setGroqKey, clearGroqKey, maskedGroqKey, hasGroqKey } =
    useApiKeys();
  const [draft, setDraft] = useState("");
  const [reveal, setReveal] = useState(false);
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const validationSeq = useRef(0);

  useEffect(() => {
    if (open) {
      setDraft(groqKey);
      setReveal(false);
      setResult(null);
      setValidating(false);
    }
  }, [open, groqKey]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Reset any prior validation result when the user edits the key.
  useEffect(() => {
    setResult(null);
  }, [draft]);

  const handleSave = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    const seq = ++validationSeq.current;
    setValidating(true);
    const res = await validateGroqKey(trimmed);
    if (seq !== validationSeq.current) return; // stale run ignored
    setValidating(false);
    setResult(res);

    if (res.ok) {
      setGroqKey(trimmed);
      onClose();
    }
  };

  const handleClear = () => {
    clearGroqKey();
    setDraft("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.25, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="api-keys-title"
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-border-subtle bg-surface-1 p-6 shadow-2xl dark:bg-surface-2"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="api-keys-title"
                  className="text-lg font-semibold text-brand"
                >
                  Your Groq API key
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Your key stays in <strong>your browser</strong> and is sent
                  directly to Groq on every request. We never see it.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 rounded-md p-1.5 text-text-tertiary hover:bg-surface-2 hover:text-text-primary"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {hasGroqKey && !reveal && (
              <div className="mb-4 rounded-md bg-brand-soft p-3 text-sm dark:bg-brand/10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-text-secondary">
                    Current key:{" "}
                    <code className="font-mono">{maskedGroqKey}</code>
                  </span>
                  <button
                    type="button"
                    onClick={() => setReveal(true)}
                    className="text-xs font-medium text-brand underline underline-offset-4 dark:text-brand"
                  >
                    Replace
                  </button>
                </div>
              </div>
            )}

            {(!hasGroqKey || reveal) && (
              <>
                <label
                  htmlFor="groq-key"
                  className="mb-1 block text-sm font-medium text-text-secondary"
                >
                  Groq API key
                </label>
                <input
                  id="groq-key"
                  type="password"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="gsk_…"
                  className={`mb-2 w-full rounded-md border bg-surface-1 px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 dark:bg-surface-3 ${
                    result && !result.ok
                      ? "border-red-300 focus:border-red-400 focus:ring-red-300/30"
                      : "border-border-default focus:border-brand focus:ring-brand/30"
                  }`}
                  autoComplete="off"
                  spellCheck={false}
                />

                {/* Inline validation status */}
                {validating && (
                  <p
                    className="mb-2 flex items-center gap-2 text-xs text-text-secondary"
                    role="status"
                    aria-live="polite"
                  >
                    <svg
                      className="h-3.5 w-3.5 animate-spin text-brand"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeOpacity="0.25"
                        strokeWidth="3"
                      />
                      <path
                        d="M12 2a10 10 0 0 1 10 10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    Checking with Groq…
                  </p>
                )}
                {!validating && result?.ok === true && (
                  <p
                    className="mb-2 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400"
                    role="status"
                    aria-live="polite"
                  >
                    <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                    Key verified.
                  </p>
                )}
                {!validating && result && !result.ok && (
                  <p
                    className="mb-2 flex items-start gap-2 text-xs text-red-700 dark:text-red-400"
                    role="alert"
                  >
                    <ExclamationCircleIcon
                      className="mt-px h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{result.message}</span>
                  </p>
                )}

                <p className="mb-4 text-xs text-text-tertiary">
                  Do not have one? Create a free key at{" "}
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 hover:text-brand"
                  >
                    console.groq.com/keys
                  </a>
                  .
                </p>
              </>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={!draft.trim() || validating}
                className="inline-flex min-h-[40px] items-center rounded-md border-2 border-brand bg-transparent px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-50"
              >
                {validating ? "Checking…" : "Save"}
              </button>
              {hasGroqKey && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex min-h-[40px] items-center rounded-md border border-red-300 bg-surface-1 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:bg-transparent dark:hover:bg-red-950/30"
                >
                  Clear stored key
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-[40px] items-center rounded-md border border-border-default bg-surface-1 px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-2 dark:bg-transparent"
              >
                Cancel
              </button>
            </div>

            <details className="mt-5 text-xs text-text-tertiary">
              <summary className="cursor-pointer select-none">
                How is my key stored?
              </summary>
              <p className="mt-2 leading-relaxed">
                Your key is saved in <code>localStorage</code> on this device.
                It is never transmitted to the Vanara.ai servers, only
                attached as the <code>X-Groq-Key</code> header when your
                browser talks to the backend, which forwards your request to
                Groq and immediately discards the key. This codebase is{" "}
                <a
                  href="https://github.com/vanara-ai/vanara-ui"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                >
                  open source
                </a>{" "}
                Verify for yourself.
              </p>
            </details>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
