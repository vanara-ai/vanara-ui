// Validates a Groq API key by hitting Groq's /models endpoint directly.
// Keeps BYOK contract intact: the key is sent to Groq only, never to our backend.

export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: "format" | "unauthorized" | "network"; message: string };

const GROQ_MODELS_URL = "https://api.groq.com/openai/v1/models";

export async function validateGroqKey(
  key: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ValidationResult> {
  const trimmed = key.trim();

  if (!trimmed.startsWith("gsk_") || trimmed.length < 20) {
    return {
      ok: false,
      reason: "format",
      message: "Expected a key starting with gsk_. Check that you pasted the full key.",
    };
  }

  try {
    const res = await fetchImpl(GROQ_MODELS_URL, {
      method: "GET",
      headers: { Authorization: `Bearer ${trimmed}` },
    });

    if (res.status === 401 || res.status === 403) {
      return {
        ok: false,
        reason: "unauthorized",
        message: "Groq rejected this key. Create a new one at console.groq.com/keys.",
      };
    }

    if (!res.ok) {
      return {
        ok: false,
        reason: "network",
        message: `Groq returned ${res.status}. Try again in a moment.`,
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      reason: "network",
      message: "Could not reach Groq. Check your connection.",
    };
  }
}

