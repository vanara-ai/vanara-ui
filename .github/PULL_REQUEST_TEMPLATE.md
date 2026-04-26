## What does this PR do?

<!-- One or two sentences. What behavior / UI changes? -->

## Why?

<!-- Link to issue if applicable, or describe the motivation. -->

Closes #

## How was this tested?

- [ ] `npm run lint` passes locally
- [ ] `npm run build` is clean
- [ ] `npx tsc --noEmit` is clean
- [ ] Manually tested with a real Groq key in the BYOK modal
- [ ] Added/updated component tests (if applicable)

## Screenshots / GIFs

<!-- Before / after if this touches UI. -->

## Design principles

- [ ] BYOK preserved — Groq API key still only in localStorage + X-Groq-Key header
- [ ] App still functions when Supabase env vars are unset
- [ ] No new external calls that could leak user data

## Breaking changes

- [ ] None
- [ ] Yes (describe below)

<!-- If yes, what do existing users need to do? -->
