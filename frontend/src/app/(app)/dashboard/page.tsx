"use client";

import { useEffect, useState } from "react";
import { facultyService, type FacultyOverview, type AnalyticsData } from "@/services/faculty";
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Upload,
  RefreshCw,
  Loader2,
  PieChart as PieChartIcon,
  BarChart2
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
  Legend
} from "recharts";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FacultyDashboard() {
  const [overview, setOverview] = useState<FacultyOverview | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewData, analyticsData] = await Promise.all([
          facultyService.getOverview(),
          facultyService.getAnalytics()
        ]);
        setOverview(overviewData);
        setAnalytics(analyticsData);
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
      // Refresh data
      const overviewData = await facultyService.getOverview();
      setOverview(overviewData);
      alert("Risk scores recalculated successfully.");
    } catch (error) {
      console.error("Recalculation failed:", error);
      alert("Failed to recalculate risk scores.");
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

  if (!overview || !analytics) return null;

  const pieData = [
    { name: 'Low Risk', value: overview.risk_distribution.low, color: '#10B981' },
    { name: 'Moderate Risk', value: overview.risk_distribution.medium, color: '#F59E0B' },
    { name: 'High Risk', value: overview.risk_distribution.high, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Faculty Overview</h1>
          <p className="text-gray-500">Monitor student risk levels and engagement across departments.</p>
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
          subText={`${((overview.high_risk_count / overview.total_students) * 100).toFixed(1)}% of total`}
        />
        <StatCard
          title="Avg Attendance"
          value={`${(overview.average_attendance || 0).toFixed(1)}%`}
          icon={<TrendingUp className="text-green-600" />}
          color="green"
        />
        <StatCard
          title="Avg Risk Score"
          value={overview.average_risk_score.toFixed(1)}
          icon={<PieChartIcon className="text-purple-600" />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Risk Distribution Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-6">Risk Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Analysis Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-6">Department Risk Levels</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.department_risks}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar dataKey="avg_risk" name="Avg Risk Score" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
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
        <div className={`p-3 rounded-lg ${bgColors[color]}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        {subText && <p className="text-xs text-gray-400 mt-1">{subText}</p>}
      </div>
    </div>
  );
}
