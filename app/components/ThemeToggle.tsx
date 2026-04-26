"use client";

import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  className?: string;
}

/**
 * Icon-only toggle between light and dark mode.
 * Respects the user's system preference on first paint, then remembers
 * explicit choices via localStorage.
 */
export default function ThemeToggle({ className = "" }: Props) {
  const { theme, toggle } = useTheme();
  const nextLabel = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={nextLabel}
      title={nextLabel}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-2 hover:text-brand ${className}`}
    >
      {theme === "dark" ? (
        <SunIcon className="h-4.5 w-4.5" strokeWidth={2} />
      ) : (
        <MoonIcon className="h-4.5 w-4.5" strokeWidth={2} />
      )}
    </button>
  );
}
