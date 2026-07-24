"use client";

import { useEffect, useState } from "react";
import { deanService } from "@/services/dean";
import { Loader2 } from "lucide-react";
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    Cell, ScatterChart, Scatter, ZAxis,
} from "recharts";

const DEPT_COLORS = ["#7C3AED", "#6366F1", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];
const RISK_LEVELS = ["High Risk", "Moderate Risk", "Stable", "Safe"];
const RISK_COLORS_HEAT: Record<string, string> = {
    "High Risk": "#FEE2E2", "Moderate Risk": "#FEF9C3", "Stable": "#EDE9FE", "Safe": "#D1FAE5",
};
const RISK_TEXT: Record<string, string> = {
    "High Risk": "text-red-700", "Moderate Risk": "text-amber-700", "Stable": "text-violet-700", "Safe": "text-emerald-700",
};

export default function DepartmentAnalytics() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        deanService.getDepartmentAnalytics().then(setData).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-violet-600" size={32} /></div>;
    if (!data) return <p className="text-gray-500 text-center mt-20">No data. Upload CSV first.</p>;

    const depts = data.departments || [];
    const heatmap = data.heatmap || [];

    // Build heatmap matrix: dept × risk_level → count
    const uniqueDepts = [...new Set(heatmap.map((h: any) => h.department))] as string[];
    const getCount = (dept: string, risk: string) =>
        heatmap.find((h: any) => h.department === dept && h.risk_level === risk)?.count ?? 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Department Risk Analytics</h1>
                <p className="text-sm text-gray-500 mt-1">Which departments need urgent attention?</p>
            </div>

            {/* Department Bar Chart */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Risk % & Attendance per Department</h3>
                {depts.length === 0 ? (
                    <div className="flex h-64 items-center justify-center text-gray-400">No department data</div>
                ) : (
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={depts} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 10 }} tickFormatter={(v) => v.split(" ")[0]} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                    formatter={(v, name) => [`${Math.round(Number(v))}%`, name === "avg_risk" ? "Avg Risk" : name === "avg_attendance" ? "Avg Attendance" : String(name)]} />
                                <Legend formatter={(v) => <span className="text-xs text-gray-600">{v === "avg_risk" ? "Avg Risk" : v === "avg_attendance" ? "Avg Attendance" : v}</span>} />
                                <Bar dataKey="avg_risk" name="avg_risk" fill="#7C3AED" radius={[4, 4, 0, 0]} barSize={22} />
                                <Bar dataKey="avg_attendance" name="avg_attendance" fill="#10B981" radius={[4, 4, 0, 0]} barSize={22} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Heatmap + Table side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Heatmap */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Risk Heatmap (Dept × Level)</h3>
                    {uniqueDepts.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">No heatmap data available</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr>
                                        <th className="text-left py-2 pr-3 text-xs text-gray-500 font-medium">Department</th>
                                        {RISK_LEVELS.map((rl) => (
                                            <th key={rl} className="text-center py-2 px-2 text-xs text-gray-500 font-medium">{rl.split(" ")[0]}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {uniqueDepts.map((dept) => (
                                        <tr key={dept} className="border-t border-gray-50">
                                            <td className="py-2 pr-3 text-xs font-medium text-gray-700 whitespace-nowrap">{dept.split(" ")[0]}</td>
                                            {RISK_LEVELS.map((rl) => {
                                                const cnt = getCount(dept, rl);
                                                return (
                                                    <td key={rl} className="py-2 px-2 text-center">
                                                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${cnt > 0 ? `${RISK_COLORS_HEAT[rl]} ${RISK_TEXT[rl]}` : "bg-gray-50 text-gray-400"}`}>
                                                            {cnt > 0 ? cnt : "—"}
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Department Table */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Department Summary Table</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium rounded-l-lg">Dept</th>
                                    <th className="text-right px-3 py-2 text-xs text-gray-500 font-medium">Students</th>
                                    <th className="text-right px-3 py-2 text-xs text-gray-500 font-medium">Avg Risk</th>
                                    <th className="text-right px-3 py-2 text-xs text-gray-500 font-medium">High Risk</th>
                                    <th className="text-right px-3 py-2 text-xs text-gray-500 font-medium rounded-r-lg">Avg GPA</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {depts.map((d: any, i: number) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-2.5 text-xs font-medium text-gray-800">{d.department.split(" ")[0]}</td>
                                        <td className="px-3 py-2.5 text-xs text-gray-600 text-right">{d.total_students}</td>
                                        <td className="px-3 py-2.5 text-right">
                                            <span className={`text-xs font-semibold ${d.avg_risk >= 70 ? "text-red-600" : d.avg_risk >= 50 ? "text-amber-600" : "text-emerald-600"}`}>
                                                {d.avg_risk}%
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5 text-right">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">{d.high_risk_count}</span>
                                        </td>
                                        <td className="px-3 py-2.5 text-xs text-gray-600 text-right">{d.avg_gpa}</td>
                                    </tr>
                                ))}
                                {depts.length === 0 && (
                                    <tr><td colSpan={5} className="text-center text-gray-400 py-6 text-sm">No data</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* High Risk % Gauge bars */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">High-Risk Student % per Department</h3>
                <div className="space-y-3">
                    {[...depts].sort((a: any, b: any) => b.high_risk_pct - a.high_risk_pct).map((d: any, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                            <span className="text-xs text-gray-600 w-28 truncate">{d.department.split(" ")[0]}</span>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${d.high_risk_pct > 30 ? "bg-red-500" : d.high_risk_pct > 15 ? "bg-amber-400" : "bg-emerald-400"}`}
                                    style={{ width: `${Math.min(d.high_risk_pct, 100)}%` }}
                                />
                            </div>
                            <span className="text-xs font-semibold text-gray-700 w-10 text-right">{d.high_risk_pct}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
