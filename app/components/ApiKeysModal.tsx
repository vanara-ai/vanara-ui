"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useApiKeys } from "@/contexts/ApiKeysContext";

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

  useEffect(() => {
    if (open) {
      setDraft(groqKey);
      setReveal(false);
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

  const handleSave = () => {
    setGroqKey(draft);
    onClose();
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
                  className="mb-3 w-full rounded-md border border-border-default bg-surface-1 px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 dark:bg-surface-3"
                  autoComplete="off"
                  spellCheck={false}
                />
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
                disabled={!draft.trim()}
                className="inline-flex min-h-[40px] items-center rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save
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
