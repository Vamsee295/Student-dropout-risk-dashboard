"use client";

import { useEffect, useState } from "react";
import { facultyService } from "@/services/faculty";
import apiClient from "@/lib/api";
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Upload,
  RefreshCw,
  Loader2,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Link from "next/link";

interface FacultyOverview {
  total_students: number;
  high_risk_count: number;
  average_attendance: number;
  average_risk_score: number;
  high_risk_department: string | null;
  risk_distribution: Record<string, number>;
}

interface DeptAnalytics {
  department: string;
  total_students: number;
  avg_risk_score: number;
  avg_attendance: number;
  high_risk_count: number;
}

const RISK_COLORS: Record<string, string> = {
  "High Risk": "#EF4444",
  "Moderate Risk": "#F59E0B",
  "Stable": "#6366F1",
  "Safe": "#10B981",
};

export default function FacultyDashboard() {
  const [overview, setOverview] = useState<FacultyOverview | null>(null);
  const [deptData, setDeptData] = useState<DeptAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewData, analyticsRes] = await Promise.all([
          facultyService.getOverview(),
          apiClient.get('/faculty/analytics/department'),
        ]);
        setOverview(overviewData as FacultyOverview);
        setDeptData(Array.isArray(analyticsRes.data) ? analyticsRes.data : []);
      } catch (error) {
        console.error("Failed to fetch faculty dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await facultyService.recalculateRisk();
      const overviewData = await facultyService.getOverview();
      setOverview(overviewData as FacultyOverview);
    } catch (error) {
      console.error("Recalculation failed:", error);
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!overview) return null;

  // Build pie data from the actual API keys ("High Risk", "Moderate Risk", "Stable", "Safe")
  const pieData = Object.entries(overview.risk_distribution || {})
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({
      name,
      value,
      color: RISK_COLORS[name] || "#6B7280",
    }));

  // Bar chart data — use avg_risk_score field from DepartmentAnalytics schema
  const barData = deptData.map((d) => ({
    department: d.department,
    avg_risk: d.avg_risk_score,
    attendance: d.avg_attendance,
    high_risk: d.high_risk_count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Faculty Overview</h1>
          <p className="text-gray-500">
            Monitor student risk levels and engagement across departments.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={18} className={recalculating ? "animate-spin" : ""} />
            {recalculating ? "Recalculating..." : "Recalculate Risk"}
          </button>
          <Link
            href="/dashboard/upload"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Upload size={18} />
            Upload Data
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={overview.total_students}
          icon={<Users className="text-blue-600" />}
          color="blue"
        />
        <StatCard
          title="At Risk Students"
          value={overview.high_risk_count}
          icon={<AlertTriangle className="text-red-600" />}
          color="red"
          subText={
            overview.total_students > 0
              ? `${((overview.high_risk_count / overview.total_students) * 100).toFixed(1)}% of total`
              : ""
          }
        />
        <StatCard
          title="Avg Attendance"
          value={`${(overview.average_attendance || 0).toFixed(1)}%`}
          icon={<TrendingUp className="text-green-600" />}
          color="green"
        />
        <StatCard
          title="Avg Risk Score"
          value={(overview.average_risk_score || 0).toFixed(1)}
          icon={<PieChartIcon className="text-purple-600" />}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Risk Distribution Donut */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Risk Distribution</h3>
          {pieData.length === 0 ? (
            <div className="flex h-[280px] items-center justify-center text-gray-400 text-sm">
              No risk data available
            </div>
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      `${value} students`,
                      String(name),
                    ]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={10}
                    formatter={(value) => (
                      <span className="text-xs text-gray-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Department Risk Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Department Risk Levels</h3>
          {barData.length === 0 ? (
            <div className="flex h-[280px] items-center justify-center text-gray-400 text-sm">
              No department data available
            </div>
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E7EB"
                  />
                  <XAxis
                    dataKey="department"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 11 }}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    cursor={{ fill: "#F3F4F6" }}
                    formatter={(value, name) => {
                      if (name === "avg_risk") return [`${Number(value).toFixed(1)}%`, "Avg Risk Score"];
                      if (name === "attendance") return [`${Number(value).toFixed(1)}%`, "Avg Attendance"];
                      return [`${value}`, String(name)];
                    }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => {
                      if (value === "avg_risk") return <span className="text-xs text-gray-600">Avg Risk Score</span>;
                      if (value === "attendance") return <span className="text-xs text-gray-600">Avg Attendance</span>;
                      return <span className="text-xs text-gray-600">{value}</span>;
                    }}
                  />
                  <Bar
                    dataKey="avg_risk"
                    name="avg_risk"
                    fill="#6366F1"
                    radius={[4, 4, 0, 0]}
                    barSize={32}
                  />
                  <Bar
                    dataKey="attendance"
                    name="attendance"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

      {/* Department Table */}
      {deptData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Department Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Students</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Avg Risk</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Avg Attendance</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">High Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {deptData.map((dept) => (
                  <tr key={dept.department} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{dept.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{dept.total_students}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-semibold ${dept.avg_risk_score >= 70 ? "text-red-600" :
                          dept.avg_risk_score >= 55 ? "text-amber-600" :
                            dept.avg_risk_score >= 40 ? "text-indigo-600" : "text-emerald-600"
                        }`}>
                        {dept.avg_risk_score.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{dept.avg_attendance.toFixed(1)}%</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                        {dept.high_risk_count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color, subText }: any) {
  const bgColors: any = {
    blue: "bg-blue-50",
    red: "bg-red-50",
    green: "bg-green-50",
    purple: "bg-purple-50",
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${bgColors[color]}`}>{icon}</div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        {subText && <p className="text-xs text-gray-400 mt-1">{subText}</p>}
      </div>
    </div>
  );
}
