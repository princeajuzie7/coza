import type { Metadata } from "next";

import { FollowUpSummary } from "@/components/admin/follow-up-summary";
import { ServiceDatePicker } from "@/components/admin/service-date";
import { PageHead } from "@/components/admin/shell";
import { getCheckIns, getKnownAttendees, getServiceDates } from "@/db/queries";
import { formatChurchDate, serviceDate } from "@/lib/attendance";
import { buildFollowUps } from "@/lib/register";
import { Register } from "./_table";

export const metadata: Metadata = { title: "Register" };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ date?: string }> };

export default async function RegisterPage({ searchParams }: Props) {
  const { date } = await searchParams;
  const today = serviceDate(new Date());
  const active = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : today;

  const [rows, dates, known] = await Promise.all([
    getCheckIns(active),
    getServiceDates(),
    getKnownAttendees(),
  ]);

  // Ranked by how long they have been away, so the register links to a queue
  // rather than listing every absent name.
  const present = new Set(rows.map((r) => r.phone));
  const followUps = buildFollowUps(known, present, [...dates].sort(), active);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <PageHead
        eyebrow="Service register"
        title={formatChurchDate(new Date(`${active}T09:00:00Z`))}
      >
        <ServiceDatePicker dates={dates} active={active} />
      </PageHead>

      <Register rows={rows} serviceDate={active} />

      <FollowUpSummary rows={followUps} serviceDate={active} />
    </div>
  );
}
