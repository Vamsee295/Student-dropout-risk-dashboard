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
  LogOut,
  Building2,
  GraduationCap,
  BrainCircuit,
  TrendingUp,
  Target,
  Activity,
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

  const studentItems: NavItem[] = [
    { label: "Overview", href: "/student-dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "My Performance", href: "/student-dashboard/performance", icon: <BarChart size={20} /> },
    { label: "Attendance", href: "/student-dashboard/attendance", icon: <UserCheck size={20} /> },
    { label: "Assignments", href: "/student-dashboard/assignments", icon: <BookOpen size={20} /> },
    { label: "Engagement", href: "/student-dashboard/engagement", icon: <LineChart size={20} /> },
    { label: "Risk Status", href: "/student-dashboard/risk", icon: <AlertTriangle size={20} /> },
    { label: "Profile", href: "/profile", icon: <Users size={20} /> },
  ];

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

  const deanItems: NavItem[] = [
    { label: "Dashboard", href: "/dean/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "Dept Analytics", href: "/dean/department-analytics", icon: <Building2 size={20} /> },
    { label: "Faculty Insights", href: "/dean/faculty-insights", icon: <GraduationCap size={20} /> },
    { label: "Academic Trends", href: "/dean/academic-trends", icon: <TrendingUp size={20} /> },
    { label: "Engagement", href: "/dean/engagement", icon: <Activity size={20} /> },
    { label: "Interventions", href: "/dean/interventions", icon: <Target size={20} /> },
    { label: "Predictive AI", href: "/dean/predictive-insights", icon: <BrainCircuit size={20} /> },
    { label: "Reports", href: "/dean/reports", icon: <FileText size={20} /> },
    { label: "Settings", href: "/settings", icon: <SettingsIcon size={20} /> },
  ];

  const items =
    role === "STUDENT"
      ? studentItems
      : role === "DEAN"
        ? deanItems
        : facultyItems;

  const isDean = role === "DEAN";

  return (
    <aside className="hidden w-64 flex-col border-r bg-white shadow-sm md:flex">
      <div className="flex h-16 items-center px-6 border-b">
        <Logo variant="light" className="scale-90 origin-left" />
      </div>

      {isDean && (
        <div className="mx-3 mt-4 rounded-lg bg-violet-50 border border-violet-200 px-3 py-2">
          <p className="text-xs font-semibold text-violet-700 uppercase tracking-wider">Dean / HOD</p>
          <p className="text-xs text-violet-500 mt-0.5">Strategic Dashboard</p>
        </div>
      )}

      <nav className="mt-4 flex-1 space-y-1 px-3">
        {items.map((item) => {
          const isActive =
            currentPath === item.href ||
            (item.href !== "/settings" && currentPath.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                ${isActive
                  ? isDean
                    ? "bg-violet-50 text-violet-700 shadow-sm ring-1 ring-violet-200"
                    : "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              <span
                className={
                  isActive
                    ? isDean
                      ? "text-violet-600"
                      : "text-indigo-600"
                    : "text-gray-400"
                }
              >
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
