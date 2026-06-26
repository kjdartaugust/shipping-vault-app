import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "VaultEx — Ship. Secure. Control.",
  description:
    "Enterprise-grade logistics command with an AES-256 encrypted document vault. Track shipments, secure high-value documents, and control access with military-grade precision.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${mono.variable} font-sans`}>
        <ThemeProvider attribute="class" forcedTheme="dark" enableSystem={false}>
          {children}
          <Toaster
            richColors
            position="top-right"
            theme="dark"
            toastOptions={{ style: { fontFamily: "var(--font-inter)" } }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
