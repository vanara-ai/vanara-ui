"use client";
import React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  XMarkIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface ResumeData {
  summary?: string;
  contact_info?: {
    full_name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
  };
  skills?: Array<{
    category: string;
    skills: string[];
  }>;
  professional_experience?: Array<{
    title: string;
    company: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    responsibilities: string[];
  }>;
  education?: Array<{
    institution?: string;
    degree: string;
    location?: string;
    start_date?: string;
    end_date?: string;
  }>;
  projects?: Array<{
    title: string;
    description: string;
  }>;
  certifications?: Array<{
    name: string;
    date?: string;
  }>;
}

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData | null;
  filename: string;
}

const SectionHeading: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-text-primary">
    <span
      className="h-1.5 w-1.5 rounded-full bg-brand"
      aria-hidden="true"
    />
    {children}
  </h3>
);

const ResumePreviewModal: React.FC<ResumePreviewModalProps> = ({
  isOpen,
  onClose,
  resumeData,
  filename,
}) => {
  const formatDate = (date?: string) => (!date ? "" : date);

  return (
    <AnimatePresence>
      {isOpen && resumeData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.25, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="resume-preview-title"
            className="absolute inset-3 flex flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface-1 shadow-2xl sm:inset-6 md:inset-10 dark:bg-surface-2"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand dark:bg-brand/15 dark:text-brand"
                  aria-hidden="true"
                >
                  <DocumentTextIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2
                    id="resume-preview-title"
                    className="text-base font-semibold text-text-primary sm:text-lg"
                  >
                    Resume preview
                  </h2>
                  <p className="truncate text-xs text-text-tertiary">
                    {filename}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 rounded-md p-2 text-text-tertiary transition-colors hover:bg-surface-2 hover:text-text-primary"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
              <div className="mx-auto max-w-3xl space-y-8">
                {/* Contact */}
                {resumeData.contact_info && (
                  <div className="rounded-xl border border-border-subtle bg-brand-soft/50 p-5 text-center dark:bg-brand/5">
                    <h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
                      {resumeData.contact_info.full_name || "Name not found"}
                    </h1>
                    <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-text-secondary">
                      {resumeData.contact_info.email && (
                        <span className="inline-flex items-center gap-1.5">
                          <EnvelopeIcon
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                          {resumeData.contact_info.email}
                        </span>
                      )}
                      {resumeData.contact_info.phone && (
                        <span className="inline-flex items-center gap-1.5">
                          <PhoneIcon className="h-4 w-4" aria-hidden="true" />
                          {resumeData.contact_info.phone}
                        </span>
                      )}
                      {resumeData.contact_info.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPinIcon
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                          {resumeData.contact_info.location}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {resumeData.summary && (
                  <section>
                    <SectionHeading>Professional summary</SectionHeading>
                    <p className="rounded-lg bg-surface-1 p-4 text-sm leading-relaxed text-text-secondary">
                      {resumeData.summary}
                    </p>
                  </section>
                )}

                {resumeData.skills && resumeData.skills.length > 0 && (
                  <section>
                    <SectionHeading>Technical skills</SectionHeading>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {resumeData.skills.map((group, i) => (
                        <div
                          key={i}
                          className="rounded-lg bg-surface-1 p-4"
                        >
                          <h4 className="mb-2 text-sm font-medium text-text-primary">
                            {group.category}
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {group.skills.map((skill, j) => (
                              <span
                                key={j}
                                className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand dark:bg-brand/15 dark:text-brand"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {resumeData.professional_experience &&
                  resumeData.professional_experience.length > 0 && (
                    <section>
                      <SectionHeading>Professional experience</SectionHeading>
                      <div className="space-y-4">
                        {resumeData.professional_experience.map((exp, i) => (
                          <div
                            key={i}
                            className="rounded-lg bg-surface-1 p-4"
                          >
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <h4 className="text-sm font-semibold text-text-primary">
                                  {exp.title}
                                </h4>
                                <p className="text-sm font-medium text-brand">
                                  {exp.company}
                                </p>
                                {exp.location && (
                                  <p className="text-xs text-text-tertiary">
                                    {exp.location}
                                  </p>
                                )}
                              </div>
                              <span className="whitespace-nowrap text-xs text-text-tertiary">
                                {formatDate(exp.start_date)} –{" "}
                                {formatDate(exp.end_date) || "Present"}
                              </span>
                            </div>
                            <ul className="mt-3 space-y-1">
                              {exp.responsibilities.map((resp, j) => (
                                <li
                                  key={j}
                                  className="flex gap-2 text-sm text-text-secondary"
                                >
                                  <span
                                    className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-400"
                                    aria-hidden="true"
                                  />
                                  <span>{resp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                {resumeData.education && resumeData.education.length > 0 && (
                  <section>
                    <SectionHeading>Education</SectionHeading>
                    <div className="space-y-3">
                      {resumeData.education.map((edu, i) => (
                        <div
                          key={i}
                          className="rounded-lg bg-surface-1 p-4"
                        >
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <h4 className="text-sm font-semibold text-text-primary">
                                {edu.degree}
                              </h4>
                              {edu.institution && (
                                <p className="text-sm text-brand">
                                  {edu.institution}
                                </p>
                              )}
                              {edu.location && (
                                <p className="text-xs text-text-tertiary">
                                  {edu.location}
                                </p>
                              )}
                            </div>
                            {(edu.start_date || edu.end_date) && (
                              <span className="whitespace-nowrap text-xs text-text-tertiary">
                                {formatDate(edu.start_date)} –{" "}
                                {formatDate(edu.end_date)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {resumeData.projects && resumeData.projects.length > 0 && (
                  <section>
                    <SectionHeading>Projects</SectionHeading>
                    <div className="space-y-3">
                      {resumeData.projects.map((project, i) => (
                        <div
                          key={i}
                          className="rounded-lg bg-surface-1 p-4"
                        >
                          <h4 className="mb-1 text-sm font-semibold text-text-primary">
                            {project.title}
                          </h4>
                          <p className="text-sm text-text-secondary">
                            {project.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {resumeData.certifications &&
                  resumeData.certifications.length > 0 && (
                    <section>
                      <SectionHeading>Certifications</SectionHeading>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {resumeData.certifications.map((cert, i) => (
                          <div
                            key={i}
                            className="rounded-lg bg-surface-1 p-3"
                          >
                            <h4 className="text-sm font-medium text-text-primary">
                              {cert.name}
                            </h4>
                            {cert.date && (
                              <p className="text-xs text-text-tertiary">
                                {cert.date}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResumePreviewModal;
