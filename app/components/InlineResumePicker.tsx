"use client";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { useApiKeys } from "@/contexts/ApiKeysContext";
import { getParsedResumes, type AuthHeaders } from "../api";
import ResumeUploader from "./ResumeUploader";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface SavedResume {
  id: string;
  filename: string;
  updated_at: string;
}

interface InlineResumePickerProps {
  /** Called when user selects a saved parsed resume */
  onSelectParsed: (resume: { id: string; filename: string }) => void;
  /** Called when user uploads a new file */
  onFileChange: (file: File | null) => void;
  /** Currently selected parsed resume (controlled) */
  selectedParsed: { id: string; filename: string } | null;
  /** Currently selected file (controlled) */
  selectedFile: File | null;
  /** Disable interactions during optimization */
  disabled?: boolean;
}

export default function InlineResumePicker({
  onSelectParsed,
  onFileChange,
  selectedParsed,
  selectedFile,
  disabled,
}: InlineResumePickerProps) {
  const { user, supabaseEnabled } = useAuth();
  const { groqKey } = useApiKeys();
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [loaded, setLoaded] = useState(false);

  const authHeaders = useCallback(
    (): AuthHeaders => ({
      groqKey,
      userId: user?.id,
      userEmail: user?.email ?? undefined,
      userName:
        (user?.user_metadata?.full_name as string | undefined) ??
        user?.email ??
        undefined,
    }),
    [groqKey, user],
  );

  // Fetch saved resumes on mount (full mode only)
  useEffect(() => {
    if (!supabaseEnabled || !user) {
      setLoaded(true);
      return;
    }
    (async () => {
      try {
        const res = await getParsedResumes(authHeaders());
        setSavedResumes(res.parsed_resumes || []);
      } catch {
        // Silently degrade — just show uploader
      } finally {
        setLoaded(true);
      }
    })();
  }, [supabaseEnabled, user, authHeaders]);

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  // If a resume is already selected, show the confirmation card
  if (selectedParsed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="flex items-center justify-between rounded-lg border border-brand/30 bg-brand-soft px-4 py-3 dark:border-brand/30 dark:bg-brand/10"
      >
        <div className="flex items-center gap-3 min-w-0">
          <svg className="h-5 w-5 flex-shrink-0 text-brand" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-brand">
              {selectedParsed.filename}
            </p>
            <p className="text-xs text-text-tertiary">
              From your library (already parsed)
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectParsed(null as unknown as { id: string; filename: string })}
          className="ml-3 flex-shrink-0 text-xs text-text-tertiary underline underline-offset-2 hover:text-text-primary disabled:opacity-50"
        >
          Change
        </button>
      </motion.div>
    );
  }

  // If a file is selected via upload, show file confirmation
  if (selectedFile) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="flex items-center justify-between rounded-lg border border-brand/30 bg-brand-soft px-4 py-3 dark:border-brand/30 dark:bg-brand/10"
      >
        <div className="flex items-center gap-3 min-w-0">
          <DocumentTextIcon className="h-5 w-5 flex-shrink-0 text-brand" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-brand">
              {selectedFile.name}
            </p>
            <p className="text-xs text-text-tertiary">
              New upload (will be parsed during optimization)
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onFileChange(null)}
          className="ml-3 flex-shrink-0 text-xs text-text-tertiary underline underline-offset-2 hover:text-text-primary disabled:opacity-50"
        >
          Change
        </button>
      </motion.div>
    );
  }

  // Nothing selected — show picker
  const hasSaved = savedResumes.length > 0;

  return (
    <div className="space-y-3">
      {/* Saved resumes (full mode only) */}
      <AnimatePresence>
        {loaded && hasSaved && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-tertiary">
              Your resumes
            </p>
            <ul className="divide-y divide-border-subtle rounded-lg border border-border-subtle bg-white dark:bg-surface-2">
              {savedResumes.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-3 px-4 py-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <DocumentTextIcon className="h-4 w-4 flex-shrink-0 text-text-tertiary" />
                    <div className="min-w-0">
                      <p className="truncate text-sm text-text-primary">
                        {r.filename}
                      </p>
                      <p className="text-[11px] text-text-tertiary">
                        {formatDate(r.updated_at)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelectParsed({ id: r.id, filename: r.filename })}
                    className="flex-shrink-0 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
                  >
                    Use
                  </button>
                </li>
              ))}
            </ul>

            {/* Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-subtle" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-surface-1 px-3 text-xs text-text-tertiary dark:bg-surface-2">
                  or upload new
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload area */}
      {loaded && (
        <ResumeUploader
          onFileChange={(f) => {
            if (f) onFileChange(f);
          }}
          uploading={!!disabled}
        />
      )}

      {/* Subtle hint for first-time users in full mode */}
      {loaded && !hasSaved && supabaseEnabled && user && (
        <p className="text-center text-[11px] text-text-tertiary">
          Your resume will be saved for future optimizations
        </p>
      )}
    </div>
  );
}
