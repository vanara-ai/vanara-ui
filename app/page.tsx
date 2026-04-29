"use client";
import { useState } from "react";
import { motion } from "motion/react";
import {
  KeyIcon,
  CpuChipIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { useApiKeys } from "@/contexts/ApiKeysContext";
import { useRouter } from "next/navigation";
import VanaraLogo from "./components/VanaraLogo";
import ApiKeysModal from "./components/ApiKeysModal";
import ThemeToggle from "./components/ThemeToggle";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const GITHUB_URL = "https://github.com/vanara-ai/vanara-server";
const GITHUB_UI_URL = "https://github.com/vanara-ai/vanara-ui";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const fadeUpInView = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
};

export default function Landing() {
  const { user, loading, supabaseEnabled, signInWithGoogle } = useAuth();
  const { hasGroqKey } = useApiKeys();
  const router = useRouter();
  const [keysOpen, setKeysOpen] = useState(false);

  const primaryCta = () => {
    if (supabaseEnabled && !user) return signInWithGoogle();
    if (!hasGroqKey) return setKeysOpen(true);
    return router.push("/dashboard");
  };

  const primaryLabel =
    supabaseEnabled && !user
      ? "Sign in with Google"
      : !hasGroqKey
        ? "Add your Groq API key"
        : "Open the app";

  return (
    <div className="min-h-screen bg-surface-0 text-text-primary">
      {/* Header */}
      <header className="border-b border-border-subtle bg-surface-1/70 backdrop-blur dark:bg-surface-1/30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <VanaraLogo />
          <nav className="flex items-center gap-2 text-sm">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md px-3 py-1.5 text-text-secondary transition-colors hover:text-brand"
            >
              GitHub
            </a>
            <button
              onClick={() => setKeysOpen(true)}
              className="rounded-md border border-border-default bg-surface-1 px-3 py-1.5 text-text-secondary transition-colors hover:border-border-strong hover:bg-surface-2"
            >
              {hasGroqKey ? "Manage key" : "Set API key"}
            </button>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 pt-24 pb-20 text-center md:pt-32">
        <motion.p
          {...fadeUp}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-brand/80"
        >
          Free · Open source · Your key, your machine
        </motion.p>

        <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
          <motion.span
            {...fadeUp}
            transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
            className="block"
          >
            We built this to get ourselves hired.
          </motion.span>
          <motion.span
            {...fadeUp}
            transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
            className="block text-brand"
          >
            Now it&apos;s yours.
          </motion.span>
        </h1>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.7, ease: EASE, delay: 0.35 }}
          className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-text-secondary"
        >
          Three friends working 9-to-5s, juggling family life, in a brutal
          job market. A tool we built for ourselves that actually helped at
          Amazon, Google, Capital One, Walmart, and more. It&apos;s free,
          it&apos;s open source, and your API key never leaves your machine.
        </motion.p>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            onClick={primaryCta}
            disabled={loading}
            className="rounded-lg border-2 border-brand bg-transparent px-8 py-3 text-base font-medium text-brand transition-all hover:bg-brand-soft hover:shadow-md disabled:opacity-50"
          >
            {loading ? "Loading…" : primaryLabel}
          </button>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border-default px-8 py-3 text-base font-medium text-text-secondary transition-colors hover:border-border-strong hover:bg-white dark:hover:bg-surface-3"
          >
            View on GitHub
          </a>
        </motion.div>

        {!supabaseEnabled && (
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, ease: EASE, delay: 0.65 }}
            className="mt-6 text-xs text-text-tertiary"
          >
            Running in stateless mode (no login required). Optimizations
            won&apos;t be saved to history.
          </motion.p>
        )}
      </section>

      {/* The story */}
      <section className="mx-auto max-w-2xl px-4 py-20">
        <motion.div
          {...fadeUpInView}
          transition={{ duration: 0.7, ease: EASE }}
          className="space-y-6 text-lg leading-relaxed text-text-secondary"
        >
          <p>
            Last year the three of us were full-time engineers with families,
            applying to jobs at night after the houses went quiet. The market
            was brutal. Tailoring a resume to every posting by hand was
            impossible, and generic applications didn&apos;t clear the ATS.
          </p>
          <p>
            So we built this for ourselves. A small team of agents reads the
            job description, rewrites a resume section by section, and keeps
            iterating against an ATS-style scorer until the match is actually
            strong. Not marketing-strong, measurably strong.
          </p>
          <p>
            It worked. We got selected at{" "}
            <span className="font-medium text-text-primary">
              Amazon, Google, Capital One, Walmart
            </span>
            , and a handful more. Now we&apos;re giving the tool back.
            Free, open source, and built so your API key never leaves your
            machine.
          </p>
        </motion.div>
      </section>

      {/* Logos / "Used to land interviews at" */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <motion.div
          {...fadeUpInView}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex flex-col items-center gap-6"
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-tertiary">
            Used to land interviews at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 font-mono text-sm text-text-tertiary opacity-80">
            {["Amazon", "Google", "Capital One", "Walmart", "and more"].map(
              (name, i) => (
                <motion.span
                  key={name}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }}
                  className={
                    name === "and more"
                      ? "italic text-text-tertiary"
                      : "tracking-wide"
                  }
                >
                  {name}
                </motion.span>
              ),
            )}
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-3xl px-4 py-24">
        <motion.h2
          {...fadeUpInView}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-12 text-center text-3xl font-semibold tracking-tight"
        >
          How it works
        </motion.h2>
        <ol className="space-y-6">
          {[
            {
              title: "Grab a free Groq API key",
              body: (
                <>
                  Get one at{" "}
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 hover:text-brand"
                  >
                    console.groq.com/keys
                  </a>
                  . Paste it into the settings modal. It stays on your device.
                </>
              ),
            },
            {
              title: "Upload your resume and the job description",
              body: "PDF resume in, job posting pasted in. That\u2019s it.",
            },
            {
              title: "Let the agents iterate",
              body: "Each request uses your key, so rate limits and costs are entirely yours to control.",
            },
            {
              title: "Download the optimized PDF",
              body: "Compare against the original and tune the job description if you want another pass.",
            },
          ].map((step, i) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
              className="flex gap-5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-surface-1 font-mono text-sm font-medium text-brand dark:border-brand/30 dark:bg-surface-2 dark:text-brand">
                {i + 1}
              </span>
              <div className="pt-0.5">
                <h3 className="font-medium text-text-primary">
                  {step.title}
                </h3>
                <p className="mt-1 text-text-tertiary">
                  {step.body}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* Why it's safe / open */}
      <section className="mx-auto max-w-5xl px-4 py-20">
        <motion.h2
          {...fadeUpInView}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-12 text-center text-3xl font-semibold tracking-tight"
        >
          Built to be trusted
        </motion.h2>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              Icon: KeyIcon,
              title: "Your key stays with you",
              body: "Your Groq key lives in your browser\u2019s localStorage. The server forwards it to Groq and forgets it. No database, no logs.",
            },
            {
              Icon: CpuChipIcon,
              title: "Agents do the rewrite",
              body: "The app rewrites section-by-section against an ATS-style scorer, iterating until the match is actually strong.",
            },
            {
              Icon: CodeBracketIcon,
              title: "Open source, MIT",
              body: (
                <>
                  Backend and frontend are both public on GitHub.{" "}
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 hover:text-brand"
                  >
                    Backend
                  </a>
                  {" · "}
                  <a
                    href={GITHUB_UI_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 hover:text-brand"
                  >
                    Frontend
                  </a>
                  . Fork it, audit it, self-host it.
                </>
              ),
            },
          ].map(({ Icon, title, body }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
              className="rounded-xl border border-border-subtle bg-surface-1 p-6 transition-colors hover:border-border-default dark:bg-surface-2"
            >
              <Icon
                className="mb-4 h-6 w-6 text-brand"
                aria-hidden="true"
              />
              <h3 className="font-medium text-text-primary">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-tertiary">
                {body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-2xl px-4 py-24 text-center">
        <motion.p
          {...fadeUpInView}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-xl text-text-secondary"
        >
          It helped us. We hope it helps you.
        </motion.p>
        <motion.div
          {...fadeUpInView}
          transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            onClick={primaryCta}
            disabled={loading}
            className="rounded-lg border-2 border-brand bg-transparent px-8 py-3 text-base font-medium text-brand transition-all hover:bg-brand-soft hover:shadow-md disabled:opacity-50"
          >
            {loading ? "Loading…" : primaryLabel}
          </button>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border-default px-8 py-3 text-base font-medium text-text-secondary transition-colors hover:border-border-strong hover:bg-white dark:hover:bg-surface-3"
          >
            View on GitHub
          </a>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle bg-surface-1 py-8 dark:bg-surface-0">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 text-sm text-text-tertiary">
          <div>
            © {new Date().getFullYear()} Vanara.ai · MIT Licensed ·{" "}
            <a
              href={GITHUB_URL}
              className="underline underline-offset-4 hover:text-text-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Source
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border-default bg-surface-1 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-brand hover:text-brand dark:bg-surface-2"
              title="Star on GitHub"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.17c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.72-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 015.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.4-5.25 5.68.41.36.77 1.06.77 2.14v3.17c0 .31.21.67.8.56A11.51 11.51 0 0023.5 12C23.5 5.73 18.27.5 12 .5z"/>
              </svg>
              Star on GitHub
            </a>
            <a href="/privacy" className="hover:text-text-primary">
              Privacy
            </a>
            <a href="/terms" className="hover:text-text-primary">
              Terms
            </a>
            <a
              href="mailto:vanara.ai@yahoo.com"
              className="hover:text-text-primary"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>

      <ApiKeysModal open={keysOpen} onClose={() => setKeysOpen(false)} />
    </div>
  );
}
