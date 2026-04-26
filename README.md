# Vanara.ai: ResumeAI Frontend

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-20%2B-339933)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

> **Open-source resume optimization. Giving it back to the community.**

Next.js 15 frontend for [Vanara.ai](https://github.com/vanara-ai/vanara-server).
Users paste a Groq API key once (it stays in their browser) and upload a
resume + job description to drive the multi-agent optimizer.

**The backend lives in a sibling repo:
[resumeai](https://github.com/vanara-ai/vanara-server).**

## 🔑 BYOK

Your Groq API key is stored in `localStorage` on your device. Every request
to the backend carries it via the `X-Groq-Key` header. The backend uses it
only for that request and immediately discards it. Nothing is logged or
persisted server-side.

## 🚀 Quickstart

```bash
# 1. clone
git clone https://github.com/vanara-ai/vanara-serverui.git
cd resumeaiui

# 2. install
npm install

# 3. configure (Supabase is optional; see .env.example)
cp .env.example .env.local

# 4. run
npm run dev
```

Open http://localhost:3000, click **Set API key**, paste a key from
[console.groq.com/keys](https://console.groq.com/keys), and go.

The frontend talks to a backend on `NEXT_PUBLIC_API_BASE_URL`
(defaults to `http://localhost:8000`).

## 🏗️ What's where

```
app/
├── page.tsx                    # Landing
├── layout.tsx                  # Root providers (Auth + ApiKeys)
├── dashboard/page.tsx          # Main app: upload, optimize, history
├── dashboard/FeedbackFAB.tsx   # Floating feedback widget
├── api.ts                      # Thin client for the backend
└── components/
    ├── ApiKeysModal.tsx        # BYOK settings: save / clear / reveal
    ├── ResumeUploader.tsx
    ├── JobDetailsInput.tsx
    ├── TemplateSelector.tsx
    ├── ScoreCard.tsx
    ├── ResumeComparison.tsx
    ├── ResumeHistory.tsx       # Supabase-only
    ├── InlineResumePicker.tsx  # Saved-resume picker in Optimize tab
    ├── ParsedResumeManager.tsx # Supabase-only: "Smart Library"
    └── ResumePreviewModal.tsx
contexts/
├── AuthContext.tsx             # Supabase login (optional)
└── ApiKeysContext.tsx          # BYOK localStorage-backed store
lib/supabase.ts                 # Supabase client (null when unset)
```

> 📖 **Deeper dive:** see [ARCHITECTURE.md](./ARCHITECTURE.md) for flow diagrams, state-management decisions, and full request sequence breakdown.

## ⚡ Two Modes

| | Stateless (default) | Full (Supabase) |
|---|---|---|
| **Setup** | Just `npm run dev` | Add `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local` |
| **Optimize** | ✅ | ✅ |
| **Google sign-in** | – | ✅ |
| **Smart Library** | – | ✅ Parse once, reuse across jobs |
| **Resume history** | – | ✅ Per-user, filterable |
| **Feedback** | ✅ (not stored) | ✅ Stored to Supabase |

In **stateless** mode the app shows only the Optimize tab; no login, no history.
In **full** mode, set the two Supabase env vars and the full UI lights up automatically.

## 🔐 Privacy model

| Data | Where it lives |
|---|---|
| Your Groq API key | `localStorage` on this device. Sent as `X-Groq-Key` header on every optimize/parse call. |
| Your resume + job description | Forwarded to the backend, which forwards to Groq. Only persisted if you signed in (Supabase mode). |
| Your key on the backend | **Never.** Used for the request, then discarded. |

Verify it yourself; the relevant code is
[`contexts/ApiKeysContext.tsx`](./contexts/ApiKeysContext.tsx) and
[`app/api.ts`](./app/api.ts).

## 🧪 Verify locally

```bash
npm run lint            # ESLint + Next.js rules
npm test                # 31 unit tests (vitest)
npm run build           # Production build (also runs type-check)
```

Tests cover:
- **BYOK header helpers** (`buildHeaders`, `buildUserHeaders`): ensuring the Groq key only ever goes into `X-Groq-Key`
- **Response handling**: backend `detail` errors propagate and fallback messages kick in on empty / non-JSON bodies
- **Download filename builder**: company sanitization, extension stripping, fallback when no original filename is available

Runs in ~100ms. No DOM, no network. Pure-logic tests only.

## 🤝 Contributing

PRs of any size are welcome: typo fixes, accessibility improvements, new
resume templates, design critiques, bug reports, component refactors. You
do not need permission to open an issue or send a PR.

Start with [CONTRIBUTING.md](./CONTRIBUTING.md) for setup and the PR
checklist. By contributing you agree to the
[Code of Conduct](./CODE_OF_CONDUCT.md).

## 🙏 Acknowledgments

Built by three friends who got tired of paying for resume optimizers.
See [AUTHORS](./AUTHORS) for the core team and the GitHub contributors
page for everyone who has pitched in.

## 📜 License

MIT. See [LICENSE](./LICENSE).
