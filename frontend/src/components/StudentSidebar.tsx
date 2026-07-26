"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  BarChart2,
  Brain,
  Cpu,
  Briefcase,
  MessageSquare,
  CalendarDays,
  FolderOpen,
  User,
  Settings,
  LogOut,
  ChevronDown,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";
import { useState } from "react";

export type SidebarProps = {
  activePath?: string;
};

const navItems = [
  { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "My Courses", href: "/student/courses", icon: BookOpen },
  { label: "Attendance", href: "/student/attendance", icon: CalendarCheck },
  { label: "Assignments", href: "/student/assignments", icon: ClipboardList },
  { label: "Performance", href: "/student/performance", icon: BarChart2 },
  { label: "Learning Analytics", href: "/student/engagement", icon: Brain },
  { label: "AI Success Coach", href: "/student/risk", icon: Cpu },
  { label: "Career & Skills", href: "/student/career", icon: Briefcase },
  { label: "Messages", href: "/student/messages", icon: MessageSquare },
  { label: "Academic Calendar", href: "/student/calendar", icon: CalendarDays },
  { label: "Documents", href: "/student/documents", icon: FolderOpen },
  { label: "Profile", href: "/student/profile", icon: User },
  { label: "Settings", href: "/student/settings", icon: Settings },
];

export function StudentSidebar({ activePath }: SidebarProps) {
  const pathname = usePathname();
  const currentPath = activePath ?? pathname;
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "ST";

  return (
    <aside className="hidden w-64 flex-col border-r border-slate-100 bg-white shadow-sm md:flex">
      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b border-slate-100">
        <Logo variant="light" className="scale-90 origin-left" />
      </div>

      {/* Student Badge */}
      <div className="px-4 py-3 border-b border-slate-50 bg-blue-50/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-blue-900 truncate">{user?.name || "Student"}</p>
            <p className="text-[10px] text-blue-500 font-medium flex items-center gap-1">
              <GraduationCap size={9} /> Student Portal
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentPath === item.href ||
            (item.href !== "/student/dashboard" && currentPath.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                  : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              <Icon
                size={17}
                className={isActive ? "text-white" : "text-slate-400"}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-100 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}
