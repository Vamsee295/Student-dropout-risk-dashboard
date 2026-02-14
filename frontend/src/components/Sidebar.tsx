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
  Upload,
  UserCheck,
  BookOpen,
  AlertTriangle,
  LogOut
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

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

  const studentItems: NavItem[] = [
    { label: "Overview", href: "/student-dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "My Performance", href: "/student-dashboard/performance", icon: <BarChart size={20} /> },
    { label: "Attendance", href: "/student-dashboard/attendance", icon: <UserCheck size={20} /> },
    { label: "Assignments", href: "/student-dashboard/assignments", icon: <BookOpen size={20} /> },
    { label: "Risk Status", href: "/student-dashboard/risk", icon: <AlertTriangle size={20} /> },
    { label: "Profile", href: "/profile", icon: <Users size={20} /> },
    // { label: "Reports", href: "/reports", icon: <FileText size={20} /> },
  ];

  const facultyItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "Students", href: "/students", icon: <Users size={20} /> },
    { label: "Analytics", href: "/dashboard/analytics", icon: <LineChart size={20} /> },
    { label: "Upload Data", href: "/dashboard/upload", icon: <Upload size={20} /> },
    { label: "Interventions", href: "/interventions", icon: <ClipboardList size={20} /> },
    { label: "Reports", href: "/dashboard/reports", icon: <FileText size={20} /> },
    { label: "Settings", href: "/settings", icon: <SettingsIcon size={20} /> },
  ];

  const items = role === "STUDENT" ? studentItems : facultyItems;

  return (
    <aside className="hidden w-64 flex-col border-r bg-white shadow-sm md:flex">
      <div className="flex h-16 items-center px-6 border-b">
        <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
          {role === "STUDENT" ? "S" : "F"}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-gray-900">
            EduRisk AI
          </span>
          <span className="text-xs font-medium text-gray-500">
            {role === "STUDENT" ? "Student Portal" : "Faculty Admin"}
          </span>
        </div>
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
