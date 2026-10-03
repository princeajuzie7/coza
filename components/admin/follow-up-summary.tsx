import Link from "next/link";

import { HugeiconsIcon } from "@hugeicons/react";

import { FOLLOW_UP_TIERS, type FollowUp, countByTier } from "@/lib/register";
import { GROUP_LABEL } from "@/lib/attendance";
import { cn } from "@/lib/utils";
import { ArrowIcon, PhoneIcon } from "./icons";

const shortDate = (iso: string) =>
  new Date(`${iso}T09:00:00Z`).toLocaleDateString("en-NG", { day: "numeric", month: "short" });

/**
 * Was a wall of ~170 identical pills: unordered, undated and unusable — you
 * could not tell someone who missed one Sunday from someone last seen in April,
 * and there was nothing to do with any of them.
 *
 * Now it is triage. Three tiers summarised, then only the names worth calling
 * first, each with the date they were last here. The full queue has its own
 * page; a register is not the place to enumerate 170 people.
 */
export function FollowUpSummary({ rows, serviceDate }: { rows: FollowUp[]; serviceDate: string }) {
  if (rows.length === 0) return null;

  const counts = countByTier(rows);
  const firstToCall = rows.filter((r) => r.tier === "missed").slice(0, 9);

  return (
    <section className="bg-card overflow-hidden rounded-xl border">
      <header className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-[15px] font-bold tracking-tight">Follow-up</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {rows.length} people on record are not on this register.
          </p>
        </div>
        <Link
          href={`/admin/follow-up?date=${serviceDate}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-semibold"
        >
          Open the full queue
          <HugeiconsIcon icon={ArrowIcon} size={14} strokeWidth={2} />
        </Link>
      </header>

      {/* Three tiers, because one Sunday away and five months away are different conversations. */}
      <dl className="border-border/70 grid border-t sm:grid-cols-3 sm:divide-x sm:divide-border/70">
        {(Object.keys(FOLLOW_UP_TIERS) as Array<keyof typeof FOLLOW_UP_TIERS>).map((tier) => (
          <div key={tier} className="border-border/70 flex items-center gap-3 border-t px-5 py-4 first:border-t-0 sm:border-t-0 sm:px-6">
            <span className={cn("size-1.5 shrink-0 rounded-full", FOLLOW_UP_TIERS[tier].dot)} />
            <div className="min-w-0 flex-1">
              <dt className="font-mono text-[10px] tracking-[0.16em] uppercase">{FOLLOW_UP_TIERS[tier].label}</dt>
              <dd className="text-muted-foreground/60 mt-1 text-[11px]">{FOLLOW_UP_TIERS[tier].blurb}</dd>
            </div>
            <p className="font-mono text-[22px] leading-none font-semibold tabular-nums">{counts[tier]}</p>
          </div>
        ))}
      </dl>

      {firstToCall.length > 0 && (
        <div className="border-border/70 border-t px-5 py-5 sm:px-6">
          <p className="text-muted-foreground font-mono text-[10px] tracking-[0.18em] uppercase">
            First to call &mdash; here last service
          </p>

          <ul className="mt-4 grid gap-x-8 gap-y-px sm:grid-cols-2 lg:grid-cols-3">
            {firstToCall.map((r) => (
              <li key={r.phone} className="border-border/50 flex items-baseline gap-3 border-b py-2.5 last:border-b-0">
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{r.fullName}</span>
                <span className="text-muted-foreground/70 shrink-0 text-[11px]">{GROUP_LABEL[r.group]}</span>
                {!r.email && (
                  <HugeiconsIcon
                    icon={PhoneIcon}
                    size={12}
                    strokeWidth={2}
                    className="text-brand-orange shrink-0"
                    aria-label="No email — phone only"
                  />
                )}
                <span className="text-muted-foreground shrink-0 font-mono text-[11px] tabular-nums">
                  {shortDate(r.lastSeen)}
                </span>
              </li>
            ))}
          </ul>

          {counts.missed > firstToCall.length && (
            <p className="text-muted-foreground/60 mt-4 text-[11px]">
              and {counts.missed - firstToCall.length} more who were here last service.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
