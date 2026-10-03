"use client";

import Image from "next/image";
import Link from "next/link";

import { HugeiconsIcon } from "@hugeicons/react";

import { APP_NAME, CHURCH } from "@/constant";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { AbsentIcon, ArrowIcon, MembersIcon, OverviewIcon, RegisterIcon, WorkforceIcon } from "./icons";
import { NavMain, type NavItem } from "./nav-main";

const SERVICE_NAV: NavItem[] = [
  { title: "Overview", url: "/admin", icon: OverviewIcon },
  { title: "Register", url: "/admin/register", icon: RegisterIcon },
  { title: "Follow-up", url: "/admin/follow-up", icon: AbsentIcon },
];

const CHECK_IN_NAV: NavItem[] = [
  { title: "Member check-in", url: "/members", icon: MembersIcon },
  { title: "Workforce check-in", url: "/workers", icon: WorkforceIcon },
];

export function AdminSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="h-16 justify-center px-3 group-data-[collapsible=icon]:px-0">
        <Link href="/" className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <span className="bg-foreground grid size-9 shrink-0 place-items-center rounded-xl">
            <Image src="/logo-mark.png" alt="" width={22} height={22} className="size-[22px] invert dark:invert-0" />
          </span>
          <span className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-[14px] leading-tight font-extrabold tracking-tight">{CHURCH.name}</span>
            <span className="text-muted-foreground font-mono text-[9px] tracking-[0.2em] uppercase">{APP_NAME}</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0 py-2">
        <NavMain items={SERVICE_NAV} label="Service" />
        <NavMain items={CHECK_IN_NAV} label="Check-in" />
      </SidebarContent>

      <SidebarFooter className="px-2 pb-3">
        <SidebarMenu className="gap-1.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Church website"
              render={
                <Link href="/">
                  <HugeiconsIcon icon={ArrowIcon} size={18} strokeWidth={1.8} />
                  <span>Church website</span>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
