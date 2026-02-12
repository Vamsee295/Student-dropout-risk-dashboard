import { Users, AlertTriangle, Clock, Activity } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: string;
    trend: string;
    trendLabel: string;
    trendDirection: "up" | "down";
    trendColor: string;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    actionLabel: string;
    borderColor?: string;
}

function MetricCard({
    title,
    value,
    trend,
    trendLabel,
    trendDirection,
    trendColor,
    icon: Icon,
    iconColor,
    iconBg,
    actionLabel,
    borderColor = "border-transparent",
}: MetricCardProps) {
    return (
        <div className={`rounded-xl border bg-white p-5 shadow-sm ${borderColor}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="mt-2 text-3xl font-bold text-gray-900">{value}</h3>

                    <div className="mt-2 flex items-center text-sm">
                        <span
                            className={`font-medium ${trendDirection === "up" ? "text-emerald-600" : "text-red-600"
                                }`}
                        >
                            {trendDirection === "up" ? "↗" : "↘"} {trend}
                        </span>
                        <span className="ml-2 text-gray-500">{trendLabel}</span>
                    </div>
                </div>
                <div className={`rounded-lg p-2 ${iconBg}`}>
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50">
                <button className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
                    {actionLabel} <span className="ml-1">→</span>
                </button>
            </div>
        </div>
    );
}

export function DashboardMetrics() {
    const metrics = [
        {
            title: "Total Students",
            value: "12,450",
            trend: "+2.4%",
            trendLabel: "vs last semester",
            trendDirection: "up",
            trendColor: "text-emerald-600",
            icon: Users,
            iconColor: "text-blue-600",
            iconBg: "bg-blue-50",
            actionLabel: "View enrollment details",
        },
        {
            title: "High Risk Students",
            value: "842",
            trend: "+12%",
            trendLabel: "critical increase",
            trendDirection: "up", // Actually bad, but numerically up
            trendColor: "text-red-600",
            icon: AlertTriangle,
            iconColor: "text-red-600",
            iconBg: "bg-red-50",
            actionLabel: "Review at-risk list",
            borderColor: "border-l-4 border-l-red-500", // Special styling for risk
        },
        {
            title: "Avg Attendance",
            value: "88%",
            trend: "-1.5%",
            trendLabel: "below target",
            trendDirection: "down",
            trendColor: "text-red-600",
            icon: Clock,
            iconColor: "text-amber-600",
            iconBg: "bg-amber-50",
            actionLabel: "Analyze attendance",
        },
        {
            title: "Avg Engagement",
            value: "7.2/10",
            trend: "+0.3",
            trendLabel: "improving",
            trendDirection: "up",
            trendColor: "text-emerald-600",
            icon: Activity,
            iconColor: "text-emerald-600",
            iconBg: "bg-emerald-50",
            actionLabel: "Check engagement report",
        },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
                <MetricCard key={metric.title} {...metric} trendDirection={metric.trendDirection as "up" | "down"} />
            ))}
        </div>
    );
}
