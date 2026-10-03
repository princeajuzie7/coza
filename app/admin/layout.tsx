import type { Metadata } from "next";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Suspense } from "react";

import { LiveIndicator } from "./_live";

export const metadata: Metadata = {
  title: { default: "TrackMate · COZA Global", template: "%s · TrackMate" },
  // These pages list names and phone numbers; keep them out of search indexes.
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      // Swaps the two semantic font vars for this subtree only. `font-sans`
      // here is load-bearing: <html> already resolved font-family to a computed
      // value, and children inherit that, so something inside the subtree has
      // to re-declare it for the override to take.
      className="font-sans"
      style={
        {
          "--font-ui": "var(--font-instrument-sans)",
          "--font-numeric": "var(--font-jetbrains-mono)",
        } as React.CSSProperties
      }
    >
      <AdminSidebar />
      <SidebarInset className="bg-muted/40">
        <header className="border-border bg-background/85 sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 backdrop-blur-xl sm:px-6">
          <SidebarTrigger className="-ml-1" />
          <span className="bg-border h-5 w-px" />
          {/* useSearchParams needs a boundary so the shell can still stream. */}
          <Suspense fallback={null}>
            <LiveIndicator />
          </Suspense>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
