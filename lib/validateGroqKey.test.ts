import { describe, expect, it, vi } from "vitest";

import { validateGroqKey } from "./validateGroqKey";

function makeResponse(status: number, body: unknown = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("validateGroqKey", () => {
  it("rejects empty string with format error", async () => {
    const out = await validateGroqKey("");
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.reason).toBe("format");
  });

  it("rejects key that does not start with gsk_", async () => {
    const out = await validateGroqKey("sk_live_abc1234567890");
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.reason).toBe("format");
  });

  it("rejects short key", async () => {
    const out = await validateGroqKey("gsk_short");
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.reason).toBe("format");
  });

  it("accepts valid key when Groq returns 200", async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeResponse(200, { data: [] }));

    const out = await validateGroqKey("gsk_abcdefghijklmnop1234", fetchMock);

    expect(out.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.groq.com/openai/v1/models");
    expect(init.headers.Authorization).toBe("Bearer gsk_abcdefghijklmnop1234");
  });

  it("returns unauthorized on 401", async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeResponse(401));

    const out = await validateGroqKey("gsk_abcdefghijklmnop1234", fetchMock);

    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.reason).toBe("unauthorized");
  });

  it("returns unauthorized on 403", async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeResponse(403));

    const out = await validateGroqKey("gsk_abcdefghijklmnop1234", fetchMock);

    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.reason).toBe("unauthorized");
  });

  it("returns network on 500", async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeResponse(500));

    const out = await validateGroqKey("gsk_abcdefghijklmnop1234", fetchMock);

    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.reason).toBe("network");
  });

  it("returns network on fetch rejection", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("offline"));

    const out = await validateGroqKey("gsk_abcdefghijklmnop1234", fetchMock);

    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.reason).toBe("network");
  });

  it("trims whitespace before validating", async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeResponse(200));

    const out = await validateGroqKey("  gsk_abcdefghijklmnop1234  ", fetchMock);

    expect(out.ok).toBe(true);
    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe("Bearer gsk_abcdefghijklmnop1234");
  });
});
