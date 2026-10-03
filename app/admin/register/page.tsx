import type { Metadata } from "next";

import { AbsentIcon } from "@/components/admin/icons";
import { PageHead, ServiceDateRail } from "@/components/admin/shell";
import { HugeiconsIcon } from "@hugeicons/react";
import { getCheckIns, getKnownAttendees, getServiceDates } from "@/db/queries";
import { GROUP_LABEL, STATUS_STYLE, formatChurchDate, serviceDate } from "@/lib/attendance";
import { cn } from "@/lib/utils";
import { Register } from "./_table";

export const metadata: Metadata = { title: "Register" };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ date?: string }> };

export default async function RegisterPage({ searchParams }: Props) {
  const { date } = await searchParams;
  const today = serviceDate(new Date());
  const active = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : today;

  const [rows, dates, known] = await Promise.all([getCheckIns(active), getServiceDates(), getKnownAttendees()]);

  // Absent = someone seen at a previous service who is not on this one. It is
  // the only honest definition available until the historic roster is imported.
  const present = new Set(rows.map((r) => r.phone));
  const absentees = known.filter((k) => !present.has(k.phone));
  const dateOptions = [...new Set([today, ...dates])].sort().reverse().slice(0, 10);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <PageHead eyebrow="Service register" title={formatChurchDate(new Date(`${active}T09:00:00Z`))}>
        <ServiceDateRail dates={dateOptions} active={active} today={today} basePath="/admin/register" />
      </PageHead>

      <Register rows={rows} serviceDate={active} />

      {absentees.length > 0 && (
        <section className="pt-6">
          <div className="flex items-center gap-4">
            <h2 className="flex items-center gap-2 font-mono text-[10px] tracking-[0.28em] uppercase">
              <HugeiconsIcon icon={AbsentIcon} size={14} strokeWidth={2} />
              Not seen today
            </h2>
            <span className="bg-border h-px flex-1" />
          </div>
          <p className="text-muted-foreground mt-3 max-w-2xl text-[13px]">
            People who checked in at a previous service but are not on this one. Derived from past check-ins, so it
            becomes a true absence list only once the historic roster is imported.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {absentees.map((a) => (
              <li key={a.phone} className="bg-card flex items-center gap-2.5 rounded-full border px-3 py-1.5 text-[13px]">
                <span className={cn("size-1.5 rounded-full", STATUS_STYLE.absent.dot)} />
                <span className="font-medium">{a.fullName}</span>
                <span className="text-muted-foreground font-mono text-[11px]">{GROUP_LABEL[a.group]}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
