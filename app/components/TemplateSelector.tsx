"use client";
import React from "react";
import {
  SparklesIcon,
  DocumentTextIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (template: string) => void;
  disabled?: boolean;
}

const templates = [
  {
    id: "resume_template_7.html",
    name: "Elegant",
    description: "Modern, clean layout with subtle styling",
    Icon: SparklesIcon,
  },
  {
    id: "resume_template_10.html",
    name: "Classic",
    description: "Traditional, professional format",
    Icon: DocumentTextIcon,
  },
];

export default function TemplateSelector({
  selectedTemplate,
  onTemplateChange,
  disabled = false,
}: TemplateSelectorProps) {
  return (
    <div>
      <label className="mb-3 block text-sm font-medium text-text-secondary">
        Resume template
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {templates.map(({ id, name, description, Icon }) => {
          const selected = selectedTemplate === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTemplateChange(id)}
              disabled={disabled}
              className={[
                "flex min-h-[88px] flex-col gap-2 rounded-lg border p-4 text-left transition-colors",
                "disabled:cursor-not-allowed disabled:opacity-50",
                selected
                  ? "border-brand bg-brand-soft dark:bg-brand/10"
                  : "border-border-subtle bg-surface-1 hover:border-border-default dark:bg-surface-2 dark:hover:border-border-strong",
              ].join(" ")}
              aria-pressed={selected}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-5 w-5 ${
                    selected
                      ? "text-brand"
                      : "text-text-tertiary"
                  }`}
                  aria-hidden="true"
                />
                <h3 className="text-sm font-medium text-text-primary">
                  {name}
                </h3>
              </div>
              <p className="text-xs text-text-tertiary">
                {description}
              </p>
              {selected && (
                <div className="mt-auto flex items-center gap-1 text-xs font-medium text-brand">
                  <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Selected
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
