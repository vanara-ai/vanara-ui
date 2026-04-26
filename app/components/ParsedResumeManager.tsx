"use client";
import React, { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { DocumentTextIcon, FolderOpenIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { useApiKeys } from "@/contexts/ApiKeysContext";
import {
  parseResume,
  getParsedResumes,
  deleteParsedResume,
  type AuthHeaders,
} from "../api";
import ResumePreviewModal from "./ResumePreviewModal";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface ParsedResume {
  id: string;
  filename: string;
  created_at: string;
  updated_at: string;
  parsed_resume?: Record<string, unknown>;
}

interface ParsedResumeManagerProps {
  onSelectForOptimize?: (resume: { id: string; filename: string }) => void;
}

export default function ParsedResumeManager({ onSelectForOptimize }: ParsedResumeManagerProps = {}) {
  const { user } = useAuth();
  const { groqKey, hasGroqKey } = useApiKeys();

  const [parsedResumes, setParsedResumes] = useState<ParsedResume[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    resume: Record<string, unknown> | null;
    filename: string;
  }>({ isOpen: false, resume: null, filename: "" });

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

  const loadParsedResumes = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const result = await getParsedResumes(authHeaders());
      setParsedResumes(result.parsed_resumes || []);
    } catch (err) {
      // console.error("Failed to load parsed resumes:", err);
      setError("Failed to load parsed resumes");
    } finally {
      setLoading(false);
    }
  }, [user, authHeaders]);

  useEffect(() => {
    if (user) loadParsedResumes();
  }, [user, loadParsedResumes]);

  const handleUpload = async (file: File) => {
    if (!user) return;
    if (!hasGroqKey) {
      setError("Please add your Groq API key before parsing a resume.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const result = await parseResume({ resume: file, auth: authHeaders() });
      if (result.status === "parsed" || result.status === "already_parsed") {
        await loadParsedResumes();
      }
    } catch (err) {
      // console.error("Failed to parse resume:", err);
      setError(err instanceof Error ? err.message : "Failed to parse resume");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!user) return;
    try {
      setDeleting(resumeId);
      setError("");
      await deleteParsedResume(resumeId, authHeaders());
      setParsedResumes((prev) => prev.filter((r) => r.id !== resumeId));
    } catch (err) {
      // console.error("Failed to delete resume:", err);
      setError("Failed to delete resume");
    } finally {
      setDeleting(null);
    }
  };

  const handlePreview = (resume: ParsedResume) => {
    if (!resume.parsed_resume) {
      setError("Parsed data unavailable for preview");
      return;
    }
    setPreviewModal({
      isOpen: true,
      resume: resume.parsed_resume,
      filename: resume.filename,
    });
  };

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (!user) {
    return (
      <p className="text-sm text-text-tertiary">
        Sign in to manage parsed resumes.
      </p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="space-y-4"
    >
      <div className="rounded-xl border border-border-subtle bg-surface-1 p-5 sm:p-6 dark:bg-surface-2">
        <h2 className="mb-2 text-base font-semibold sm:text-lg">
          Smart library
        </h2>
        <p className="mb-4 text-sm text-text-secondary">
          Parse once, reuse across many job applications. The parse step uses
          your Groq key; subsequent optimizations read the cached structure.
        </p>

        <label
          className={[
            "flex min-h-[88px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors",
            loading
              ? "border-border-subtle text-text-tertiary"
              : "border-brand/60 text-brand hover:bg-brand-soft dark:border-brand/60 dark:text-brand dark:hover:bg-brand-hover/10",
          ].join(" ")}
        >
          <DocumentTextIcon className="h-6 w-6" aria-hidden="true" />
          <span className="text-sm font-medium">
            {loading ? "Working…" : "Upload a resume PDF to parse"}
          </span>
          <input
            type="file"
            accept="application/pdf"
            disabled={loading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
              e.target.value = "";
            }}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-700 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-border-subtle bg-white dark:bg-surface-2">
        <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3 sm:px-6">
          <FolderOpenIcon
            className="h-4 w-4 text-text-tertiary"
            aria-hidden="true"
          />
          <h3 className="text-sm font-semibold">
            Your parsed resumes{" "}
            <span className="font-normal text-text-tertiary">
              ({parsedResumes.length})
            </span>
          </h3>
        </div>

        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {parsedResumes.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-text-tertiary sm:px-6">
              No parsed resumes yet.
            </li>
          )}
          {parsedResumes.map((r, i) => (
            <motion.li
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                ease: EASE,
                delay: Math.min(i * 0.04, 0.4),
              }}
              className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">
                  {r.filename}
                </p>
                <p className="text-xs text-text-tertiary">
                  Updated {formatDate(r.updated_at)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {onSelectForOptimize && (
                  <button
                    type="button"
                    onClick={() => onSelectForOptimize({ id: r.id, filename: r.filename })}
                    className="inline-flex min-h-[36px] items-center rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-hover"
                  >
                    Optimize
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handlePreview(r)}
                  className="inline-flex min-h-[36px] items-center rounded-md border border-border-default bg-surface-1 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-2 dark:bg-transparent"
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(r.id)}
                  disabled={deleting === r.id}
                  className="inline-flex min-h-[36px] items-center rounded-md border border-red-300 bg-surface-1 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:bg-transparent dark:hover:bg-red-950/30"
                >
                  {deleting === r.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>

      <ResumePreviewModal
        isOpen={previewModal.isOpen}
        resumeData={previewModal.resume}
        filename={previewModal.filename}
        onClose={() =>
          setPreviewModal({ isOpen: false, resume: null, filename: "" })
        }
      />
    </motion.div>
  );
}
