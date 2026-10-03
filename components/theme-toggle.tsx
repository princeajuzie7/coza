"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * No mounted flag: which icon shows is decided by CSS from the `dark` class, and
 * the current theme is only read inside the click handler — by then it is resolved.
 * That keeps the first paint identical on server and client, with no flash.
 */
export function ThemeToggle({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Switch between light and dark"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "size-9 rounded-full",
        onDark && "text-white/60 hover:bg-white/10 hover:text-white",
        className
      )}
    >
      <SunIcon className="size-4 dark:hidden" />
      <MoonIcon className="hidden size-4 dark:block" />
    </Button>
  );
}
