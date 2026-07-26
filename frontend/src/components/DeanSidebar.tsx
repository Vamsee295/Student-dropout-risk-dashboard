"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building,
  Building2,
  Users,
  GraduationCap,
  BrainCircuit,
  BarChart2,
  TrendingUp,
  ShieldCheck,
  Wallet,
  Megaphone,
  FileText,
  Settings,
  User,
  LogOut,
  Crown,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";

export type SidebarProps = { activePath?: string };

const navItems = [
  { label: "Executive Dashboard", href: "/dean/dashboard", icon: LayoutDashboard },
  { label: "Institution Overview", href: "/dean/overview", icon: Building },
  { label: "Departments", href: "/dean/departments", icon: Building2 },
  { label: "Faculty Management", href: "/dean/faculty", icon: GraduationCap },
  { label: "Student Analytics", href: "/dean/student-analytics", icon: Users },
  { label: "AI Intelligence Center", href: "/dean/ai-center", icon: BrainCircuit },
  { label: "Institutional Analytics", href: "/dean/analytics", icon: BarChart2 },
  { label: "Forecasting & Trends", href: "/dean/forecasting", icon: TrendingUp },
  { label: "Accreditation", href: "/dean/compliance", icon: ShieldCheck },
  { label: "Budget & Resources", href: "/dean/budget", icon: Wallet },
  { label: "Announcements", href: "/dean/announcements", icon: Megaphone },
  { label: "Reports Center", href: "/dean/reports", icon: FileText },
  { label: "System Admin", href: "/dean/system-admin", icon: Settings },
  { label: "Admin Profile", href: "/dean/profile", icon: User },
];

export function DeanSidebar({ activePath }: SidebarProps) {
  const pathname = usePathname();
  const currentPath = activePath ?? pathname;
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "DA";

  return (
    <aside className="hidden w-64 flex-col border-r border-slate-100 bg-white shadow-sm md:flex">
      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b border-slate-100">
        <Logo variant="light" className="scale-90 origin-left" />
      </div>

      {/* Executive Role Badge */}
      <div className="px-4 py-3 border-b border-slate-50 bg-violet-50/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-violet-900 truncate">{user?.name || "Dean / Admin"}</p>
            <p className="text-[10px] text-violet-500 font-medium flex items-center gap-1">
              <Crown size={9} /> Executive Command
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentPath === item.href ||
            (item.href !== "/dean/dashboard" && currentPath.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-200"
                  : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
              }`}
            >
              <Icon size={16} className={isActive ? "text-white" : "text-slate-400"} />
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
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
