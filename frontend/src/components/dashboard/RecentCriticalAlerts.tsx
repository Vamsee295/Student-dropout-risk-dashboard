import { Bell, ChevronDown } from "lucide-react";
import Link from "next/link";

interface AlertItemProps {
    name: string;
    avatar: string; // URL or initials
    time: string;
    title: string;
    description: string;
    actions: { label: string; primary?: boolean; href?: string }[];
    isCritical?: boolean;
}

function AlertItem({ name, avatar, time, title, description, actions, isCritical }: AlertItemProps) {
    return (
        <div className={`relative pl-4 mb-8 last:mb-0 ${isCritical ? "before:bg-red-500" : "before:bg-amber-500"} before:absolute before:left-0 before:top-2 before:h-full before:w-[2px] before:rounded-full`}>
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
                        {/* Simple avatar placeholder using initials or image if available */}
                        {avatar.includes("/") ? <img src={avatar} alt={name} className="h-full w-full rounded-full object-cover" /> : avatar}
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900">{name}</h4>
                    </div>
                </div>
                <span className="text-xs text-gray-400">{time}</span>
            </div>

            <div className="mt-2">
                <p className={`text-sm font-bold ${isCritical ? "text-red-600" : "text-amber-600"}`}>
                    {title}
                </p>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                    {description}
                </p>
            </div>

            <div className="mt-3 flex gap-2">
                {actions.map((action) => (
                    <a
                        key={action.label}
                        href={action.href || "#"}
                        className={`rounded px-3 py-1 text-xs font-semibold transition-colors ${action.primary
                            ? "bg-black text-white hover:bg-neutral-800"
                            : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        {action.label}
                    </a>
                ))}
            </div>
        </div>
    );
}

export function RecentCriticalAlerts() {
    const alerts: AlertItemProps[] = [
        {
            name: "John Doe",
            avatar: "JD",
            time: "10m ago",
            title: "Attendance dropped below 50%",
            description: "Student has missed 3 consecutive math classes without excuse.",
            actions: [{ label: "Send Email", href: "mailto:john.doe@student.edu" }, { label: "Inform Parent", primary: true, href: "mailto:parent.doe@gmail.com" }],
            isCritical: true,
        },
        {
            name: "Sarah Smith",
            avatar: "SS",
            time: "2h ago",
            title: "LMS Inactivity Warning",
            description: "No login activity detected for 7 days.",
            actions: [{ label: "Send Email", href: "mailto:sarah.smith@student.edu" }, { label: "Inform Parent", href: "mailto:parent.smith@gmail.com" }],
            isCritical: false, // Orange/Amber
        },
        {
            name: "Michael Brown",
            avatar: "MB",
            time: "4h ago",
            title: "Grade Drop Detected",
            description: "Significant grade drop detected in 'Intro to CS'.",
            actions: [{ label: "Send Email", href: "mailto:michael.brown@student.edu" }, { label: "Inform Parent", href: "mailto:parent.brown@gmail.com" }],
            isCritical: false,
        },
        {
            name: "Emily Davis",
            avatar: "ED",
            time: "1d ago",
            title: "Assignment Missing",
            description: "Failed to submit mid-term project.",
            actions: [{ label: "Send Email", href: "mailto:emily.davis@student.edu" }, { label: "Inform Parent", href: "mailto:parent.davis@gmail.com" }],
            isCritical: false,
        },
    ];

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm h-full">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Recent Critical Alerts</h3>
                <Link href="/students" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</Link>
            </div>

            <div className="space-y-1">
                {alerts.map((alert, index) => (
                    <AlertItem key={index} {...alert} />
                ))}
            </div>

            <button className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Load older alerts <ChevronDown className="h-4 w-4" />
            </button>
        </div>
    );
}
