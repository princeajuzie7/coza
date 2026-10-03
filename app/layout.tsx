import type { Metadata } from "next";
import { Archivo, Geist_Mono, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// Geometric grotesque — the closest match to COZA's own display type.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * The admin's own pair. Public pages keep Archivo, which matches COZA's display
 * type; the console is an instrument and reads better in a face built for dense
 * data — and the figures are the point, so the mono does most of the work.
 */
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "COZA Global · TrackMate",
  description: "TrackMate — Sunday check-in and attendance for The Commonwealth of Zion Assembly.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${archivo.variable} ${geistMono.variable} ${instrumentSans.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
