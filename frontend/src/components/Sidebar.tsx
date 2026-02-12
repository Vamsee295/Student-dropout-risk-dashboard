"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
    LayoutDashboard,
    Users,
    BookOpen,
    BarChart2,
    Bell,
    Settings,
    LogOut,
    Activity,
    TrendingUp,
} from "lucide-react";

type NavItem = {
    label: string;
    href: string;
    icon: ReactNode;
    badge?: string;
};

const MAIN_MENU: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "Performance", href: "/performance", icon: <TrendingUp size={20} /> },
    { label: "Placement Report", href: "/reports", icon: <BarChart2 size={20} /> },
    { label: "Student Directory", href: "/students", icon: <Users size={20} /> },
    { label: "Analytics", href: "/analytics", icon: <BarChart2 size={20} /> },
    { label: "Engagement", href: "/engagement", icon: <Activity size={20} /> },
    { label: "Interventions", href: "/interventions", icon: <BookOpen size={20} /> },
];

const ADMIN_MENU: NavItem[] = [
    { label: "ML Insights", href: "/alerts", icon: <Bell size={20} />, badge: "3" },
    { label: "Settings", href: "/settings", icon: <Settings size={20} /> },
];

export type SidebarProps = {
    activePath?: string;
};

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
    return (
        <Link
            href={item.href}
            className={[
                "flex items-center justify-between rounded-lg px-4 py-3 transition-colors",
                isActive
                    ? "bg-blue-600 text-white shadow-md z-1"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white",
            ].join(" ")}
        >
            <div className="flex items-center gap-3">
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
            </div>
            {item.badge && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {item.badge}
                </span>
            )}
        </Link>
    );
}

export function Sidebar({ activePath }: SidebarProps) {
    const pathname = usePathname();
    const currentPath = activePath ?? pathname;

    const isItemActive = (href: string) =>
        currentPath === href ||
        (href !== "/dashboard" && currentPath.startsWith(href));

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-slate-950 text-white">
            {/* Logo Area */}
            <div className="flex h-20 items-center px-6">
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-950">
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M12 2L2 7L12 12L22 7L12 2Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M2 17L12 22L22 17"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M2 12L12 17L22 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                <span className="text-lg font-bold tracking-tight">EduInsight</span>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
                {/* Main Menu */}
                <div className="mb-8">
                    <div className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Main Menu
                    </div>
                    <nav className="space-y-1">
                        {MAIN_MENU.map((item) => (
                            <NavLink
                                key={item.href}
                                item={item}
                                isActive={isItemActive(item.href)}
                            />
                        ))}
                    </nav>
                </div>

                {/* Administration */}
                <div>
                    <div className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Administration
                    </div>
                    <nav className="space-y-1">
                        {ADMIN_MENU.map((item) => (
                            <NavLink
                                key={item.href}
                                item={item}
                                isActive={isItemActive(item.href)}
                            />
                        ))}
                    </nav>
                </div>
            </div>

            {/* User Profile */}
            <div className="border-t border-slate-800 p-4">
                <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-800">
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-slate-700">
                        {/* Placeholder avatar */}
                        <svg
                            className="h-full w-full text-slate-400"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <div className="truncate text-sm font-medium text-white">
                            Alex Morgan
                        </div>
                        <div className="truncate text-xs text-slate-400">Administrator</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
