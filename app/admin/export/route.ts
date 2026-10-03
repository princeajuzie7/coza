import { NO_BUS, STANDINGS } from "@/constant";
import { getCheckIns } from "@/db/queries";
import { ATTENDANCE_MODE_LABEL, GROUP_LABEL, formatChurchDate, formatChurchTime } from "@/lib/attendance";

const STANDING_LABEL = Object.fromEntries(STANDINGS.map((s) => [s.value, s.label])) as Record<string, string>;

/** Quote anything a spreadsheet would otherwise split or mangle. */
const cell = (value: string | null) => {
  const v = value ?? "";
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
};

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const date = params.get("date");
  const group = params.get("group") ?? "all";

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Response("A valid ?date=YYYY-MM-DD is required", { status: 400 });
  }

  const all = await getCheckIns(date);
  const rows = group === "member" || group === "workforce" ? all.filter((r) => r.group === group) : all;

  // Written for whoever opens it in Excel, not for a machine: words rather than
  // enum values, and an explicit note where an email is missing (#5, #7).
  const header = ["Time", "Name", "Status", "Group", "Unit", "Standing", "Attended", "Boarded", "Phone", "Email"];

  const body = rows.map((r) =>
    [
      formatChurchTime(new Date(r.checkedInAt)),
      r.fullName,
      r.punctuality === "early" ? "Early" : "Late",
      GROUP_LABEL[r.group],
      r.unit ?? "",
      STANDING_LABEL[r.standing] ?? r.standing,
      ATTENDANCE_MODE_LABEL[r.attendanceMode],
      r.busTerminal === NO_BUS ? "Own transport" : r.busTerminal,
      r.phone,
      r.email ?? "No email — call instead",
    ]
      .map(cell)
      .join(",")
  );

  const title = `COZA attendance — ${formatChurchDate(new Date(`${date}T09:00:00Z`))}${
    group === "all" ? "" : ` — ${GROUP_LABEL[group as "member" | "workforce"]}`
  }`;

  const csv = [cell(title), "", header.join(","), ...body].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="coza-attendance-${date}${group === "all" ? "" : `-${group}`}.csv"`,
    },
  });
}
