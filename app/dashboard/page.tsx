"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import { useApiKeys } from "@/contexts/ApiKeysContext";
import InlineResumePicker from "../components/InlineResumePicker";
import JobDetailsInput from "../components/JobDetailsInput";
import TemplateSelector from "../components/TemplateSelector";
import ScoreCard from "../components/ScoreCard";
import ResumeComparison from "../components/ResumeComparison";
import ResumeHistory from "../components/ResumeHistory";
import ParsedResumeManager from "../components/ParsedResumeManager";
import VanaraLogo from "../components/VanaraLogo";
import ApiKeysModal from "../components/ApiKeysModal";
import ThemeToggle from "../components/ThemeToggle";
import FeedbackFAB from "./FeedbackFAB";
import {
  optimizeResume,
  optimizeFromParsed,
  downloadOptimizedResume,
  type AuthHeaders,
} from "../api";

const GITHUB_URL = "https://github.com/vanara-ai/vanara-server";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

type ResumeData =
  | Record<string, unknown>
  | string
  | number
  | boolean
  | null
  | undefined;

interface OptimizationResult {
  initial_score: number;
  final_score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  pdf_download_url: string;
  originalFilename?: string;
  diff: {
    original: Record<string, ResumeData>;
    optimized: Record<string, ResumeData>;
  };
}

type Tab = "optimize" | "parsed" | "history";

export default function Dashboard() {
  const { user, loading, supabaseEnabled, signInWithGoogle, signOut } =
    useAuth();
  const { groqKey, hasGroqKey, maskedGroqKey, ready: keysReady } = useApiKeys();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("optimize");
  const [keysOpen, setKeysOpen] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  const [jobdesc, setJobdesc] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(
    "resume_template_7.html",
  );
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState("");
  const [showComparison, setShowComparison] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [selectedParsedResume, setSelectedParsedResume] = useState<{ id: string; filename: string } | null>(null);
  const resultRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!loading && supabaseEnabled && !user) {
      router.push("/");
    }
  }, [loading, supabaseEnabled, user, router]);

  useEffect(() => {
    if (result && resultRef.current) {
      const timer = setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [result]);

  useEffect(() => {
    if (keysReady && !hasGroqKey) {
      setKeysOpen(true);
    }
  }, [keysReady, hasGroqKey]);

  if (loading || !keysReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-soft dark:bg-surface-1">
        <p className="text-sm text-text-tertiary">Loading…</p>
      </div>
    );
  }

  const authHeaders = (): AuthHeaders => ({
    groqKey,
    userId: user?.id,
    userEmail: user?.email ?? undefined,
    userName:
      (user?.user_metadata?.full_name as string | undefined) ??
      user?.email ??
      undefined,
  });

  const handleOptimize = async () => {
    setError("");
    if (!resume && !selectedParsedResume) return setError("Please upload a resume PDF or select one from Smart Library.");
    if (!jobdesc.trim()) return setError("Please paste a job description.");
    if (!hasGroqKey) return setKeysOpen(true);

    setOptimizing(true);
    setResult(null);
    try {
      let res;
      if (selectedParsedResume) {
        res = await optimizeFromParsed({
          parsedResumeId: selectedParsedResume.id,
          jobdesc,
          jobTitle: jobTitle || undefined,
          company: company || undefined,
          resumeTemplate: selectedTemplate,
          auth: authHeaders(),
        });
        res = { ...res, originalFilename: selectedParsedResume.filename };
      } else {
        res = await optimizeResume({
          resume: resume!,
          jobdesc,
          jobTitle: jobTitle || undefined,
          company: company || undefined,
          resumeTemplate: selectedTemplate,
          auth: authHeaders(),
        });
        res = { ...res, originalFilename: resume!.name };
      }
      setResult(res);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Optimization failed";
      setError(msg);
    } finally {
      setOptimizing(false);
    }
  };

  const handleSelectParsedResume = (resume: { id: string; filename: string }) => {
    setSelectedParsedResume(resume);
    setResume(null);
    setResult(null);
    setError("");
    setActiveTab("optimize");
  };

  const canHistory = supabaseEnabled && !!user;

  return (
    <div className="min-h-screen bg-surface-0 text-text-primary">
      {/* Top bar */}
      <header className="border-b border-border-subtle bg-surface-0/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-2 px-4 py-3">
          <VanaraLogo />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setKeysOpen(true)}
              className="inline-flex min-h-[36px] items-center rounded-md border border-border-default bg-surface-1 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-border-strong hover:bg-surface-2"
              title={hasGroqKey ? "Manage API key" : "Set your Groq API key"}
            >
              {hasGroqKey ? `Key: ${maskedGroqKey}` : "Set API key"}
            </button>
            {supabaseEnabled && user && (
              <button
                type="button"
                onClick={signOut}
                className="inline-flex min-h-[36px] items-center rounded-md px-3 py-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
              >
                Sign out
              </button>
            )}
            {supabaseEnabled && !user && (
              <button
                type="button"
                onClick={signInWithGoogle}
                className="inline-flex min-h-[36px] items-center rounded-md border-2 border-brand bg-transparent px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand-soft"
              >
                Sign in
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="border-b border-border-subtle bg-surface-1">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
          {(["optimize", "parsed", "history"] as Tab[]).map((tab) => {
            const disabled = tab !== "optimize" && !canHistory;
            const label =
              tab === "optimize"
                ? "Optimize"
                : tab === "parsed"
                  ? "Smart library"
                  : "History";
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setActiveTab(tab)}
                className={[
                  "relative whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors",
                  active
                    ? "text-brand"
                    : "text-text-tertiary hover:text-text-primary",
                  disabled ? "cursor-not-allowed opacity-40" : "",
                ].join(" ")}
                title={disabled ? "Sign in to use this feature" : undefined}
              >
                {label}
                {active && (
                  <motion.span
                    layoutId="active-tab-underline"
                    className="absolute inset-x-2 bottom-0 h-0.5 rounded-t bg-brand"
                    transition={{ duration: 0.3, ease: EASE }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {!hasGroqKey && (
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.4, ease: EASE }}
            className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-100"
          >
            <strong>No Groq API key set.</strong> Optimization requires a key.{" "}
            <button
              type="button"
              onClick={() => setKeysOpen(true)}
              className="underline underline-offset-4"
            >
              Add one now
            </button>{" "}
            and it stays in your browser.
          </motion.div>
        )}

        {activeTab === "optimize" && (
          <motion.div
            initial="initial"
            animate="animate"
            variants={{
              animate: { transition: { staggerChildren: 0.08 } },
            }}
            className="space-y-5 sm:space-y-6"
          >
            {/* Two-column layout: Resume+Template left, Job right */}
            <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2">
              {/* Left column */}
              <div className="space-y-5 sm:space-y-6">
                <motion.section
                  {...fadeUp}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="rounded-xl border border-border-subtle bg-surface-1 p-5 sm:p-6 dark:bg-surface-2"
                >
                  <h2 className="mb-4 text-base font-semibold sm:text-lg">
                    Resume
                  </h2>
                  <InlineResumePicker
                    selectedParsed={selectedParsedResume}
                    selectedFile={resume}
                    onSelectParsed={(r) => {
                      if (r) {
                        setSelectedParsedResume(r);
                        setResume(null);
                      } else {
                        setSelectedParsedResume(null);
                      }
                    }}
                    onFileChange={(f) => {
                      setResume(f);
                      setSelectedParsedResume(null);
                    }}
                    disabled={optimizing}
                  />
                </motion.section>

                <motion.section
                  {...fadeUp}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="rounded-xl border border-border-subtle bg-surface-1 p-5 sm:p-6 dark:bg-surface-2"
                >
                  <h2 className="mb-4 text-base font-semibold sm:text-lg">
                    Template
                  </h2>
                  <TemplateSelector
                    selectedTemplate={selectedTemplate}
                    onTemplateChange={setSelectedTemplate}
                  />
                </motion.section>
              </div>

              {/* Right column */}
              <motion.section
                {...fadeUp}
                transition={{ duration: 0.5, ease: EASE }}
                className="rounded-xl border border-border-subtle bg-surface-1 p-5 sm:p-6 dark:bg-surface-2"
              >
                <h2 className="mb-4 text-base font-semibold sm:text-lg">
                  Target job
                </h2>
                <JobDetailsInput
                  jobTitle={jobTitle}
                  company={company}
                  jobDescription={jobdesc}
                  onJobTitleChange={setJobTitle}
                  onCompanyChange={setCompany}
                  onJobDescriptionChange={setJobdesc}
                  disabled={optimizing}
                />
              </motion.section>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-700 dark:bg-red-950/30 dark:text-red-200"
              >
                {error}
              </div>
            )}

            <div className="flex justify-stretch sm:justify-end">
              <button
                type="button"
                onClick={handleOptimize}
                disabled={optimizing || (!resume && !selectedParsedResume) || !jobdesc.trim()}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border-2 border-brand bg-transparent px-6 py-3 text-sm font-semibold text-brand transition-all hover:bg-brand-soft hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {optimizing ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                      <path
                        d="M22 12a10 10 0 0 1-10 10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    Optimizing…
                  </>
                ) : (
                  "Optimize resume"
                )}
              </button>
            </div>

            {result && (
              <motion.section
                ref={resultRef}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="scroll-mt-20 rounded-xl border border-border-subtle bg-surface-1 p-5 sm:p-6 dark:bg-surface-2"
              >
                <ScoreCard
                  initialScore={result.initial_score}
                  finalScore={result.final_score}
                  summary={result.summary}
                  strengths={result.strengths}
                  weaknesses={result.weaknesses}
                  downloadUrl={result.pdf_download_url}
                  onDownload={() =>
                    downloadOptimizedResume(
                      result.pdf_download_url,
                      authHeaders(),
                      result.originalFilename,
                      company,
                    )
                  }
                  showCompare
                  onCompare={() => setShowComparison(true)}
                />
              </motion.section>
            )}

            {result && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
                className="mt-6 text-center text-xs text-text-tertiary"
              >
                Enjoying Vanara?{" "}
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-brand"
                >
                  <svg className="mr-1 inline-block h-3.5 w-3.5 align-[-0.2em]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.17c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.72-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 015.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.4-5.25 5.68.41.36.77 1.06.77 2.14v3.17c0 .31.21.67.8.56A11.51 11.51 0 0023.5 12C23.5 5.73 18.27.5 12 .5z"/>
                  </svg>
                  Star the repo
                </a>{" "}
                or{" "}
                <a
                  href={GITHUB_URL + "#contributing"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-brand"
                >
                  contribute
                </a>{" "}
                to help it grow.
              </motion.p>
            )}
          </motion.div>
        )}

        {activeTab === "parsed" && canHistory && <ParsedResumeManager onSelectForOptimize={handleSelectParsedResume} />}
        {activeTab === "history" && canHistory && <ResumeHistory />}
      </main>

      <footer className="border-t border-border-subtle py-6">
        <p className="mx-auto max-w-6xl px-4 text-center text-xs text-text-tertiary">
          AI can make mistakes. Check important info in your resume.
        </p>
      </footer>

      <FeedbackFAB />
      <ApiKeysModal open={keysOpen} onClose={() => setKeysOpen(false)} />

      {/* Comparison Modal */}
      <AnimatePresence>
        {showComparison && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowComparison(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="relative m-4 mt-8 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-surface-0 shadow-2xl dark:bg-surface-1 sm:m-6 sm:mt-12"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Compare changes</h2>
                  <p className="text-xs text-text-tertiary">Original vs optimized, section by section</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowComparison(false)}
                  className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-surface-2 hover:text-text-primary"
                  aria-label="Close comparison"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Modal body — scrollable */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <ResumeComparison
                  original={result.diff.original}
                  optimized={result.diff.optimized}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
