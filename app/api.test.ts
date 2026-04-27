import { describe, expect, it } from "vitest"

import { buildHeaders, buildUserHeaders, handleResponse, type AuthHeaders } from "./api"

// Minimal Response polyfill — vitest runs in node where Response is available
// on modern Node (v18+), so we just use the globals.

describe("buildHeaders (BYOK-required endpoints)", () => {
  it("throws when groqKey is empty", () => {
    const auth: AuthHeaders = { groqKey: "" }
    expect(() => buildHeaders(auth)).toThrow(/Groq API key/i)
  })

  it("includes X-Groq-Key for valid auth", () => {
    const auth: AuthHeaders = { groqKey: "gsk_abc" }
    const headers = buildHeaders(auth) as Record<string, string>
    expect(headers["X-Groq-Key"]).toBe("gsk_abc")
  })

  it("includes X-User-* headers when provided", () => {
    const auth: AuthHeaders = {
      groqKey: "gsk_abc",
      userId: "u1",
      userEmail: "u@example.com",
      userName: "User One",
    }
    const headers = buildHeaders(auth) as Record<string, string>
    expect(headers["X-User-ID"]).toBe("u1")
    expect(headers["X-User-Email"]).toBe("u@example.com")
    expect(headers["X-User-Name"]).toBe("User One")
  })

  it("omits X-User-* headers when not provided (stateless mode)", () => {
    const auth: AuthHeaders = { groqKey: "gsk_abc" }
    const headers = buildHeaders(auth) as Record<string, string>
    expect(headers["X-User-ID"]).toBeUndefined()
    expect(headers["X-User-Email"]).toBeUndefined()
    expect(headers["X-User-Name"]).toBeUndefined()
  })

  it("merges extra headers (e.g. Content-Type for JSON bodies)", () => {
    const auth: AuthHeaders = { groqKey: "gsk_abc" }
    const headers = buildHeaders(auth, { "Content-Type": "application/json" }) as Record<string, string>
    expect(headers["Content-Type"]).toBe("application/json")
    expect(headers["X-Groq-Key"]).toBe("gsk_abc")
  })

  it("does not leak groqKey outside X-Groq-Key header", () => {
    const auth: AuthHeaders = { groqKey: "gsk_secret" }
    const headers = buildHeaders(auth) as Record<string, string>
    // Ensure the key is ONLY in X-Groq-Key, not mirrored elsewhere.
    const entries = Object.entries(headers)
    const leakCount = entries.filter(([k, v]) => v === "gsk_secret" && k !== "X-Groq-Key").length
    expect(leakCount).toBe(0)
  })
})

describe("buildUserHeaders (no Groq key)", () => {
  it("returns empty headers when no user fields set", () => {
    const headers = buildUserHeaders({ groqKey: "" }) as Record<string, string>
    expect(Object.keys(headers)).toHaveLength(0)
  })

  it("omits Groq key even when provided", () => {
    const auth: AuthHeaders = { groqKey: "gsk_abc", userId: "u1" }
    const headers = buildUserHeaders(auth) as Record<string, string>
    expect(headers["X-Groq-Key"]).toBeUndefined()
    expect(headers["X-User-ID"]).toBe("u1")
  })

  it("includes all X-User-* when provided", () => {
    const auth: AuthHeaders = {
      groqKey: "",
      userId: "u1",
      userEmail: "u@example.com",
      userName: "User",
    }
    const headers = buildUserHeaders(auth) as Record<string, string>
    expect(headers["X-User-ID"]).toBe("u1")
    expect(headers["X-User-Email"]).toBe("u@example.com")
    expect(headers["X-User-Name"]).toBe("User")
  })

  it("does NOT throw on empty groqKey (history-style endpoints)", () => {
    expect(() => buildUserHeaders({ groqKey: "" })).not.toThrow()
  })
})

describe("handleResponse", () => {
  it("returns parsed JSON on 2xx", async () => {
    const resp = new Response(JSON.stringify({ ok: true, data: 42 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
    const body = await handleResponse(resp, "fallback")
    expect(body).toEqual({ ok: true, data: 42 })
  })

  it("throws with backend detail on non-2xx JSON body", async () => {
    const resp = new Response(JSON.stringify({ detail: "Missing X-Groq-Key" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
    await expect(handleResponse(resp, "fallback")).rejects.toThrow("Missing X-Groq-Key")
  })

  it("throws fallback message when error body has no detail field", async () => {
    const resp = new Response(JSON.stringify({ error: "something" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
    await expect(handleResponse(resp, "Server exploded")).rejects.toThrow("Server exploded")
  })

  it("throws fallback message when error body is non-JSON", async () => {
    const resp = new Response("<!DOCTYPE html>502 Bad Gateway", {
      status: 502,
      headers: { "Content-Type": "text/html" },
    })
    await expect(handleResponse(resp, "Gateway error")).rejects.toThrow("Gateway error")
  })

  it("throws fallback when error body is empty", async () => {
    const resp = new Response("", { status: 503 })
    await expect(handleResponse(resp, "Unavailable")).rejects.toThrow("Unavailable")
  })

  it("surfaces empty-string detail as fallback (not empty error)", async () => {
    const resp = new Response(JSON.stringify({ detail: "" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
    await expect(handleResponse(resp, "Bad request")).rejects.toThrow("Bad request")
  })

  it("rejects suspiciously long detail as defense-in-depth (schema dump leak)", async () => {
    const longDetail = "Error: " + "a".repeat(1000) + " json_validate_failed"
    const resp = new Response(JSON.stringify({ detail: longDetail }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
    await expect(handleResponse(resp, "Brand-safe fallback")).rejects.toThrow(
      "Brand-safe fallback",
    )
  })

  it("accepts normal-length detail up to the limit", async () => {
    const normalDetail = "Groq didn't recognize your API key. Check Settings."
    const resp = new Response(JSON.stringify({ detail: normalDetail }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
    await expect(handleResponse(resp, "fallback")).rejects.toThrow(normalDetail)
  })

  it("rejects non-string detail (object / array payloads)", async () => {
    const resp = new Response(JSON.stringify({ detail: { nested: "schema" } }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
    await expect(handleResponse(resp, "Safe fallback")).rejects.toThrow(
      "Safe fallback",
    )
  })
})
