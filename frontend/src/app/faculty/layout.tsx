"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FacultySidebar } from "@/components/FacultySidebar";
import { FacultyAIAssistant } from "@/components/faculty/FacultyAIAssistant";
import { User, LogOut, Settings, Search, Bell, X } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const PAGE_TITLES: Record<string, string> = {
  "/faculty/dashboard": "Dashboard",
  "/faculty/students": "All Students",
  "/faculty/students/at-risk": "At-Risk Students",
  "/faculty/students/groups": "Student Groups",
  "/faculty/courses": "Courses",
  "/faculty/attendance": "Attendance",
  "/faculty/assessments": "Assessments",
  "/faculty/assignments": "Assignments",
  "/faculty/analytics": "Analytics",
  "/faculty/ai-risk-center": "AI Risk Center",
  "/faculty/interventions": "Interventions",
  "/faculty/communication": "Communication",
  "/faculty/schedule": "Schedule",
  "/faculty/reports": "Reports",
  "/faculty/settings": "Settings",
  "/faculty/profile": "My Profile",
};

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/faculty/students/") && !pathname.includes("at-risk") && !pathname.includes("groups")) {
    return "Student Profile";
  }
  return PAGE_TITLES[pathname] ?? "Faculty Portal";
}

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
      else {
        logout();
        router.push("/login");
      }
    }
  }, [isAuthenticated, user, router, logout]);

  if (!isAuthenticated || (user?.role !== "FACULTY" && user?.role !== "ADMIN")) {
    return null;
  }

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "FA";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <FacultySidebar />

        <div className="flex min-h-screen flex-1 flex-col bg-slate-50 overflow-hidden">
          {/* Top Header */}
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm flex-shrink-0 z-30">
            {/* Left: Page title */}
            <div>
              <h1 className="text-base font-bold text-slate-900">{getPageTitle(pathname)}</h1>
              <p className="text-xs text-slate-400">EduRisk AI · Faculty Portal</p>
            </div>

            {/* Right: Search, Notifications, Profile */}
            <div className="flex items-center gap-3">
              {/* Global Search */}
              <div className="relative">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                >
                  <Search size={14} />
                  <span className="hidden lg:block text-xs">Search students, courses...</span>
                </button>

                {searchOpen && (
                  <div className="absolute right-0 top-11 w-80 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-50">
                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg border border-slate-200 px-3 py-2 mb-3">
                      <Search size={14} className="text-slate-400" />
                      <input
                        autoFocus
                        type="text"
                        placeholder="Search students, courses, assignments..."
                        className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                      />
                      <button onClick={() => setSearchOpen(false)}>
                        <X size={14} className="text-slate-400" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 text-center py-2">Start typing to search...</p>
                  </div>
                )}
              </div>

              {/* Notification Bell */}
              <button className="relative p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                <Bell size={18} className="text-slate-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-slate-200 hover:border-slate-300 bg-white transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                    {initials}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-slate-900 leading-tight">{user?.name || "Faculty"}</p>
                    <p className="text-[10px] text-slate-400">Faculty</p>
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                    <div className="px-4 py-3 border-b border-slate-50">
                      <p className="text-sm font-semibold text-slate-900">{user?.name || "Faculty"}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email || "faculty@example.com"}</p>
                    </div>
                    <Link
                      href="/faculty/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User size={14} />
                      My Profile
                    </Link>
                    <Link
                      href="/faculty/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings size={14} />
                      Settings
                    </Link>
                    <div className="border-t border-slate-50 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                      >
                        <LogOut size={14} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Floating AI Assistant */}
      <FacultyAIAssistant />
    </div>
  );
}
