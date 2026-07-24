"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart,
  UserCheck,
  BookOpen,
  LineChart,
  AlertTriangle,
  Users,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Logo } from "@/components/Logo";

export type SidebarProps = {
  activePath?: string;
};

export function StudentSidebar({ activePath }: SidebarProps) {
  const pathname = usePathname();
  const currentPath = activePath ?? pathname;
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const studentItems = [
    { label: "Overview", href: "/student/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "My Performance", href: "/student/performance", icon: <BarChart size={20} /> },
    { label: "Attendance", href: "/student/attendance", icon: <UserCheck size={20} /> },
    { label: "Assignments", href: "/student/assignments", icon: <BookOpen size={20} /> },
    { label: "Engagement", href: "/student/engagement", icon: <LineChart size={20} /> },
    { label: "Risk Status", href: "/student/risk", icon: <AlertTriangle size={20} /> },
    { label: "Profile", href: "/student/profile", icon: <Users size={20} /> },
  ];

  return (
    <aside className="hidden w-64 flex-col border-r bg-white shadow-sm md:flex">
      <div className="flex h-16 items-center px-6 border-b">
        <Logo variant="light" className="scale-90 origin-left" />
      </div>

      <nav className="mt-4 flex-1 space-y-1 px-3">
        {studentItems.map((item) => {
          const isActive = currentPath === item.href || (item.href !== "/student/dashboard" && currentPath.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              <span className={isActive ? "text-blue-600" : "text-gray-400"}>
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
