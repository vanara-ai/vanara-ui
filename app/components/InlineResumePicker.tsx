"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  DocumentTextIcon,
  ChevronUpDownIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
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
  onSelectParsed: (resume: { id: string; filename: string }) => void;
  onFileChange: (file: File | null) => void;
  selectedParsed: { id: string; filename: string } | null;
  selectedFile: File | null;
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        // Silently degrade
      } finally {
        setLoaded(true);
      }
    })();
  }, [supabaseEnabled, user, authHeaders]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  const hasSaved = savedResumes.length > 0;

  // Selected state: compact confirmation
  if (selectedParsed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="flex items-center justify-between rounded-lg border border-brand/30 bg-brand-soft px-4 py-3 dark:border-brand/30 dark:bg-brand/10"
      >
        <div className="flex items-center gap-3 min-w-0">
          <CheckIcon className="h-5 w-5 flex-shrink-0 text-brand" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-brand">
              {selectedParsed.filename}
            </p>
            <p className="text-xs text-text-tertiary">From your library</p>
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
            <p className="text-xs text-text-tertiary">New upload</p>
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

  // Nothing selected — show dropdown trigger + upload
  return (
    <div className="space-y-3">
      {/* Dropdown selector for saved resumes */}
      {loaded && hasSaved && (
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg border border-border-default bg-white px-4 py-3 text-left text-sm transition-colors hover:border-brand focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-50 dark:bg-surface-2"
          >
            <span className="text-text-tertiary">
              Select from your library ({savedResumes.length})
            </span>
            <ChevronUpDownIcon className="h-5 w-5 text-text-tertiary" />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.ul
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15, ease: EASE }}
                className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-border-subtle bg-white shadow-lg dark:bg-surface-2"
              >
                {savedResumes.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectParsed({ id: r.id, filename: r.filename });
                        setDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-brand-soft dark:hover:bg-brand/10"
                    >
                      <DocumentTextIcon className="h-4 w-4 flex-shrink-0 text-text-tertiary" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-text-primary">{r.filename}</p>
                        <p className="text-[11px] text-text-tertiary">
                          {formatDate(r.updated_at)}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Divider between dropdown and upload */}
      {loaded && hasSaved && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-subtle" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-surface-1 px-3 text-xs text-text-tertiary dark:bg-surface-2">
              or upload new
            </span>
          </div>
        </div>
      )}

      {/* Upload area */}
      {loaded && (
        <ResumeUploader
          onFileChange={(f) => {
            if (f) onFileChange(f);
          }}
          uploading={!!disabled}
        />
      )}
    </div>
  );
}
