/**
 * Build the download filename for an optimized resume.
 *
 * Rules:
 * - If the user uploaded a resume with a filename, strip its extension
 *   and use that as the base. Otherwise fall back to "resume".
 * - If a company is provided, append "_{company}" as a suffix.
 *   Non-alphanumeric characters in the company string (spaces, punctuation,
 *   unicode) are replaced with underscores so the filename stays safe on
 *   all operating systems.
 * - Always ends in ".pdf".
 *
 * Examples:
 *   ("jane_doe.pdf", "Acme Corp")     -> "jane_doe_Acme_Corp.pdf"
 *   ("jane_doe.pdf", undefined)       -> "jane_doe.pdf"
 *   (undefined,      "Acme Corp")     -> "resume_Acme_Corp.pdf"
 *   (undefined,      undefined)       -> "resume.pdf"
 *   ("weird name.pdf", "A/B")         -> "weird name_A_B.pdf"
 */
export function buildDownloadFilename(
  originalFilename?: string,
  company?: string,
): string {
  const suffix = company ? `_${company}`.replace(/[^a-zA-Z0-9_-]/g, "_") : ""
  if (originalFilename) {
    const base = originalFilename.replace(/\.[^/.]+$/, "")
    return `${base}${suffix}.pdf`
  }
  return `resume${suffix}.pdf`
}
