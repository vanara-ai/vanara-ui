# Changelog

All notable changes to Vanara.ai frontend are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-04-28

### Changed
- Optimize tab: side-by-side two-column layout (resume + template left, job details right)
- Resume picker: collapsed dropdown instead of full expanded list
- Compare Changes: opens in a fullscreen modal overlay instead of inline scroll
- Responsive layout adapts naturally to all screen sizes

### Added
- Initial public release of Vanara.ai frontend (Next.js 15 + React 19)
- Landing page with "built to get ourselves hired" story, company logos, MIT-license badge
- Dashboard with three tabs: Optimize, Smart Library, History
- BYOK (Bring Your Own Key) flow: Groq key stored in browser `localStorage` only, sent directly to backend via `X-Groq-Key` header
- Inline resume picker (upload new PDF OR reuse a parsed resume)
- Job details input (title, company, description)
- Template selector (elegant / classic)
- Score card with animated ATS ring, strengths / gaps, before / after delta
- Section-by-section diff viewer (react-diff-viewer)
- Resume history with pagination, filters, re-download
- Smart Library: cache of parsed resumes for reuse without re-parsing
- Feedback FAB (floating action button): bug report, feature request, general feedback
- Optional Supabase Google OAuth (app runs stateless without it)
- Dark mode support (Tailwind CSS with `dark:` variants)
- Framer Motion (`motion/react`) for landing and dashboard animations
- Responsive design (mobile → desktop)
- CI workflow (GitHub Actions): lint, type-check, build, unit tests
- Unit test suite (31 tests via Vitest) covering BYOK header helpers (`buildHeaders`, `buildUserHeaders`), `handleResponse` error paths, and download-filename construction
- `lib/filename.ts`: extracted pure filename-builder from `downloadOptimizedResume` for testability
- `vitest.config.ts` with v8 coverage reporter configured for `app/**/*.ts` and `lib/**/*.ts`
- `npm run test`, `npm run test:watch`, `npm run test:coverage` scripts

### Security
- Groq API key never transmitted to Vanara-owned servers; only to the backend endpoint the user points the app at
- Auth tokens handled entirely by Supabase SDK; no token persistence in app code
- `.npmrc` pinned to `https://registry.npmjs.org/` to avoid inheriting the global PeruNPM proxy

[Unreleased]: https://github.com/vanara-ai/vanara-ui/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/vanara-ai/vanara-ui/releases/tag/v1.0.0
