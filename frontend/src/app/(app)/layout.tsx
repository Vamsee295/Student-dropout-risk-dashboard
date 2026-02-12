"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Bell, User, LogOut, Settings } from "lucide-react";

const pathTitleMap: Record<string, string> = {
  "/dashboard": "ML Risk Analysis Insights",
  "/students": "Student Directory",
  "/risk-analysis": "ML Insights",
  "/engagement-metrics": "Student Engagement Overview",
  "/attendance-analytics": "Attendance Analytics",
  "/course-insights": "Course & Subject Performance",
  "/interventions": "Intervention Board",
  "/alerts": "Critical Alerts",
  "/reports": "Reports & Exports",
  "/settings": "Admin & Settings",
};

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/students/")) {
    return "Student Risk Profile";
  }

  return pathTitleMap[pathname] ?? "Student Dropout Risk Dashboard";
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="flex min-h-screen">
        <Sidebar activePath={pathname} />

        <div className="flex min-h-screen flex-1 flex-col bg-neutral-50">
          <header className="flex h-16 items-center justify-between border-b bg-white px-8">
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                {getPageTitle(pathname)}
              </h1>
              <p className="text-xs font-medium text-neutral-500">
                Student Dropout Risk Dashboard
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search students, courses, alerts..."
                  className="w-72 rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium placeholder:text-neutral-400 focus:border-black focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const target = e.target as HTMLInputElement;
                      router.push(`/students?q=${encodeURIComponent(target.value)}`);
                    }
                  }}
                />
              </div>
              <button
                type="button"
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-xs font-bold transition-colors hover:bg-neutral-100"
                aria-label="Notifications"
              >
                <Bell size={16} className="text-neutral-600" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  3
                </span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-700 hover:ring-2 hover:ring-black/5 transition-all"
                >
                  <User size={16} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-sm font-semibold text-gray-900">Jane Doe</p>
                      <p className="text-xs text-gray-500 truncate">jane@university.edu</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User size={14} /> Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings size={14} /> Settings
                      </Link>
                    </div>

                    <div className="border-t border-gray-50 py-1">
                      <Link
                        href="/login"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                      >
                        <LogOut size={14} /> Logout
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-8 py-6">
            <div className="mx-auto max-w-6xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

