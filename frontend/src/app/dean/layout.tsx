"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { DeanSidebar } from "@/components/DeanSidebar";
import { User, LogOut, Settings } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { NotificationBell } from "@/components/NotificationBell";

function getPageTitle(pathname: string): string {
  const map: Record<string, string> = {
    "/dean/dashboard": "Dean Strategic Dashboard",
    "/dean/department-analytics": "Department Analytics",
    "/dean/faculty-insights": "Faculty Insights",
    "/dean/academic-trends": "Academic Trends",
    "/dean/engagement": "Engagement Overview",
    "/dean/interventions": "Interventions",
    "/dean/predictive-insights": "Predictive AI Forecasts",
    "/dean/reports": "Reports",
    "/dean/settings": "Settings",
  };
  return map[pathname] ?? "Strategic Portal";
}

export default function DeanLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user?.role !== "DEAN") {
      if (user?.role === "STUDENT") router.push("/student/dashboard");
      else if (user?.role === "FACULTY" || user?.role === "ADMIN") router.push("/faculty/dashboard");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "DEAN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="flex min-h-screen">
        <DeanSidebar activePath={pathname} />

        <div className="flex min-h-screen flex-1 flex-col bg-zinc-50">
          <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-8 shadow-sm">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-violet-900">
                {getPageTitle(pathname)}
              </h1>
              <p className="text-xs font-medium text-zinc-500">
                EduRisk AI Dean Portal
              </p>
            </div>

            <div className="flex items-center gap-4">
              <NotificationBell />

              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 border border-violet-200 text-xs font-bold text-violet-700 hover:ring-2 hover:ring-violet-300 transition-all"
                >
                  <User size={16} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-zinc-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-zinc-100">
                      <p className="text-sm font-semibold text-zinc-900">{user?.name || "Dean"}</p>
                      <p className="text-xs text-zinc-500 truncate">{user?.email || "dean@example.com"}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/dean/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings size={14} /> Settings
                      </Link>
                    </div>

                    <div className="border-t border-zinc-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium text-left"
                      >
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-10 lg:py-8">
            <div className="mx-auto max-w-7xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
