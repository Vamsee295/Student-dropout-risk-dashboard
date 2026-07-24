"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  LineChart,
  ClipboardList,
  Upload,
  FileText,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Logo } from "@/components/Logo";

export type SidebarProps = {
  activePath?: string;
};

export function FacultySidebar({ activePath }: SidebarProps) {
  const pathname = usePathname();
  const currentPath = activePath ?? pathname;
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const facultyItems = [
    { label: "Dashboard", href: "/faculty/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "Students", href: "/faculty/students", icon: <Users size={20} /> },
    { label: "Analytics", href: "/faculty/analytics", icon: <LineChart size={20} /> },
    { label: "Upload Data", href: "/faculty/upload", icon: <Upload size={20} /> },
    { label: "Engagement", href: "/faculty/engagement", icon: <ClipboardList size={20} /> },
    { label: "Interventions", href: "/faculty/interventions", icon: <ClipboardList size={20} /> },
    { label: "Reports", href: "/faculty/reports", icon: <FileText size={20} /> },
    { label: "Settings", href: "/settings", icon: <SettingsIcon size={20} /> },
  ];

  return (
    <aside className="hidden w-64 flex-col border-r bg-slate-50 shadow-sm md:flex border-slate-200">
      <div className="flex h-16 items-center px-6 border-b border-slate-200 bg-white">
        <Logo variant="light" className="scale-90 origin-left" />
      </div>

      <nav className="mt-4 flex-1 space-y-1 px-3">
        {facultyItems.map((item) => {
          const isActive = currentPath === item.href || (item.href !== "/faculty/dashboard" && currentPath.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-emerald-100 text-emerald-700 shadow-sm ring-1 ring-emerald-300"
                  : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }
              `}
            >
              <span className={isActive ? "text-emerald-600" : "text-slate-400"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4 bg-white">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
