"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { StudentSidebar } from "@/components/StudentSidebar";
import { User, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { NotificationBell } from "@/components/NotificationBell";

function getPageTitle(pathname: string): string {
  const map: Record<string, string> = {
    "/student/dashboard": "Student Overview",
    "/student/performance": "My Performance",
    "/student/attendance": "Attendance",
    "/student/assignments": "Assignments",
    "/student/engagement": "Engagement",
    "/student/risk": "Risk Status",
    "/student/profile": "Profile",
  };
  return map[pathname] ?? "Student Portal";
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
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
    if (user?.role !== "STUDENT") {
      if (user?.role === "FACULTY" || user?.role === "ADMIN") router.push("/faculty/dashboard");
      else if (user?.role === "DEAN") router.push("/dean/dashboard");
      else {
        logout();
        router.push("/login");
      }
    }
  }, [isAuthenticated, user, router, logout]);

  if (!isAuthenticated || user?.role !== "STUDENT") {
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="flex min-h-screen">
        <StudentSidebar activePath={pathname} />

        <div className="flex min-h-screen flex-1 flex-col bg-neutral-50">
          <header className="flex h-16 items-center justify-between border-b bg-white px-8">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-blue-900">
                {getPageTitle(pathname)}
              </h1>
              <p className="text-xs font-medium text-neutral-500">
                EduRisk AI Student Portal
              </p>
            </div>

            <div className="flex items-center gap-4">
              <NotificationBell />

              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 hover:ring-2 hover:ring-blue-100 transition-all"
                >
                  <User size={16} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-sm font-semibold text-gray-900">{user?.name || "Student"}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email || "student@example.com"}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/student/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User size={14} /> Profile
                      </Link>
                    </div>

                    <div className="border-t border-gray-50 py-1">
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
            <div className="mx-auto max-w-5xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
