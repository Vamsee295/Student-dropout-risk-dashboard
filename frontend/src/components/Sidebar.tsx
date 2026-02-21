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
  ClipboardList,
  Upload,
  LogOut
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

import { Logo } from "@/components/Logo";

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

export type SidebarProps = {
  activePath?: string;
};

export function Sidebar({ activePath }: SidebarProps) {
  const pathname = usePathname();
  const currentPath = activePath ?? pathname;
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const role = user?.role || "GUEST";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const facultyItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "Students", href: "/students", icon: <Users size={20} /> },
    { label: "Analytics", href: "/dashboard/analytics", icon: <LineChart size={20} /> },
    { label: "Upload Data", href: "/dashboard/upload", icon: <Upload size={20} /> },
    { label: "Engagement", href: "/engagement", icon: <ClipboardList size={20} /> },
    { label: "Interventions", href: "/interventions", icon: <ClipboardList size={20} /> },
    { label: "Reports", href: "/dashboard/reports", icon: <FileText size={20} /> },
    { label: "Settings", href: "/settings", icon: <SettingsIcon size={20} /> },
  ];

  const items = facultyItems;

  return (
    <aside className="hidden w-64 flex-col border-r bg-white shadow-sm md:flex">
      <div className="flex h-16 items-center px-6 border-b">
        <Logo variant="light" className="scale-90 origin-left" />
      </div>

      <nav className="mt-6 flex-1 space-y-1 px-3">
        {items.map((item) => {
          const isActive = currentPath === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
              `}
            >
              <span className={`${isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-500"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
