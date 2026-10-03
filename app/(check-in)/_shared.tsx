import Link from "next/link";

import { ArrowLeftIcon } from "lucide-react";

import { Grain, Wordmark } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { GROUP_STYLE, type AttendeeGroup } from "@/lib/attendance";
import { cn } from "@/lib/utils";

/**
 * The check-in is a ticket, not a web form: a coloured stub carrying the time,
 * a torn edge, then the part you fill in. The church runs buses from terminals,
 * so the metaphor is the literal truth of the thing.
 */
export function TicketShell({
  group,
  children,
}: {
  group: AttendeeGroup;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-muted/60 flex min-h-svh flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-5 sm:px-6">
        <Wordmark href="/" />
        <div className="flex items-center gap-1">
          <Link
            href="/"
            aria-label="Back"
            className="text-muted-foreground hover:text-foreground grid size-9 place-items-center rounded-full transition-colors"
          >
            <ArrowLeftIcon className="size-4" />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl grow px-5 pb-16 sm:px-6">
        <div className={cn("rounded-[22px]", GROUP_STYLE[group].offset)}>{children}</div>
      </main>
    </div>
  );
}

/** The coloured half of the ticket. */
export function Stub({
  group,
  children,
}: {
  group: AttendeeGroup;
  children: React.ReactNode;
}) {
  const style = GROUP_STYLE[group];

  return (
    <div className={cn("relative overflow-hidden rounded-t-[22px] px-6 pt-6 pb-7 sm:px-9 sm:pt-8 sm:pb-9", style.surface, style.ink)}>
      <Grain />
      <div className="relative">{children}</div>
    </div>
  );
}

/**
 * The tear between stub and body: a dashed rule with a notch bitten out of each
 * edge. The notches are filled with the page colour, so they read as holes.
 */
export function Perforation() {
  return (
    <div className="bg-card relative h-0">
      <div className="bg-muted/60 absolute -top-3 -left-3 size-6 rounded-full" />
      <div className="bg-muted/60 absolute -top-3 -right-3 size-6 rounded-full" />
      <div className="border-border absolute inset-x-5 -top-px border-t-2 border-dashed" />
    </div>
  );
}

/** The white half you write on. */
export function Body({ children }: { children: React.ReactNode }) {
  return <div className="bg-card rounded-b-[22px] px-6 pt-8 pb-7 sm:px-9 sm:pt-10 sm:pb-9">{children}</div>;
}

export function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-muted-foreground font-mono text-[10px] tracking-[0.2em] uppercase">{title}</h2>
      {children}
    </section>
  );
}
