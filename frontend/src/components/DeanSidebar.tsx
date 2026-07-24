"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  TrendingUp,
  Activity,
  Target,
  BrainCircuit,
  FileText,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Logo } from "@/components/Logo";

export type SidebarProps = {
  activePath?: string;
};

export function DeanSidebar({ activePath }: SidebarProps) {
  const pathname = usePathname();
  const currentPath = activePath ?? pathname;
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const deanItems = [
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

  return (
    <aside className="hidden w-64 flex-col border-r bg-zinc-900 shadow-sm md:flex text-zinc-100">
      <div className="flex h-16 items-center px-6 border-b border-zinc-800">
        <Logo variant="dark" className="scale-90 origin-left" />
      </div>

      <div className="mx-3 mt-4 rounded-lg bg-violet-900/50 border border-violet-800 px-3 py-2">
        <p className="text-xs font-semibold text-violet-300 uppercase tracking-wider">Dean / HOD</p>
        <p className="text-xs text-violet-400 mt-0.5">Strategic Dashboard</p>
      </div>

      <nav className="mt-4 flex-1 space-y-1 px-3">
        {deanItems.map((item) => {
          const isActive = currentPath === item.href || (item.href !== "/dean/dashboard" && currentPath.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-violet-600 text-white shadow-sm ring-1 ring-violet-500"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }
              `}
            >
              <span className={isActive ? "text-violet-200" : "text-zinc-500"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
