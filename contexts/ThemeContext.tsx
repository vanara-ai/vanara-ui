"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";
type ThemePreference = Theme | "system";

interface ThemeContextValue {
  /** The resolved theme currently applied to <html>. Always "light" or "dark". */
  theme: Theme;
  /** User preference, including "system" (follow OS). */
  preference: ThemePreference;
  setPreference: (next: ThemePreference) => void;
  /** Convenience toggle between light and dark (clears system preference). */
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  preference: "system",
  setPreference: () => {},
  toggle: () => {},
});

const STORAGE_KEY = "vanara-theme";

function resolveTheme(pref: ThemePreference): Theme {
  if (pref === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return pref;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [theme, setTheme] = useState<Theme>("light");

  // Load stored preference on mount (client-only).
  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) as ThemePreference | null;
    const initial: ThemePreference = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    setPreferenceState(initial);
    setTheme(resolveTheme(initial));
  }, []);

  // Watch system changes when preference is "system".
  useEffect(() => {
    if (preference !== "system" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => setTheme(mq.matches ? "dark" : "light");
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, [preference]);

  // Apply .dark class to <html> whenever resolved theme changes.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const setPreference = (next: ThemePreference) => {
    setPreferenceState(next);
    setTheme(resolveTheme(next));
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next);
    }
  };

  const toggle = () => {
    setPreference(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
