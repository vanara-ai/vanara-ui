# Security Policy

## Reporting a Vulnerability

If you discover a security issue in Vanara.ai frontend, please **do not** open a public GitHub issue.

Instead, email the maintainer directly:

**vanara.ai@yahoo.com**

Include:
- A description of the issue and its potential impact
- Steps to reproduce (proof-of-concept code welcome)
- Your name/handle if you'd like credit

You'll receive acknowledgment within 72 hours. Fixes for confirmed issues are typically released within 14 days, coordinated with you before public disclosure.

## Scope

### In scope
- DOM-based XSS or injection via rendered resume content
- Leakage of the user's Groq API key via logs, network requests, analytics, or URL params
- CSRF or clickjacking against the authenticated dashboard
- Session/auth issues in the optional Supabase-backed auth flow
- Exploitable dependency CVEs in production dependencies
- Cross-origin misconfiguration exposing user data

### Out of scope
- Issues in third-party services (Supabase, Groq, Vercel — report to those vendors)
- Vulnerabilities requiring a compromised browser extension or malicious device
- Issues requiring a user to paste their own API key into a malicious UI
- Rate limiting (requests are priced to the user's own Groq key)
- Social engineering or phishing scenarios

## Supported Versions

Only the `main` branch receives security updates. Deployed instances should pull from `main` regularly.

## Design Principles

Vanara.ai is a BYOK (bring-your-own-key) frontend:
- The Groq API key is stored in browser `localStorage` under `vanara.apiKeys.groq`
- The key is attached to outgoing requests as the `X-Groq-Key` header — never posted to URL params, never logged to analytics, never persisted server-side
- No telemetry or feature-flag service has visibility into API keys or resume content
- Supabase auth (if configured) never sees the Groq key
