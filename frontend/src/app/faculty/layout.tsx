"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FacultySidebar } from "@/components/FacultySidebar";
import { User, LogOut, Settings } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { NotificationBell } from "@/components/NotificationBell";

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/faculty/students/")) {
    return "Student Risk Profile";
  }
  const map: Record<string, string> = {
    "/faculty/dashboard": "Faculty Dashboard",
    "/faculty/students": "Student Directory",
    "/faculty/analytics": "Analytics",
    "/faculty/interventions": "Intervention Board",
    "/faculty/engagement": "Engagement Tracking",
    "/faculty/reports": "Reports",
    "/faculty/upload": "Upload Data",
    "/faculty/settings": "Settings",
  };
  return map[pathname] ?? "Faculty Portal";
}

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
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
    if (user?.role !== "FACULTY" && user?.role !== "ADMIN") {
      if (user?.role === "STUDENT") router.push("/student/dashboard");
      else if (user?.role === "DEAN") router.push("/dean/dashboard");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || (user?.role !== "FACULTY" && user?.role !== "ADMIN")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <FacultySidebar activePath={pathname} />

        <div className="flex min-h-screen flex-1 flex-col bg-slate-50">
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-emerald-900">
                {getPageTitle(pathname)}
              </h1>
              <p className="text-xs font-medium text-slate-500">
                EduRisk AI Faculty Portal
              </p>
            </div>

            <div className="flex items-center gap-4">
              <NotificationBell />

              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 hover:ring-2 hover:ring-slate-200 transition-all"
                >
                  <User size={16} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-50">
                      <p className="text-sm font-semibold text-slate-900">{user?.name || "Faculty"}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email || "faculty@example.com"}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/faculty/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings size={14} /> Settings
                      </Link>
                    </div>

                    <div className="border-t border-slate-50 py-1">
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
            <div className="mx-auto max-w-6xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
