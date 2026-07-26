"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { DeanSidebar } from "@/components/DeanSidebar";
import { DeanAIAssistant } from "@/components/dean/DeanAIAssistant";
import { LogOut, Bell, Search, X, Settings, Crown, AlertTriangle, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { RoleGuard } from "@/auth/RoleGuard";

function getPageTitle(pathname: string): string {
  const map: Record<string, string> = {
    "/dean/dashboard": "Executive Dashboard",
    "/dean/overview": "Institution Overview",
    "/dean/departments": "Departments",
    "/dean/faculty": "Faculty Management",
    "/dean/student-analytics": "Student Analytics",
    "/dean/ai-center": "AI Intelligence Center",
    "/dean/analytics": "Institutional Analytics",
    "/dean/forecasting": "Forecasting & Trends",
    "/dean/compliance": "Accreditation & Compliance",
    "/dean/budget": "Budget & Resources",
    "/dean/announcements": "Announcements",
    "/dean/reports": "Reports Center",
    "/dean/system-admin": "System Administration",
    "/dean/profile": "Admin Profile",
  };
  return map[pathname] ?? "Executive Portal";
}

const executiveAlerts = [
  { level: "critical", message: "Mechanical Eng dropout risk reached 24%", time: "2 min ago" },
  { level: "warning", message: "Civil Eng attendance dropped below 70%", time: "18 min ago" },
  { level: "info", message: "NAAC compliance report due in 14 days", time: "1 hr ago" },
  { level: "info", message: "Q3 Budget utilization at 87% — review needed", time: "3 hrs ago" },
];

export default function DeanLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "DA";

  const searchResults = [
    { label: "Mechanical Engineering", type: "Department", href: "/dean/departments" },
    { label: "Dr. Ramesh Kumar", type: "Faculty", href: "/dean/faculty" },
    { label: "Dropout Forecast Report", type: "Report", href: "/dean/reports" },
    { label: "AI Intelligence Center", type: "Module", href: "/dean/ai-center" },
    { label: "Budget Q4 Allocation", type: "Budget", href: "/dean/budget" },
    { label: "NAAC Compliance Dashboard", type: "Compliance", href: "/dean/compliance" },
  ].filter((r) => r.label.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <RoleGuard allowedRoles={["DEAN", "ADMIN"]}>
      <div className="min-h-screen bg-zinc-50 text-zinc-900">
        <div className="flex min-h-screen">
          <DeanSidebar activePath={pathname} />

          <div className="flex min-h-screen flex-1 flex-col">
            {/* Executive Header */}
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6 shadow-sm">
              <div>
                <h1 className="text-base font-bold text-zinc-900">{getPageTitle(pathname)}</h1>
                <p className="text-[11px] font-medium text-zinc-400">EduRisk AI · Executive Command Center</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Global Search */}
                <div className="relative">
                  {searchOpen ? (
                    <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 w-80 focus-within:border-violet-400 transition-colors">
                      <Search size={14} className="text-zinc-400 flex-shrink-0" />
                      <input autoFocus type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search departments, faculty, reports..."
                        className="flex-1 text-xs bg-transparent outline-none text-zinc-700 placeholder-zinc-400" />
                      <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }}>
                        <X size={13} className="text-zinc-400 hover:text-zinc-700" />
                      </button>
                      {searchQuery && searchResults.length > 0 && (
                        <div className="absolute top-full mt-1 left-0 w-full bg-white border border-zinc-100 rounded-xl shadow-xl z-50 overflow-hidden">
                          {searchResults.map((r, i) => (
                            <Link key={i} href={r.href} onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                              className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 transition-colors">
                              <span className="text-xs font-medium text-zinc-800">{r.label}</span>
                              <span className="text-[10px] bg-violet-50 text-violet-600 font-semibold px-2 py-0.5 rounded-full">{r.type}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button onClick={() => setSearchOpen(true)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 bg-zinc-50 border border-zinc-200 rounded-xl hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 transition-colors">
                      <Search size={14} />
                      <span className="text-xs font-medium hidden sm:block">Search...</span>
                      <span className="text-[10px] text-zinc-400 font-mono hidden sm:block">⌘K</span>
                    </button>
                  )}
                </div>

                {/* Executive Alert Bell */}
                <div className="relative">
                  <button onClick={() => setAlertsOpen(!alertsOpen)}
                    className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-500 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 transition-colors">
                    <Bell size={16} />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {executiveAlerts.filter(a => a.level === "critical" || a.level === "warning").length}
                    </span>
                  </button>
                  {alertsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-zinc-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
                        <p className="text-sm font-bold text-zinc-900">Executive Alerts</p>
                        <button onClick={() => setAlertsOpen(false)}><X size={14} className="text-zinc-400" /></button>
                      </div>
                      <div className="divide-y divide-zinc-50">
                        {executiveAlerts.map((a, i) => (
                          <div key={i} className={`px-4 py-3 flex items-start gap-3 ${a.level === "critical" ? "bg-red-50/50" : ""}`}>
                            <AlertTriangle size={14} className={`flex-shrink-0 mt-0.5 ${
                              a.level === "critical" ? "text-red-500" : a.level === "warning" ? "text-amber-500" : "text-blue-400"
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-zinc-800">{a.message}</p>
                              <p className="text-[10px] text-zinc-400 mt-0.5">{a.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-2.5 border-t border-zinc-100">
                        <Link href="/dean/dashboard" onClick={() => setAlertsOpen(false)}
                          className="text-xs font-semibold text-violet-600 hover:underline">View All Alerts →</Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile */}
                <div className="relative">
                  <button onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-violet-50 hover:border-violet-200 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-violet-700 text-white text-xs font-bold flex items-center justify-center">
                      {initials}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-bold text-zinc-800 leading-none">{user?.name?.split(" ")[0] || "Dean"}</p>
                      <p className="text-[9px] text-violet-600 font-semibold flex items-center gap-0.5 mt-0.5"><Crown size={8} /> Executive</p>
                    </div>
                  </button>
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-zinc-100 py-1 z-50">
                      <div className="px-4 py-3 border-b border-zinc-50">
                        <p className="text-sm font-bold text-zinc-900">{user?.name || "Dean"}</p>
                        <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
                        <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full">DEAN / ADMIN</span>
                      </div>
                      <div className="py-1">
                        <Link href="/dean/profile" onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
                          <User size={14} /> Admin Profile
                        </Link>
                        <Link href="/dean/system-admin" onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
                          <Settings size={14} /> System Admin
                        </Link>
                      </div>
                      <div className="border-t border-zinc-50 py-1">
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

            {/* Main */}
            <main className="flex-1 overflow-y-auto px-5 py-6 lg:px-8 lg:py-8 bg-zinc-50">
              <div className="mx-auto max-w-7xl space-y-6">{children}</div>
            </main>
          </div>
        </div>
        <DeanAIAssistant />
      </div>
    </RoleGuard>
  );
}
