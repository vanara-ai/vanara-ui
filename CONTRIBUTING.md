# Contributing to Vanara.ai: Frontend

Three friends built this because every commercial resume tool either
charged per-optimization or held us hostage to their LLM account. The
frontend lives here; the [backend is a sibling repo](https://github.com/vanara-ai/vanara-server).
Both are MIT-licensed and built on the same BYOK-forever principle.

PRs of any size are welcome: typo fixes, accessibility improvements, new
resume templates, design critiques, bug reports, component refactors. You
do not need permission to open an issue or send a PR.

New to Next.js? The [ARCHITECTURE.md](./ARCHITECTURE.md) is the fastest
way to get oriented.

## Quick Start

```bash
git clone https://github.com/vanara-ai/vanara-ui.git
cd vanara-ui
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. In the **Set API key** modal, paste a key from
[console.groq.com/keys](https://console.groq.com/keys). The key is stored in
`localStorage` on your device and sent as `X-Groq-Key` on every request.

Run checks:

```bash
npm run lint         # ESLint
npm run test         # vitest unit tests (31 tests, ~100ms)
npm run build        # production build (includes type-check)
npx tsc --noEmit     # standalone type-check
```

## Ways to Contribute

- **Bug reports / feature requests**: use the GitHub issue templates
- **Code**: see "Pull Request Process" below
- **Docs**: README, screenshots, UX walkthroughs, all welcome
- **Design**: new resume templates, accessibility fixes, dark mode

## Pull Request Process

1. **Fork** and create a topic branch: `git checkout -b feat/your-thing`
2. **Keep PRs focused**: one concern per PR. Split UI and logic changes.
3. **Run the full check locally:**
   ```bash
   npm run lint
   npm run test
   npm run build
   ```
4. **Fill in the PR template**: what, why, how tested.
5. **Update the README** if you change public behavior (env vars, flows, API calls).

## Code Style

- TypeScript strict mode. No `any` without a comment explaining why
- React functional components + hooks. No class components.
- Tailwind for styling. Avoid inline styles except for truly dynamic values
- File naming: `PascalCase.tsx` for components, `camelCase.ts` for utilities

## Design Principles (please preserve)

- **BYOK forever.** The Groq API key lives in the user's browser `localStorage`. It is never sent to a server we control, except via the `X-Groq-Key` request header to the paired backend. Don't add features that require a shared frontend key or telemetry that forwards the key.
- **Optional auth.** The app must still function when Supabase env vars are unset. History features can be gracefully hidden, but core optimize/parse flows stay available.
- **Honest UX copy.** If localStorage isn't secure against an installed browser extension, say so. No false "encrypted" claims.

## Commit Messages

Conventional-ish: `feat:`, `fix:`, `docs:`, `refactor:`, `style:`, `test:`, `chore:`. One-line subject, wrap at 72.

## Code of Conduct

This project follows the [Contributor Covenant v2.1](CODE_OF_CONDUCT.md). By participating, you agree to its terms.

## Questions?

Open an issue with the `question` label, or email vanara.ai@yahoo.com.
