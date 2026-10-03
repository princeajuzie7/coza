import Image from "next/image";
import Link from "next/link";

import { APP_NAME } from "@/constant";
import { cn } from "@/lib/utils";

/**
 * Distressed paper grain, as on COZA's own posters. An SVG turbulence filter
 * rather than an image: a few hundred bytes, scales to any block, never blurs.
 */
export function Grain({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay", className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

export function Emblem({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <Image
      src="/logo-mark.png"
      alt=""
      width={36}
      height={36}
      priority
      className={cn(onDark ? "invert" : "dark:invert", className)}
    />
  );
}

export function Wordmark({ onDark = false, href }: { onDark?: boolean; href?: string }) {
  const inner = (
    <span className="flex items-center gap-2.5">
      <Emblem onDark={onDark} className="size-8" />
      <span className="leading-none">
        <span className={cn("block text-[15px] font-extrabold tracking-tight", onDark && "text-white")}>
          COZA Global
        </span>
        <span
          className={cn(
            "mt-1 block font-mono text-[9px] tracking-[0.22em] uppercase",
            onDark ? "text-white/40" : "text-muted-foreground"
          )}
        >
          {APP_NAME}
        </span>
      </span>
    </span>
  );

  return href ? (
    <Link href={href} className="transition-opacity hover:opacity-70">
      {inner}
    </Link>
  ) : (
    inner
  );
}

/**
 * The solid offset block behind a card — lifted straight from the eChurch
 * poster, where an orange rectangle sits behind the purple one. Replaces the
 * soft drop shadow every template reaches for.
 */
export function OffsetCard({
  children,
  offset,
  className,
}: {
  children: React.ReactNode;
  offset: string;
  className?: string;
}) {
  return <div className={cn("rounded-[22px]", offset, className)}>{children}</div>;
}
