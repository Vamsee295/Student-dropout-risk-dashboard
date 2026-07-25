"use client";

import { useState } from "react";
import { Settings, Users, Shield, BrainCircuit, Database, FileText, Save, CheckCircle2, AlertTriangle } from "lucide-react";

const auditLogs = [
  { action: "Risk threshold updated", user: "Dean Admin", time: "Jan 22, 2024 – 10:32 AM", type: "config" },
  { action: "User role changed: Dr. Kavya → HOD", user: "Admin", time: "Jan 21, 2024 – 3:15 PM", type: "user" },
  { action: "ML Model retrained (v2.3)", user: "System", time: "Jan 15, 2024 – 2:00 AM", type: "ai" },
  { action: "Budget allocation modified (Mech Dept)", user: "Dean Admin", time: "Jan 14, 2024 – 11:20 AM", type: "finance" },
  { action: "NAAC report exported (PDF)", user: "Dean Admin", time: "Jan 12, 2024 – 9:05 AM", type: "report" },
  { action: "Emergency announcement broadcast", user: "Dean Admin", time: "Jan 12, 2024 – 8:44 AM", type: "comms" },
  { action: "New faculty account created: Dr. Arjun R.", user: "Admin", time: "Jan 10, 2024 – 4:22 PM", type: "user" },
];

const users = [
  { name: "Dr. Sarah Dean", role: "DEAN", dept: "Administration", status: "active", lastLogin: "Today" },
  { name: "Prof. Ananya Iyer", role: "HOD", dept: "EEE", status: "active", lastLogin: "Yesterday" },
  { name: "Dr. Priya Sharma", role: "FACULTY", dept: "CSE", status: "active", lastLogin: "Today" },
  { name: "Alex Johnson (CS21B056)", role: "STUDENT", dept: "CSE", status: "active", lastLogin: "Today" },
  { name: "Dr. Deepak Nair", role: "FACULTY", dept: "Mech", status: "active", lastLogin: "3 days ago" },
];

const roleColors: Record<string, string> = {
  DEAN: "bg-violet-100 text-violet-700", HOD: "bg-indigo-100 text-indigo-700",
  FACULTY: "bg-blue-100 text-blue-700", STUDENT: "bg-emerald-100 text-emerald-700",
};

export default function SystemAdminPage() {
  const [tab, setTab] = useState<"users" | "ai" | "security" | "audit">("users");
  const [riskThreshold, setRiskThreshold] = useState(60);
  const [attendanceThreshold, setAttendanceThreshold] = useState(75);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">System Administration</h1>
        <p className="text-sm text-zinc-400 mt-0.5">User management, AI configuration, security, and audit logs</p>
      </div>

      {/* Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 font-medium">
          Changes made here affect the entire platform. All modifications are logged in the audit trail.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white border border-zinc-200 rounded-xl p-1 flex-wrap">
        {[["users", "User Management", <Users size={13} />], ["ai", "AI / ML Config", <BrainCircuit size={13} />], ["security", "Security", <Shield size={13} />], ["audit", "Audit Logs", <FileText size={13} />]].map(([k, l, icon]) => (
          <button key={k as string} onClick={() => setTab(k as any)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${tab === k ? "bg-violet-600 text-white" : "text-zinc-500 hover:text-zinc-800"}`}>
            {icon}{l as string}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="font-bold text-zinc-900">User Accounts</h3>
            <button className="text-xs font-semibold px-3 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700">+ Add User</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100">
                  {["Name", "Role", "Department", "Status", "Last Login", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {users.map((u, i) => (
                  <tr key={i} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-semibold text-zinc-800">{u.name}</td>
                    <td className="px-5 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleColors[u.role]}`}>{u.role}</span></td>
                    <td className="px-5 py-3 text-xs text-zinc-500">{u.dept}</td>
                    <td className="px-5 py-3"><span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{u.status}</span></td>
                    <td className="px-5 py-3 text-xs text-zinc-400">{u.lastLogin}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button className="text-[10px] px-2 py-1 border border-zinc-200 text-zinc-600 rounded-lg hover:bg-zinc-50">Edit</button>
                        <button className="text-[10px] px-2 py-1 border border-red-200 text-red-600 rounded-lg hover:bg-red-50">Disable</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "ai" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <h3 className="font-bold text-zinc-900 mb-5 flex items-center gap-2"><BrainCircuit size={15} className="text-violet-600" /> ML Model Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-3 block">High-Risk Dropout Threshold: <span className="text-violet-700 font-black">{riskThreshold}%</span></label>
                <input type="range" min={40} max={80} value={riskThreshold} onChange={(e) => setRiskThreshold(Number(e.target.value))}
                  className="w-full accent-violet-600" />
                <div className="flex justify-between text-[10px] text-zinc-400 mt-1"><span>40%</span><span>80%</span></div>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-3 block">Min Attendance Threshold: <span className="text-violet-700 font-black">{attendanceThreshold}%</span></label>
                <input type="range" min={65} max={85} value={attendanceThreshold} onChange={(e) => setAttendanceThreshold(Number(e.target.value))}
                  className="w-full accent-violet-600" />
                <div className="flex justify-between text-[10px] text-zinc-400 mt-1"><span>65%</span><span>85%</span></div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: "Model Version", value: "EduRisk v2.3" },
                { label: "Last Trained", value: "Jan 15, 2024" },
                { label: "Training Records", value: "15,420" },
                { label: "Next Scheduled Retraining", value: "Apr 1, 2024" },
              ].map((s, i) => (
                <div key={i} className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl">
                  <p className="text-[10px] text-zinc-400 font-medium">{s.label}</p>
                  <p className="text-xs font-bold text-zinc-800 mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${saved ? "bg-emerald-600 text-white" : "bg-violet-600 text-white hover:bg-violet-700"}`}>
                {saved ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> Save Config</>}
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 border border-violet-300 text-violet-600 rounded-xl text-sm font-semibold hover:bg-violet-50">
                🔄 Trigger Retraining
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "security" && (
        <div className="space-y-4">
          {[
            { label: "Two-Factor Authentication (2FA)", desc: "Require 2FA for all admin accounts", enabled: true },
            { label: "Session Timeout (30 min)", desc: "Auto-logout after 30 minutes of inactivity", enabled: true },
            { label: "IP Whitelisting", desc: "Restrict admin access to university network IPs", enabled: false },
            { label: "Audit Log Retention (90 days)", desc: "Keep all audit logs for 90 days", enabled: true },
            { label: "Automatic Backup (Daily)", desc: "Daily database backup to secure cloud storage", enabled: true },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-zinc-800">{s.label}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{s.desc}</p>
              </div>
              <div className={`w-10 h-5 rounded-full relative flex-shrink-0 ${s.enabled ? "bg-violet-600" : "bg-zinc-200"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${s.enabled ? "left-5" : "left-0.5"}`} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "audit" && (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-zinc-100">
            <h3 className="font-bold text-zinc-900">Audit Trail (Last 30 Days)</h3>
          </div>
          <div className="divide-y divide-zinc-50">
            {auditLogs.map((log, i) => {
              const typeColors: Record<string, string> = { config: "bg-violet-100 text-violet-700", user: "bg-blue-100 text-blue-700", ai: "bg-indigo-100 text-indigo-700", finance: "bg-amber-100 text-amber-700", report: "bg-emerald-100 text-emerald-700", comms: "bg-sky-100 text-sky-700" };
              return (
                <div key={i} className="flex items-start gap-4 px-5 py-4 hover:bg-zinc-50">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize flex-shrink-0 mt-0.5 ${typeColors[log.type]}`}>{log.type}</span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-zinc-800">{log.action}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">By {log.user} · {log.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
