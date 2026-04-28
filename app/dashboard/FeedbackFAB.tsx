"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BugAntIcon,
  LightBulbIcon,
  ChatBubbleBottomCenterTextIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { submitFeedback } from "../api";
import { useAuth } from "../../contexts/AuthContext";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type CategoryKey = "feedback" | "issue" | "feature";

interface Category {
  key: CategoryKey;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  placeholder: string;
  prompt: string;
}

const categories: Category[] = [
  {
    key: "feedback",
    label: "Share feedback",
    Icon: ChatBubbleBottomCenterTextIcon,
    placeholder: "Tell us what worked, what did not, or what confused you…",
    prompt: "Tell us how we can make this better.",
  },
  {
    key: "issue",
    label: "Report a bug",
    Icon: BugAntIcon,
    placeholder: "What went wrong? Steps to reproduce help a lot.",
    prompt: "What went wrong? The more detail, the faster we can fix it.",
  },
  {
    key: "feature",
    label: "Suggest a feature",
    Icon: LightBulbIcon,
    placeholder: "What would you like to see next?",
    prompt: "What would make this more useful for you?",
  },
];

export default function FeedbackFAB() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState<CategoryKey | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  const activeCategory = categories.find((c) => c.key === category);

  useEffect(() => {
    if (modalOpen) {
      const t = setTimeout(() => textareaRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [modalOpen]);

  // Close menu on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (modalOpen) setModalOpen(false);
        else if (menuOpen) setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [menuOpen, modalOpen]);

  const handleCategorySelect = (key: CategoryKey) => {
    setCategory(key);
    setMenuOpen(false);
    setModalOpen(true);
    setError("");
    setMessage("");
  };

  const resetAndClose = () => {
    setModalOpen(false);
    setCategory(null);
    setMessage("");
    setError("");
    setSuccess(false);
  };

  const handleSend = async () => {
    if (!message.trim()) {
      setError("Please add a message before sending.");
      return;
    }
    setSending(true);
    setError("");
    try {
      await submitFeedback({
        category: category || "feedback",
        message,
        userEmail: user?.email ?? undefined,
        userName:
          (user?.user_metadata?.full_name as string | undefined) ?? undefined,
        userId: user?.id,
      });
      setSending(false);
      setSuccess(true);
      setTimeout(resetAndClose, 1800);
    } catch (err) {
      setSending(false);
      setError(err instanceof Error ? err.message : "Failed to send feedback");
    }
  };

  return (
    <>
      {/* Menu (stacked above FAB) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="fixed bottom-20 right-5 z-50 flex flex-col gap-2 sm:bottom-24 sm:right-6"
          >
            {categories.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => handleCategorySelect(key)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border-subtle bg-surface-1 px-4 py-2 text-sm font-medium text-text-secondary shadow-sm transition-colors hover:border-brand hover:text-brand dark:bg-surface-2"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label={menuOpen ? "Close feedback menu" : "Open feedback menu"}
        aria-expanded={menuOpen}
        className="fixed bottom-5 right-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand bg-transparent text-brand shadow-lg transition-all hover:bg-brand-soft hover:shadow-xl sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
      >
        {menuOpen ? (
          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
        ) : (
          <span className="text-2xl leading-none sm:text-3xl" aria-hidden="true">
            🐒
          </span>
        )}
      </button>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && activeCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={resetAndClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.25, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border border-border-subtle bg-surface-1 p-6 shadow-2xl dark:bg-surface-2"
              role="dialog"
              aria-modal="true"
              aria-labelledby="feedback-title"
            >
              <button
                type="button"
                onClick={resetAndClose}
                aria-label="Close"
                className="absolute right-3 top-3 rounded-md p-1.5 text-text-tertiary hover:bg-surface-2 hover:text-text-primary"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>

              <div className="mb-4 flex items-center gap-2 text-brand">
                <activeCategory.Icon
                  className="h-5 w-5"
                  aria-hidden="true"
                />
                <h2
                  id="feedback-title"
                  className="text-lg font-semibold"
                >
                  {activeCategory.label}
                </h2>
              </div>

              <p className="mb-4 text-sm text-text-secondary">
                {activeCategory.prompt}
              </p>

              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sending || success}
                placeholder={activeCategory.placeholder}
                rows={5}
                className={[
                  "w-full resize-y rounded-lg border bg-surface-1 px-3 py-2 text-sm text-text-primary placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 dark:bg-surface-3 dark:placeholder-gray-500",
                  error
                    ? "border-red-400 focus:ring-red-400/30"
                    : "border-border-default focus:border-brand focus:ring-brand/30",
                ].join(" ")}
                aria-label="Feedback message"
                aria-invalid={!!error}
              />

              {error && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={handleSend}
                disabled={sending || success}
                className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border-2 border-brand bg-transparent px-4 py-2.5 text-sm font-medium text-brand transition-all hover:bg-brand-soft hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending
                  ? "Sending…"
                  : success
                    ? "Sent"
                    : "Send"}
              </button>

              {success && (
                <p className="mt-3 text-center text-sm text-brand">
                  Thanks. Your feedback makes this better for everyone.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
