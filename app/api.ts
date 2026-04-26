// BYOK: every request carries the user's Groq API key via X-Groq-Key.
// The backend uses it only for that request — never logs or persists it.
//
// User identity headers (X-User-*) are included only when a logged-in
// session exists (Supabase mode). In stateless mode they are omitted.

import { buildDownloadFilename } from "@/lib/filename"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

export interface AuthHeaders {
  groqKey: string
  userId?: string
  userEmail?: string
  userName?: string
}

export function buildHeaders(auth: AuthHeaders, extra?: Record<string, string>): HeadersInit {
  if (!auth.groqKey) {
    throw new Error("Missing Groq API key. Add one in settings.")
  }
  const headers: Record<string, string> = {
    "X-Groq-Key": auth.groqKey,
  }
  if (auth.userId) headers["X-User-ID"] = auth.userId
  if (auth.userEmail) headers["X-User-Email"] = auth.userEmail
  if (auth.userName) headers["X-User-Name"] = auth.userName
  if (extra) Object.assign(headers, extra)
  return headers
}

/** Headers for endpoints that need user identity but not a Groq key. */
export function buildUserHeaders(auth: AuthHeaders): HeadersInit {
  const headers: Record<string, string> = {}
  if (auth.userId) headers["X-User-ID"] = auth.userId
  if (auth.userEmail) headers["X-User-Email"] = auth.userEmail
  if (auth.userName) headers["X-User-Name"] = auth.userName
  return headers
}

export async function handleResponse(response: Response, fallbackMessage: string) {
  if (!response.ok) {
    let detail = ""
    try {
      const data = await response.json()
      detail = data?.detail ?? ""
    } catch {
      // non-JSON body; ignore
    }
    throw new Error(detail || fallbackMessage)
  }
  return response.json()
}

export async function optimizeResume({
  resume,
  jobdesc,
  jobTitle,
  company,
  resumeTemplate,
  auth,
}: {
  resume: File
  jobdesc: string
  jobTitle?: string
  company?: string
  resumeTemplate?: string
  auth: AuthHeaders
}) {
  const formData = new FormData()
  formData.append("resume_pdf", resume)
  formData.append("jobdesc_text", jobdesc)
  if (jobTitle) formData.append("job_title", jobTitle)
  if (company) formData.append("company", company)
  if (resumeTemplate) formData.append("resume_template", resumeTemplate)

  const response = await fetch(`${API_BASE_URL}/optimize_resume/`, {
    method: "POST",
    body: formData,
    headers: buildHeaders(auth),
  })

  return handleResponse(response, "Failed to optimize resume")
}

export async function downloadOptimizedResume(
  downloadUrl: string,
  auth: AuthHeaders,
  originalFilename?: string,
  company?: string,
) {
  const response = await fetch(`${API_BASE_URL}${downloadUrl}`, {
    headers: buildHeaders(auth),
  })

  if (!response.ok) throw new Error("Failed to download optimized resume")

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url

  a.download = buildDownloadFilename(originalFilename, company)
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

export async function getResumeHistory(
  auth: AuthHeaders,
  filters?: {
    page?: number
    limit?: number
    company?: string
    minScore?: number
    maxScore?: number
    startDate?: string
    endDate?: string
  },
) {
  const params = new URLSearchParams()
  if (filters?.page) params.append("page", String(filters.page))
  if (filters?.limit) params.append("limit", String(filters.limit))
  if (filters?.company) params.append("company", filters.company)
  if (filters?.minScore !== undefined) params.append("min_score", String(filters.minScore))
  if (filters?.maxScore !== undefined) params.append("max_score", String(filters.maxScore))
  if (filters?.startDate) params.append("start_date", filters.startDate)
  if (filters?.endDate) params.append("end_date", filters.endDate)

  const response = await fetch(`${API_BASE_URL}/resume-history?${params}`, {
    headers: buildUserHeaders(auth),
  })

  return handleResponse(response, "Failed to fetch resume history")
}

export async function generatePDFFromHistory(
  generationId: string,
  auth: AuthHeaders,
  resumeTemplate: string = "resume_template_7.html",
) {
  const response = await fetch(`${API_BASE_URL}/generate-pdf`, {
    method: "POST",
    headers: buildHeaders(auth, { "Content-Type": "application/json" }),
    body: JSON.stringify({
      resume_generation_id: generationId,
      resume_template: resumeTemplate,
    }),
  })

  return handleResponse(response, "Failed to generate PDF")
}

export async function parseResume({ resume, auth }: { resume: File; auth: AuthHeaders }) {
  const formData = new FormData()
  formData.append("resume_pdf", resume)

  const response = await fetch(`${API_BASE_URL}/parse-resume/`, {
    method: "POST",
    body: formData,
    headers: buildHeaders(auth),
  })

  return handleResponse(response, "Failed to parse resume")
}

export async function getParsedResumes(auth: AuthHeaders) {
  const response = await fetch(`${API_BASE_URL}/parsed-resumes/`, {
    headers: buildUserHeaders(auth),
  })
  return handleResponse(response, "Failed to fetch parsed resumes")
}

export async function optimizeFromParsed({
  parsedResumeId,
  jobdesc,
  jobTitle,
  company,
  resumeTemplate,
  auth,
}: {
  parsedResumeId: string
  jobdesc: string
  jobTitle?: string
  company?: string
  resumeTemplate?: string
  auth: AuthHeaders
}) {
  const formData = new FormData()
  formData.append("parsed_resume_id", parsedResumeId)
  formData.append("jobdesc_text", jobdesc)
  if (jobTitle) formData.append("job_title", jobTitle)
  if (company) formData.append("company", company)
  if (resumeTemplate) formData.append("resume_template", resumeTemplate)

  const response = await fetch(`${API_BASE_URL}/optimize-from-parsed/`, {
    method: "POST",
    body: formData,
    headers: buildHeaders(auth),
  })

  return handleResponse(response, "Failed to optimize resume from parsed data")
}

export async function deleteParsedResume(parsedResumeId: string, auth: AuthHeaders) {
  const response = await fetch(`${API_BASE_URL}/parsed-resumes/${parsedResumeId}`, {
    method: "DELETE",
    headers: buildUserHeaders(auth),
  })
  return handleResponse(response, "Failed to delete parsed resume")
}

export async function submitFeedback({
  category,
  message,
  userEmail,
  userName,
  userId,
}: {
  category: string
  message: string
  userEmail?: string
  userName?: string
  userId?: string
}) {
  // Feedback does not need a Groq key — the backend doesn't call any LLM.
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (userId) headers["X-User-ID"] = userId
  if (userEmail) headers["X-User-Email"] = userEmail
  if (userName) headers["X-User-Name"] = userName

  const response = await fetch(`${API_BASE_URL}/feedback`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      category,
      message,
      user_email: userEmail,
      user_name: userName,
    }),
  })

  return handleResponse(response, "Failed to submit feedback")
}
