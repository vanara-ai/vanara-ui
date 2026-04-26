import { describe, expect, it } from "vitest"

import { buildDownloadFilename } from "./filename"

describe("buildDownloadFilename", () => {
  describe("with original filename", () => {
    it("strips .pdf extension and appends .pdf", () => {
      expect(buildDownloadFilename("resume.pdf", undefined)).toBe("resume.pdf")
    })

    it("strips arbitrary extension", () => {
      expect(buildDownloadFilename("my_cv.docx", undefined)).toBe("my_cv.pdf")
    })

    it("preserves names without extension", () => {
      expect(buildDownloadFilename("no_extension", undefined)).toBe("no_extension.pdf")
    })

    it("strips only the last extension on multi-dot names", () => {
      expect(buildDownloadFilename("name.v2.pdf", undefined)).toBe("name.v2.pdf")
    })

    it("appends sanitized company suffix", () => {
      expect(buildDownloadFilename("jane_doe.pdf", "Acme")).toBe("jane_doe_Acme.pdf")
    })

    it("replaces spaces in company with underscores", () => {
      expect(buildDownloadFilename("jane.pdf", "Acme Corp")).toBe("jane_Acme_Corp.pdf")
    })

    it("replaces punctuation in company with underscores", () => {
      expect(buildDownloadFilename("jane.pdf", "A&T, Inc.")).toBe("jane_A_T__Inc_.pdf")
    })

    it("replaces slashes in company with underscores", () => {
      expect(buildDownloadFilename("jane.pdf", "A/B")).toBe("jane_A_B.pdf")
    })

    it("preserves allowed hyphens and underscores in company", () => {
      expect(buildDownloadFilename("jane.pdf", "A-B_C")).toBe("jane_A-B_C.pdf")
    })

    it("treats unicode company chars as non-alphanumeric", () => {
      expect(buildDownloadFilename("jane.pdf", "Acme\u00e9")).toBe("jane_Acme_.pdf")
    })
  })

  describe("without original filename", () => {
    it("falls back to resume.pdf", () => {
      expect(buildDownloadFilename(undefined, undefined)).toBe("resume.pdf")
    })

    it("applies company suffix to resume fallback", () => {
      expect(buildDownloadFilename(undefined, "Acme")).toBe("resume_Acme.pdf")
    })

    it("handles empty string filename as falsy", () => {
      expect(buildDownloadFilename("", "Acme")).toBe("resume_Acme.pdf")
    })
  })

  describe("edge cases", () => {
    it("empty company string omits suffix", () => {
      expect(buildDownloadFilename("jane.pdf", "")).toBe("jane.pdf")
    })

    it("numeric-only filename still produces .pdf", () => {
      expect(buildDownloadFilename("12345.pdf", undefined)).toBe("12345.pdf")
    })
  })
})
