"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  LineChart,
  FileText,
  Settings as SettingsIcon,
  BarChart,
  ClipboardList,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={16} /> },
  { label: "Performance", href: "/performance", icon: <BarChart size={16} /> },
  { label: "Engagement", href: "/engagement", icon: <LineChart size={16} /> }, // Using LineChart for now or custom icon
  { label: "Student List", href: "/students", icon: <Users size={16} /> },
  { label: "Profile", href: "/profile", icon: <Users size={16} /> },
  { label: "ML Insights", href: "/risk-analysis", icon: <LineChart size={16} /> },
  { label: "Interventions", href: "/interventions", icon: <ClipboardList size={16} /> },
  { label: "Reports", href: "/reports", icon: <FileText size={16} /> },
  { label: "Settings", href: "/settings", icon: <SettingsIcon size={16} /> },
];

export type SidebarProps = {
  activePath?: string;
};

export function Sidebar({ activePath }: SidebarProps) {
  const pathname = usePathname();
  const currentPath = activePath ?? pathname;

  return (
    <aside className="flex w-64 flex-col border-r bg-white shadow-sm">
      <div className="flex h-16 items-center px-6">
        <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-black text-sm font-bold text-white">
          ER
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight">
            EduRisk AI
          </span>
          <span className="text-xs font-medium text-neutral-500">
            Admin Console
          </span>
        </div>
      </div>

      <nav className="mt-4 flex-1 space-y-1 px-2 text-sm font-semibold">
        {NAV_ITEMS.map((item) => {
          const isActive =
            currentPath === item.href ||
            (item.href !== "/dashboard" && currentPath.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-2 rounded-lg px-3 py-2 transition-colors",
                isActive
                  ? "bg-black text-white"
                  : "text-neutral-800 hover:bg-neutral-100",
              ].join(" ")}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900/5">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t px-4 py-4 text-xs font-medium text-neutral-500">
        <div className="mb-1 text-[11px] uppercase tracking-wide">
          Signed in as
        </div>
        <div className="text-sm font-semibold text-neutral-900">Jane Doe</div>
        <div className="text-xs text-neutral-500">Admin</div>
      </div>
    </aside>
  );
}

