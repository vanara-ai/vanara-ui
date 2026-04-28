"use client";
import React, { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ChevronDownIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { useApiKeys } from "@/contexts/ApiKeysContext";
import {
  getResumeHistory,
  generatePDFFromHistory,
  downloadOptimizedResume,
  type AuthHeaders,
} from "../api";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface ResumeGeneration {
  id: string;
  original_filename: string;
  ats_score: number;
  created_at: string;
  resume_template?: string;
  jobs?: {
    title?: string;
    company?: string;
    description?: string;
  } | null;
}

export default function ResumeHistory() {
  const { user } = useAuth();
  const { groqKey } = useApiKeys();

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

  const [history, setHistory] = useState<ResumeGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    company: "",
    minScore: "",
    maxScore: "",
    startDate: "",
    endDate: "",
  });

  const fetchHistory = useCallback(
    async (page = 1) => {
      if (!user) return;
      setLoading(true);
      try {
        const filterParams = {
          page,
          limit: pagination.limit,
          ...(filters.company && { company: filters.company }),
          ...(filters.minScore && { minScore: parseFloat(filters.minScore) }),
          ...(filters.maxScore && { maxScore: parseFloat(filters.maxScore) }),
          ...(filters.startDate && { startDate: filters.startDate }),
          ...(filters.endDate && { endDate: filters.endDate }),
        };
        const response = await getResumeHistory(authHeaders(), filterParams);
        setHistory(response.history);
        setPagination({
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.total_pages,
        });
      } catch (err) {
        // console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    },
    [user, pagination.limit, filters, authHeaders],
  );

  useEffect(() => {
    if (user) fetchHistory();
  }, [user, fetchHistory]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => fetchHistory(1);

  const clearFilters = () => {
    setFilters({
      company: "",
      minScore: "",
      maxScore: "",
      startDate: "",
      endDate: "",
    });
    setTimeout(() => fetchHistory(1), 0);
  };

  const handleDownload = async (generation: ResumeGeneration) => {
    if (!user) return;
    setGenerating(generation.id);
    try {
      const auth = authHeaders();
      const response = await generatePDFFromHistory(
        generation.id,
        auth,
        generation.resume_template || "resume_template_7.html",
      );
      await downloadOptimizedResume(
        response.pdf_download_url,
        auth,
        generation.original_filename,
      );
    } catch (err) {
      // console.error("Failed to generate PDF:", err);
    } finally {
      setGenerating(null);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const scoreBadgeClasses = (score: number) => {
    if (score >= 80) {
      return "bg-brand/10 text-brand dark:bg-brand/15 dark:text-brand";
    }
    if (score >= 60) {
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200";
    }
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200";
  };

  const toggleJobDescription = (generationId: string) => {
    setExpandedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(generationId)) next.delete(generationId);
      else next.add(generationId);
      return next;
    });
  };

  const inputCls =
    "min-h-[40px] w-full rounded-md border border-border-default bg-surface-1 px-3 py-2 text-sm text-text-primary placeholder-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 dark:bg-surface-2 dark:placeholder-gray-500";

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-text-tertiary">
        Loading…
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-text-primary sm:text-xl">
          Resume history
        </h2>
        <div className="text-sm text-text-tertiary">
          {pagination.total} total
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border-subtle bg-surface-1 p-4 dark:bg-surface-2">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            type="text"
            placeholder="Filter by company…"
            value={filters.company}
            onChange={(e) => handleFilterChange("company", e.target.value)}
            className={inputCls}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min score"
              value={filters.minScore}
              onChange={(e) => handleFilterChange("minScore", e.target.value)}
              className={inputCls}
              min="0"
              max="100"
            />
            <input
              type="number"
              placeholder="Max score"
              value={filters.maxScore}
              onChange={(e) => handleFilterChange("maxScore", e.target.value)}
              className={inputCls}
              min="0"
              max="100"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={applyFilters}
            className="inline-flex min-h-[36px] items-center rounded-md border-2 border-brand bg-transparent px-4 py-1.5 text-sm font-medium text-brand transition-colors hover:bg-brand-soft"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex min-h-[36px] items-center rounded-md border border-border-default bg-surface-1 px-4 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-2 dark:bg-transparent"
          >
            Clear
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="rounded-xl border border-border-subtle bg-surface-1 p-10 text-center dark:bg-surface-2">
          <InboxIcon
            className="mx-auto mb-3 h-10 w-10 text-text-tertiary"
            aria-hidden="true"
          />
          <h3 className="text-base font-medium text-text-primary">
            No resume history
          </h3>
          <p className="mt-1 text-sm text-text-tertiary">
            Start optimizing resumes to see your history here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((generation, i) => {
            const open = expandedJobs.has(generation.id);
            return (
              <motion.div
                key={generation.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  ease: EASE,
                  delay: Math.min(i * 0.05, 0.5),
                }}
                className="rounded-xl border border-border-subtle bg-surface-1 p-4 transition-colors hover:border-border-default sm:p-5 dark:bg-surface-2"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h3 className="min-w-0 truncate text-sm font-medium text-text-primary">
                        {generation.original_filename}
                      </h3>
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${scoreBadgeClasses(generation.ats_score)}`}
                      >
                        {Math.round(generation.ats_score)}% ATS
                      </span>
                    </div>

                    <div className="mt-1.5 text-sm text-text-secondary">
                      {generation.jobs?.title && generation.jobs?.company ? (
                        <span>
                          <strong>{generation.jobs.title}</strong> at{" "}
                          <strong>{generation.jobs.company}</strong>
                        </span>
                      ) : generation.jobs?.title ? (
                        <strong>{generation.jobs.title}</strong>
                      ) : generation.jobs?.company ? (
                        <span>
                          Position at <strong>{generation.jobs.company}</strong>
                        </span>
                      ) : (
                        <span className="text-text-tertiary">
                          No job details provided
                        </span>
                      )}
                    </div>

                    <div className="mt-1 text-xs text-text-tertiary">
                      Created {formatDate(generation.created_at)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleJobDescription(generation.id)}
                      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-border-default bg-surface-1 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-2 dark:bg-transparent"
                    >
                      <ChevronDownIcon
                        className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      />
                      {open ? "Hide job" : "View job"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownload(generation)}
                      disabled={generating === generation.id}
                      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-border-default bg-surface-1 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-2 disabled:opacity-50 dark:bg-transparent"
                    >
                      {generating === generation.id ? (
                        <>
                          <DocumentTextIcon
                            className="h-3.5 w-3.5 animate-pulse"
                            aria-hidden="true"
                          />
                          Generating…
                        </>
                      ) : (
                        <>
                          <ArrowDownTrayIcon
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                          Download PDF
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {open && (
                  <div className="mt-4 border-t border-border-subtle pt-3">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                      Job description
                    </h4>
                    <div className="max-h-60 overflow-y-auto rounded-md bg-surface-1 p-3 text-sm text-text-secondary">
                      <pre className="whitespace-pre-wrap break-words font-sans">
                        {generation.jobs?.description ||
                          "No job description available"}
                      </pre>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => fetchHistory(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="inline-flex min-h-[36px] items-center rounded-md border border-border-default bg-surface-1 px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-transparent"
          >
            Previous
          </button>
          <span className="px-2 py-1 text-sm text-text-tertiary">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            onClick={() => fetchHistory(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="inline-flex min-h-[36px] items-center rounded-md border border-border-default bg-surface-1 px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-transparent"
          >
            Next
          </button>
        </div>
      )}
    </motion.div>
  );
}
