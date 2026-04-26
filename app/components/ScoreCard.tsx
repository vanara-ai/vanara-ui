"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  ArrowsRightLeftIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const CIRCUMFERENCE = 2 * Math.PI * 36; // ~226.19

export interface ScoreCardProps {
  initialScore: number;
  finalScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  downloadUrl?: string;
  onDownload?: () => void;
  showCompare?: boolean;
  onCompare?: () => void;
}

const ScoreCard: React.FC<ScoreCardProps> = ({
  initialScore,
  finalScore,
  summary,
  strengths,
  weaknesses,
  downloadUrl,
  onDownload,
  showCompare,
  onCompare,
}) => {
  const [expanded, setExpanded] = useState(false);
  const delta = finalScore - initialScore;
  const pctImprovement =
    initialScore > 0 ? Math.round((delta / initialScore) * 100) : 0;
  const clampedFinal = Math.max(0, Math.min(100, finalScore));
  const dashTarget = (clampedFinal / 100) * CIRCUMFERENCE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="w-full"
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-4 rounded-lg text-left transition-colors hover:bg-brand-soft/40 dark:hover:bg-brand-hover/5"
        aria-expanded={expanded}
      >
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-6">
          {/* Score ring */}
          <div className="relative h-20 w-20 shrink-0">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
              <circle
                className="text-gray-200 dark:text-gray-700"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="36"
                cx="40"
                cy="40"
              />
              <motion.circle
                className="text-brand"
                strokeWidth="8"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="36"
                cx="40"
                cy="40"
                initial={{ strokeDasharray: `0 ${CIRCUMFERENCE}` }}
                animate={{
                  strokeDasharray: `${dashTarget} ${CIRCUMFERENCE}`,
                }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold tabular-nums text-text-primary">
              {finalScore}
            </span>
          </div>

          <div className="min-w-0 space-y-1">
            <h3 className="text-base font-semibold text-text-primary sm:text-lg">
              ATS match score
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="text-text-tertiary">
                Initial{" "}
                <span className="font-medium text-text-secondary tabular-nums">
                  {initialScore}
                </span>
              </span>
              <span
                className={[
                  "inline-flex items-center gap-1 font-medium tabular-nums",
                  delta >= 0
                    ? "text-brand"
                    : "text-red-600 dark:text-red-400",
                ].join(" ")}
              >
                {delta >= 0 ? (
                  <ArrowTrendingUpIcon
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                ) : (
                  <ArrowTrendingDownIcon
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                )}
                {delta >= 0 ? "+" : "-"}
                {Math.abs(delta)}
                <span className="text-xs font-normal text-text-tertiary">
                  ({Math.abs(pctImprovement)}%)
                </span>
              </span>
            </div>
          </div>
        </div>

        <span className="shrink-0 p-1 text-text-tertiary">
          {expanded ? (
            <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
          )}
        </span>
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="mt-6 space-y-4"
        >
          {summary && (
            <div className="rounded-lg border border-border-subtle bg-brand-soft/60 p-4 text-sm leading-relaxed text-text-secondary dark:bg-brand/5">
              <span className="font-semibold text-brand">
                Summary:
              </span>{" "}
              {summary}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-brand/20 bg-surface-1 p-4 dark:border-brand/40 dark:bg-surface-2">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand">
                <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
                <span>Strengths ({strengths.length})</span>
              </div>
              <ul className="space-y-1.5 text-sm text-text-secondary">
                {strengths.length > 0 ? (
                  strengths.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span
                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand"
                        aria-hidden="true"
                      />
                      <span>{s}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-text-tertiary">
                    None listed.
                  </li>
                )}
              </ul>
            </div>

            <div className="rounded-lg border border-amber-300/50 bg-surface-1 p-4 dark:border-amber-700/50 dark:bg-surface-2">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
                <ExclamationTriangleIcon
                  className="h-5 w-5"
                  aria-hidden="true"
                />
                <span>Gaps ({weaknesses.length})</span>
              </div>
              <ul className="space-y-1.5 text-sm text-text-secondary">
                {weaknesses.length > 0 ? (
                  weaknesses.map((w, i) => (
                    <li key={i} className="flex gap-2">
                      <span
                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-600 dark:bg-amber-500"
                        aria-hidden="true"
                      />
                      <span>{w}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-text-tertiary">
                    None identified.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {downloadUrl && onDownload && (
          <button
            onClick={onDownload}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-brand-hover hover:shadow-md"
          >
            <ArrowDownTrayIcon className="h-4 w-4" aria-hidden="true" />
            Download optimized PDF
          </button>
        )}
        {showCompare && onCompare && (
          <button
            onClick={onCompare}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-border-default bg-surface-1 px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-border-strong hover:bg-gray-50 dark:bg-transparent dark:hover:bg-surface-3"
          >
            <ArrowsRightLeftIcon className="h-4 w-4" aria-hidden="true" />
            Compare changes
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ScoreCard;
