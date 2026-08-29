"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { StudentSidebar } from "@/components/StudentSidebar";
import { StudentAIAssistant } from "@/components/student/StudentAIAssistant";
import { User, LogOut, Bell, Search, X, Settings, CheckCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { RoleGuard } from "@/auth/RoleGuard";
import { useNotifications } from "@/hooks/useNotifications";

function getPageTitle(pathname: string): string {
  const map: Record<string, string> = {
    "/student/dashboard": "My Dashboard",
    "/student/courses": "My Courses",
    "/student/performance": "Academic Performance",
    "/student/attendance": "Attendance",
    "/student/assignments": "Assignments",
    "/student/engagement": "Learning Analytics",
    "/student/risk": "AI Success Coach",
    "/student/career": "Career & Skills",
    "/student/messages": "Messages",
    "/student/calendar": "Academic Calendar",
    "/student/documents": "Documents",
    "/student/profile": "My Profile",
    "/student/settings": "Settings",
  };
  return map[pathname] ?? "Student Portal";
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { user, logout } = useAuth();
  const { notifs, unreadCount, markRead, markAllRead } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "ST";

  const searchResults = [
    { label: "Machine Learning", type: "Course", href: "/student/courses" },
    { label: "Assignment #4 — DBMS Project", type: "Assignment", href: "/student/assignments" },
    { label: "Attendance Report", type: "Document", href: "/student/attendance" },
    { label: "Dr. Michael Chen", type: "Faculty", href: "/student/messages" },
    { label: "AI Success Coach", type: "Feature", href: "/student/risk" },
  ].filter((r) => r.label.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <RoleGuard allowedRoles={["STUDENT"]}>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex min-h-screen">
          <StudentSidebar activePath={pathname} />

          <div className="flex min-h-screen flex-1 flex-col">
            {/* Header */}
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-100 bg-white px-6 shadow-sm">
              <div>
                <h1 className="text-base font-bold text-slate-900">{getPageTitle(pathname)}</h1>
                <p className="text-[11px] font-medium text-slate-400">EduRisk AI · Student Portal</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Global Search */}
                <div className="relative">
                  {searchOpen ? (
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-72 focus-within:border-blue-400 transition-colors">
                      <Search size={14} className="text-slate-400 flex-shrink-0" />
                      <input
                        autoFocus
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search courses, assignments, notes..."
                        className="flex-1 text-xs bg-transparent outline-none text-slate-700 placeholder-slate-400"
                      />
                      <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }}>
                        <X size={13} className="text-slate-400 hover:text-slate-700" />
                      </button>
                      {searchQuery && searchResults.length > 0 && (
                        <div className="absolute top-full mt-1 left-0 w-full bg-white border border-slate-100 rounded-xl shadow-lg z-50 overflow-hidden">
                          {searchResults.map((r, i) => (
                            <Link key={i} href={r.href} onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                              className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors">
                              <span className="text-xs font-medium text-slate-800">{r.label}</span>
                              <span className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full">{r.type}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button onClick={() => setSearchOpen(true)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
                      <Search size={14} />
                      <span className="text-xs font-medium hidden sm:block">Search...</span>
                      <span className="text-[10px] text-slate-400 font-mono hidden sm:block">⌘K</span>
                    </button>
                  )}
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setNotifOpen((v) => !v)}
                    className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                  >
                    <Bell size={16} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Panel */}
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900">Notifications</p>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                              <CheckCheck size={12} /> Mark all read
                            </button>
                          )}
                          <button onClick={() => setNotifOpen(false)}>
                            <X size={14} className="text-slate-400 hover:text-slate-700" />
                          </button>
                        </div>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                        {notifs.length === 0 ? (
                          <div className="px-4 py-6 text-center">
                            <Bell size={24} className="text-slate-200 mx-auto mb-2" />
                            <p className="text-xs text-slate-400">No notifications yet</p>
                          </div>
                        ) : notifs.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => { markRead(n.id); }}
                            className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${!n.is_read ? "bg-blue-50/40" : ""}`}
                          >
                            <div className="flex items-start gap-2">
                              {!n.is_read && <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                              <div className={!n.is_read ? "" : "pl-4"}>
                                <p className="text-xs font-semibold text-slate-800 leading-tight">{n.title}</p>
                                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                                <p className="text-[10px] text-slate-400 mt-1">
                                  {new Date(n.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                      {initials}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 hidden sm:block max-w-24 truncate">{user?.name?.split(" ")[0] || "Student"}</span>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1 z-50">
                      <div className="px-4 py-3 border-b border-slate-50">
                        <p className="text-sm font-bold text-slate-900">{user?.name || "Student"}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">STUDENT</span>
                      </div>
                      <div className="py-1">
                        <Link href="/student/profile" onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          <User size={14} /> My Profile
                        </Link>
                        <Link href="/student/settings" onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          <Settings size={14} /> Settings
                        </Link>
                      </div>
                      <div className="border-t border-slate-50 py-1">
                        <button onClick={handleLogout}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium">
                          <LogOut size={14} /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-5 py-6 lg:px-8 lg:py-8">
              <div className="mx-auto max-w-6xl space-y-6">{children}</div>
            </main>
          </div>
        </div>

        {/* Floating AI Assistant */}
        <StudentAIAssistant />
      </div>
    </RoleGuard>
  );
}
