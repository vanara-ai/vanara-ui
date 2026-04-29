"use client";
import Link from "next/link";
import { motion } from "motion/react";
import VanaraLogo from "../components/VanaraLogo";
import ThemeToggle from "../components/ThemeToggle";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const GITHUB_URL = "https://github.com/vanara-ai/vanara-server";
const GITHUB_UI_URL = "https://github.com/vanara-ai/vanara-ui";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-surface-0 text-text-primary">
      {/* Header */}
      <header className="border-b border-border-subtle bg-surface-1/70 backdrop-blur dark:bg-surface-1/30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/">
            <VanaraLogo />
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="rounded-md px-3 py-1.5 text-text-secondary transition-colors hover:text-brand"
            >
              Home
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md px-3 py-1.5 text-text-secondary transition-colors hover:text-brand"
            >
              GitHub
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-3xl px-4 pt-16 pb-24">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-brand/80">
            Privacy Policy
          </p>
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
            What we collect. What we don&apos;t.
          </h1>
          <p className="mt-4 text-sm text-text-tertiary">
            Last updated: April 29, 2026
          </p>
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          className="mt-12 space-y-10 text-[1.0625rem] leading-relaxed text-text-secondary"
        >
          <div>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">
              The short version
            </h2>
            <p>
              Vanara.ai is open source. The code is public. We wrote it for
              ourselves and released it because we think the job market needed
              this. We try hard not to collect data we don&apos;t need.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">
              Your Groq API key
            </h2>
            <p>
              Your Groq API key is stored in your browser&apos;s
              localStorage. It is sent with each request in an{" "}
              <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-sm">
                X-Groq-Key
              </code>{" "}
              header. Our server forwards that key straight to Groq and
              forgets it. It is never written to a database. It is not logged.
            </p>
            <p className="mt-3">
              You control the key. You rotate it. You delete it. We have no
              way to see it after the request completes.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">
              If you sign in with Google
            </h2>
            <p>
              Signing in is optional. Vanara.ai works without an account in
              stateless mode, though without sign-in we can&apos;t save your
              optimization history.
            </p>
            <p className="mt-3">
              When you sign in, Google gives us your email address and basic
              profile info through Supabase auth. We use this to identify you
              across sessions and save your resume uploads and optimization
              runs so you can come back to them later. That&apos;s the only
              thing we do with it.
            </p>
            <p className="mt-3">
              We do not share it with anyone. We do not email you marketing.
              You can sign out and delete your data at any time by contacting
              us.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">
              What we store (and where)
            </h2>
            <p>
              When you&apos;re signed in, we store your uploaded resumes and
              optimization results in Supabase Postgres. This is so you can
              reload them later. Resume files are stored in Supabase Storage.
              All of it is tied to your account.
            </p>
            <p className="mt-3">
              Data goes to Groq&apos;s API when you run an optimization, so
              Groq processes your resume and the job description. Their
              privacy policy applies to that step.
            </p>
            <p className="mt-3">
              Beyond that: no third-party analytics, no ad pixels, no session
              replay, no data sold to anyone.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">
              Server logs
            </h2>
            <p>
              Our server logs basic request metadata for debugging:
              timestamps, endpoint paths, status codes. We do not log
              resume content, job descriptions, or API keys. Logs are
              retained for 30 days then rotated out.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">
              Cookies
            </h2>
            <p>
              We use a session cookie from Supabase to keep you signed in.
              That&apos;s it. No tracking cookies. No third-party cookies.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">
              Delete your data
            </h2>
            <p>
              Email{" "}
              <a
                href="mailto:vanara.ai@yahoo.com"
                className="text-text-primary underline underline-offset-4 hover:text-brand"
              >
                vanara.ai@yahoo.com
              </a>{" "}
              from your account email and we&apos;ll delete your account,
              resumes, and optimization history within 7 days.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">
              Verify any of this yourself
            </h2>
            <p>
              Vanara.ai is MIT licensed and fully open source. Read the
              code:{" "}
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-primary underline underline-offset-4 hover:text-brand"
              >
                backend
              </a>{" "}
              ·{" "}
              <a
                href={GITHUB_UI_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-primary underline underline-offset-4 hover:text-brand"
              >
                frontend
              </a>
              . If we say we don&apos;t store something, you can grep the
              source and confirm.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">
              Changes
            </h2>
            <p>
              If this policy changes, we&apos;ll update the date at the top
              and note the change in the commit history of this page.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">
              Contact
            </h2>
            <p>
              Questions: email{" "}
              <a
                href="mailto:vanara.ai@yahoo.com"
                className="text-text-primary underline underline-offset-4 hover:text-brand"
              >
                vanara.ai@yahoo.com
              </a>
              .
            </p>
          </div>
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
            <Link href="/privacy" className="hover:text-text-primary">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-text-primary">
              Terms
            </Link>
            <a
              href="mailto:vanara.ai@yahoo.com"
              className="hover:text-text-primary"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}