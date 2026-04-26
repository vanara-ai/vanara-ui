'use client'
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react'

const STORAGE_KEY = 'vanara.apiKeys.groq'

interface ApiKeysContextType {
  groqKey: string
  hasGroqKey: boolean
  setGroqKey: (key: string) => void
  clearGroqKey: () => void
  maskedGroqKey: string
  ready: boolean
}

const ApiKeysContext = createContext<ApiKeysContextType>({
  groqKey: '',
  hasGroqKey: false,
  setGroqKey: () => {},
  clearGroqKey: () => {},
  maskedGroqKey: '',
  ready: false,
})

function mask(key: string): string {
  if (!key) return ''
  if (key.length <= 8) return '••••'
  return `${key.slice(0, 4)}••••${key.slice(-4)}`
}

export function ApiKeysProvider({ children }: { children: ReactNode }) {
  const [groqKey, setGroqKeyState] = useState<string>('')
  const [ready, setReady] = useState(false)

  // Hydrate once on mount (client-only)
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) setGroqKeyState(stored)
    } catch {
      // localStorage may be unavailable (SSR, privacy mode); ignore
    }
    setReady(true)
  }, [])

  const setGroqKey = useCallback((key: string) => {
    const trimmed = key.trim()
    setGroqKeyState(trimmed)
    try {
      if (trimmed) {
        window.localStorage.setItem(STORAGE_KEY, trimmed)
      } else {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // ignore — key stays in memory for this session
    }
  }, [])

  const clearGroqKey = useCallback(() => {
    setGroqKeyState('')
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [])

  return (
    <ApiKeysContext.Provider
      value={{
        groqKey,
        hasGroqKey: groqKey.length > 0,
        setGroqKey,
        clearGroqKey,
        maskedGroqKey: mask(groqKey),
        ready,
      }}
    >
      {children}
    </ApiKeysContext.Provider>
  )
}

export function useApiKeys() {
  return useContext(ApiKeysContext)
}
