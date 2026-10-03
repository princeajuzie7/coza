import type { Metadata } from "next";

import { ServiceDatePicker } from "@/components/admin/service-date";
import { PageHead } from "@/components/admin/shell";
import { getCheckIns, getKnownAttendees, getServiceDates } from "@/db/queries";
import { formatChurchDate, serviceDate } from "@/lib/attendance";
import { FOLLOW_UP_TIERS, buildFollowUps, countByTier } from "@/lib/register";
import { cn } from "@/lib/utils";
import { FollowUpTable } from "./_table";

export const metadata: Metadata = { title: "Follow-up" };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ date?: string }> };

export default async function FollowUpPage({ searchParams }: Props) {
  const { date } = await searchParams;
  const today = serviceDate(new Date());
  const active = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : today;

  const [rows, dates, known] = await Promise.all([getCheckIns(active), getServiceDates(), getKnownAttendees()]);

  const present = new Set(rows.map((r) => r.phone));
  const followUps = buildFollowUps(known, present, [...dates].sort(), active);
  const counts = countByTier(followUps);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <PageHead eyebrow={`Follow-up · ${formatChurchDate(new Date(`${active}T09:00:00Z`))}`} title={`${followUps.length} to reach`}>
        <ServiceDatePicker dates={dates} active={active} />
      </PageHead>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(FOLLOW_UP_TIERS) as Array<keyof typeof FOLLOW_UP_TIERS>).map((tier) => (
          <span
            key={tier}
            className="bg-card inline-flex items-center gap-2.5 rounded-full border px-3.5 py-2 text-[13px]"
          >
            <span className={cn("size-1.5 rounded-full", FOLLOW_UP_TIERS[tier].dot)} />
            <span className="font-medium">{FOLLOW_UP_TIERS[tier].label}</span>
            <span className="text-muted-foreground/70 text-[11px]">{FOLLOW_UP_TIERS[tier].blurb}</span>
            <span className="font-mono text-[13px] font-semibold tabular-nums">{counts[tier]}</span>
          </span>
        ))}
      </div>

      <p className="text-muted-foreground max-w-3xl text-[13px]">
        Ranked by how many services someone has missed, nearest first. Derived from past check-ins, so it becomes a
        complete list only once the historic roster is imported.
      </p>

      <FollowUpTable rows={followUps} />
    </div>
  );
}
