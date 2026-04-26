"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import {
  DocumentArrowUpIcon,
  DocumentTextIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface ResumeUploaderProps {
  onFileChange: (file: File | null) => void;
  uploading: boolean;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  onFileChange,
  uploading,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    onFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === "application/pdf") {
      handleFileChange(files[0]);
    }
  };

  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-medium text-text-secondary">
        Resume (PDF)
      </label>
      <div
        className={[
          "rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          dragOver
            ? "border-brand bg-brand-soft dark:bg-brand/10"
            : "border-border-default hover:border-brand",
          uploading ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        ].join(" ")}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() =>
          !uploading && document.getElementById("resume-file-input")?.click()
        }
        role="button"
        tabIndex={0}
      >
        <input
          id="resume-file-input"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          disabled={uploading}
        />

        {selectedFile ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <DocumentTextIcon
              className="h-8 w-8 shrink-0 text-brand"
              aria-hidden="true"
            />
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-medium text-text-primary">
                {selectedFile.name}
              </p>
              <p className="text-xs text-text-tertiary">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFileChange(null);
              }}
              className="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-surface-2 hover:text-text-primary disabled:opacity-50"
              disabled={uploading}
              aria-label="Remove file"
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </motion.div>
        ) : (
          <div>
            <DocumentArrowUpIcon
              className="mx-auto mb-3 h-10 w-10 text-text-tertiary"
              aria-hidden="true"
            />
            <p className="mb-1 text-sm text-text-secondary">
              <span className="font-medium text-brand">
                Choose a file
              </span>{" "}
              <span className="hidden sm:inline">or drag and drop</span>
            </p>
            <p className="text-xs text-text-tertiary">
              PDF only, up to 10 MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUploader;
