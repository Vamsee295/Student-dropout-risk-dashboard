"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";

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

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

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
                />
              </div>
              <button
                type="button"
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-xs font-bold"
                aria-label="Notifications"
              >
                🔔
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  3
                </span>
              </button>
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

