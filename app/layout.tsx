import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ApiKeysProvider } from "@/contexts/ApiKeysContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vanara.ai: Open-Source Resume Optimization",
  description:
    "BYOK AI resume optimization. Your API key stays in your browser. Open-source, giving it back to the community.",
  keywords:
    "resume optimization, open source resume, AI resume, BYOK, ATS optimization, Groq, LangGraph, vanara.ai",
  authors: [{ name: "Vanara.ai" }],
  openGraph: {
    title: "Vanara.ai: Open-Source Resume Optimization",
    description:
      "BYOK AI resume optimization. Your API key stays in your browser. Open-source, giving it back to the community.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vanara.ai: Open-Source Resume Optimization",
    description:
      "BYOK AI resume optimization. Your API key stays in your browser. Open-source, giving it back to the community.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
  },
};

// Inline script that sets .dark class on <html> BEFORE React hydrates.
// Prevents a flash-of-white when the user prefers dark mode.
const themeScript = `(function(){try{var s=localStorage.getItem('vanara-theme');var d=s==='dark'||((s===null||s==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider>
          <AuthProvider>
            <ApiKeysProvider>{children}</ApiKeysProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
