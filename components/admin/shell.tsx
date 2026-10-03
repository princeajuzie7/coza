import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { cn } from "@/lib/utils";

/** Page title block — every admin page opens the same way. */
export function PageHead({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <p className="text-muted-foreground font-mono text-[10px] tracking-[0.28em] uppercase">{eyebrow}</p>
        <h1 className="mt-3 text-[clamp(1.6rem,3.5vw,2.3rem)] leading-[1.05] font-extrabold tracking-[-0.03em]">
          {title}
        </h1>
      </div>
      {children}
    </div>
  );
}

/**
 * A figure, not a widget. Oversized mono numeral on a hairline — readable from
 * across a desk, and nothing like the icon-in-a-rounded-box card every
 * dashboard template ships with.
 */
export function Stat({
  label,
  value,
  dot,
  hint,
  icon,
}: {
  label: string;
  value: number | string;
  dot?: string;
  hint?: string;
  icon?: IconSvgElement;
}) {
  return (
    <div className="border-border/70 border-t pt-5">
      <dt className="text-muted-foreground flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] uppercase">
        {dot && <span className={cn("size-1.5 shrink-0 rounded-full", dot)} />}
        {icon && <HugeiconsIcon icon={icon} size={13} strokeWidth={2} className="shrink-0 opacity-70" />}
        {label}
      </dt>
      <dd className="mt-3 font-mono text-[clamp(1.75rem,4vw,2.5rem)] leading-none font-semibold tracking-[-0.04em] tabular-nums">
        {value}
      </dd>
      {hint && <p className="text-muted-foreground/60 mt-2 text-[11px]">{hint}</p>}
    </div>
  );
}

/** Panel for a chart or a list. Hairline border, mono caption, no drop shadow. */
export function Panel({
  title,
  caption,
  action,
  className,
  children,
}: {
  title: string;
  caption?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("bg-card rounded-xl border p-5 sm:p-6", className)}>
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-bold tracking-tight">{title}</h2>
          {caption && <p className="text-muted-foreground mt-1 text-xs">{caption}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
