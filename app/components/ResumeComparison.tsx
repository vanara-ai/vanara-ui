"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import DiffViewer from "react-diff-viewer";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type ResumeData =
  | Record<string, unknown>
  | string
  | number
  | boolean
  | null
  | undefined;

interface DiffProps {
  original: Record<string, ResumeData>;
  optimized: Record<string, ResumeData>;
}

const capitalizeKey = (key: string): string =>
  key
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");

const preprocessData = (data: ResumeData, indent = 0): string => {
  if (data === null || data === undefined) return "None";
  if (
    typeof data === "string" ||
    typeof data === "number" ||
    typeof data === "boolean"
  ) {
    return String(data);
  }
  if (Array.isArray(data)) {
    if (data.length === 0) return "Empty list";
    if (typeof data[0] === "object" && data[0] !== null) {
      return data
        .map((item) => {
          const itemLines = Object.entries(item).map(([key, value]) => {
            const formattedKey = capitalizeKey(key);
            return `${"  ".repeat(indent + 1)}${formattedKey}: ${preprocessData(
              value as ResumeData,
              indent + 2,
            )}`;
          });
          return itemLines.join("\n");
        })
        .join("\n\n");
    }
    return data
      .map(
        (item) =>
          `${"  ".repeat(indent + 1)}${preprocessData(item, indent + 1)}`,
      )
      .join("\n");
  }
  if (typeof data === "object") {
    const uniqueEntries = Object.entries(data).reduce(
      (acc, [key, value]) => {
        if (!acc.some(([k]) => k === key)) {
          acc.push([key, value as ResumeData]);
        }
        return acc;
      },
      [] as [string, ResumeData][],
    );
    return uniqueEntries
      .map(([key, value]) => {
        const formattedKey = capitalizeKey(key);
        return `${"  ".repeat(indent)}${formattedKey}: ${preprocessData(
          value,
          indent + 1,
        )}`;
      })
      .join("\n");
  }
  return "Unknown type";
};

const SECTION_ORDER = [
  "summary",
  "skills",
  "professional_experience",
  "projects",
  "education",
  "certifications",
  "contact_info",
];

const ResumeComparison: React.FC<DiffProps> = ({ original, optimized }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );

  if (!original || !optimized) return null;

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const allSections = Object.keys(original).filter(
    (section) =>
      section !== "__typename" && typeof original[section] !== "function",
  );

  const sections = [
    ...SECTION_ORDER.filter((section) => allSections.includes(section)),
    ...allSections.filter((section) => !SECTION_ORDER.includes(section)),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="w-full overflow-hidden rounded-xl border border-border-subtle bg-white dark:bg-surface-2"
    >
      <div className="border-b border-border-subtle px-4 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-text-primary sm:text-lg">
          Section-by-section diff
        </h2>
        <p className="mt-1 text-xs text-text-tertiary sm:text-sm">
          Compare the original resume against the optimized version.
        </p>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {sections.map((section) => {
          const open = expandedSections.has(section);
          return (
            <div key={section} className="w-full">
              <button
                type="button"
                onClick={() => toggleSection(section)}
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-brand-soft/40 sm:px-6 dark:hover:bg-brand-hover/5"
                aria-expanded={open}
              >
                <h3 className="text-sm font-medium capitalize text-text-primary sm:text-base">
                  {section.replace(/_/g, " ")}
                </h3>
                {open ? (
                  <ChevronUpIcon
                    className="h-5 w-5 text-text-tertiary"
                    aria-hidden="true"
                  />
                ) : (
                  <ChevronDownIcon
                    className="h-5 w-5 text-text-tertiary"
                    aria-hidden="true"
                  />
                )}
              </button>

              {open && (
                <div className="border-t border-border-subtle bg-surface-1 px-2 pb-4 sm:px-4">
                  <div className="overflow-x-auto rounded-md border border-border-subtle">
                    <DiffViewer
                      oldValue={preprocessData(original[section])}
                      newValue={preprocessData(optimized[section])}
                      splitView
                      showDiffOnly={false}
                      styles={{
                        variables: {
                          light: {
                            codeFoldGutterBackground: "#F1F8E9",
                            codeFoldBackground: "#F1F8E9",
                            addedBackground: "#E8F5E8",
                            removedBackground: "#FFEBEE",
                            wordAddedBackground: "#C8E6C9",
                            wordRemovedBackground: "#FFCDD2",
                            addedGutterBackground: "#2D5A3D",
                            removedGutterBackground: "#D32F2F",
                            gutterBackground: "#FAFAFA",
                            gutterBackgroundDark: "#F5F5F5",
                            highlightBackground: "#FFFBF0",
                            highlightGutterBackground: "#F4A261",
                          },
                          dark: {
                            codeFoldGutterBackground: "#2D5A3D",
                            codeFoldBackground: "#2D5A3D",
                            addedBackground: "#1B4332",
                            removedBackground: "#4A1A1A",
                            wordAddedBackground: "#2D5A3D",
                            wordRemovedBackground: "#6B1A1A",
                            addedGutterBackground: "#F4A261",
                            removedGutterBackground: "#E76F51",
                            gutterBackground: "#1F2937",
                            gutterBackgroundDark: "#111827",
                            highlightBackground: "#374151",
                            highlightGutterBackground: "#F4A261",
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ResumeComparison;
