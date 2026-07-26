"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Folder,
  BarChart2,
  Brain,
  HeartHandshake,
  MessageSquare,
  CalendarDays,
  FileBarChart,
  Settings,
  UserCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  UsersRound,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";

type NavItem = {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: { label: string; href: string; icon?: React.ReactNode }[];
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/faculty/dashboard", icon: <LayoutDashboard size={18} /> },
  {
    label: "Students",
    icon: <Users size={18} />,
    children: [
      { label: "All Students", href: "/faculty/students", icon: <UsersRound size={15} /> },
      { label: "At-Risk Students", href: "/faculty/students/at-risk", icon: <AlertTriangle size={15} /> },
      { label: "Student Groups", href: "/faculty/students/groups", icon: <UsersRound size={15} /> },
    ],
  },
  { label: "Courses", href: "/faculty/courses", icon: <BookOpen size={18} /> },
  { label: "Attendance", href: "/faculty/attendance", icon: <CalendarCheck size={18} /> },
  { label: "Assessments", href: "/faculty/assessments", icon: <ClipboardList size={18} /> },
  { label: "Assignments", href: "/faculty/assignments", icon: <Folder size={18} /> },
  { label: "Analytics", href: "/faculty/analytics", icon: <BarChart2 size={18} /> },
  { label: "AI Risk Center", href: "/faculty/ai-risk-center", icon: <Brain size={18} /> },
  { label: "Interventions", href: "/faculty/interventions", icon: <HeartHandshake size={18} /> },
  { label: "Communication", href: "/faculty/communication", icon: <MessageSquare size={18} /> },
  { label: "Schedule", href: "/faculty/schedule", icon: <CalendarDays size={18} /> },
  { label: "Reports", href: "/faculty/reports", icon: <FileBarChart size={18} /> },
  { label: "Settings", href: "/faculty/settings", icon: <Settings size={18} /> },
  { label: "Profile", href: "/faculty/profile", icon: <UserCircle size={18} /> },
];

export function FacultySidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Students"]);

  const handleLogout = async () => {
    await logout();
  };

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === "/faculty/dashboard") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isGroupActive = (item: NavItem) => {
    if (item.href) return isActive(item.href);
    return item.children?.some((c) => isActive(c.href)) ?? false;
  };

  return (
    <aside className="hidden w-64 flex-col bg-white border-r border-slate-200 shadow-sm md:flex overflow-hidden">
      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b border-slate-100 flex-shrink-0">
        <Logo variant="light" className="scale-90 origin-left" />
      </div>

      {/* Faculty Badge */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Faculty Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {navItems.map((item) => {
          const active = isGroupActive(item);
          const expanded = expandedItems.includes(item.label);

          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleExpand(item.label)}
                  className={`w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                    active
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={active ? "text-emerald-600" : "text-slate-400"}>{item.icon}</span>
                    {item.label}
                  </div>
                  <span className={`transition-transform duration-200 ${expanded ? "rotate-0" : "-rotate-90"}`}>
                    <ChevronDown size={14} className={active ? "text-emerald-500" : "text-slate-400"} />
                  </span>
                </button>

                {expanded && (
                  <div className="ml-6 mt-0.5 space-y-0.5 border-l border-slate-100 pl-3">
                    {item.children.map((child) => {
                      const childActive = isActive(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-all duration-150 ${
                            childActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                          }`}
                        >
                          {child.icon && (
                            <span className={childActive ? "text-emerald-600" : "text-slate-400"}>
                              {child.icon}
                            </span>
                          )}
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className={active ? "text-emerald-600" : "text-slate-400"}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Logout */}
      <div className="border-t border-slate-100 p-3 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
