import type { Metadata } from "next";

import { CheckInForm } from "../_form";

export const metadata: Metadata = {
  title: "Member check-in · TrackMate",
};

export default function MemberCheckInPage() {
  return <CheckInForm group="member" />;
}
