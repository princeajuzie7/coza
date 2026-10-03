"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export type NavItem = {
  title: string;
  url: string;
  icon: IconSvgElement;
  badge?: number;
};

function isActive(pathname: string, url: string) {
  if (url === "/admin") return pathname === "/admin";
  return pathname === url || pathname.startsWith(`${url}/`);
}

export function NavMain({ items, label }: { items: NavItem[]; label: string }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="font-mono text-[9px] tracking-[0.2em] uppercase">{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton
              tooltip={item.title}
              isActive={isActive(pathname, item.url)}
              render={
                <Link href={item.url}>
                  <HugeiconsIcon icon={item.icon} size={18} strokeWidth={1.8} />
                  <span>{item.title}</span>
                </Link>
              }
            />
            {item.badge !== undefined && (
              <SidebarMenuBadge className="font-mono tabular-nums">{item.badge}</SidebarMenuBadge>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
