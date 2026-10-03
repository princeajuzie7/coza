import type { Metadata } from "next";

import { CheckInForm } from "../_form";

export const metadata: Metadata = {
  title: "Workforce check-in · TrackMate",
};

export default function WorkforceCheckInPage() {
  return <CheckInForm group="workforce" />;
}
