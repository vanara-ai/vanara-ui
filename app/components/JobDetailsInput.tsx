"use client";
import React from "react";

interface JobDetailsInputProps {
  jobTitle: string;
  company: string;
  jobDescription: string;
  onJobTitleChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  onJobDescriptionChange: (value: string) => void;
  disabled?: boolean;
}

const inputBase =
  "w-full rounded-lg border border-border-default bg-surface-1 px-4 py-3 text-sm text-text-primary placeholder-gray-400 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-surface-2 dark:placeholder-gray-500";

export default function JobDetailsInput({
  jobTitle,
  company,
  jobDescription,
  onJobTitleChange,
  onCompanyChange,
  onJobDescriptionChange,
  disabled = false,
}: JobDetailsInputProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="job-title"
            className="mb-2 block text-sm font-medium text-text-secondary"
          >
            Job title <span className="text-text-tertiary">(optional)</span>
          </label>
          <input
            id="job-title"
            type="text"
            value={jobTitle}
            onChange={(e) => onJobTitleChange(e.target.value)}
            disabled={disabled}
            placeholder="e.g. Senior Software Engineer"
            className={inputBase}
          />
        </div>

        <div>
          <label
            htmlFor="company"
            className="mb-2 block text-sm font-medium text-text-secondary"
          >
            Company <span className="text-text-tertiary">(optional)</span>
          </label>
          <input
            id="company"
            type="text"
            value={company}
            onChange={(e) => onCompanyChange(e.target.value)}
            disabled={disabled}
            placeholder="e.g. Google, Microsoft"
            className={inputBase}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="job-description"
          className="mb-2 block text-sm font-medium text-text-secondary"
        >
          Job description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="job-description"
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          disabled={disabled}
          placeholder="Paste the full job description here…"
          rows={10}
          className={`${inputBase} resize-y`}
        />
        <p className="mt-2 text-xs text-text-tertiary">
          Include requirements, responsibilities, and qualifications for best
          results.
        </p>
      </div>
    </div>
  );
}
