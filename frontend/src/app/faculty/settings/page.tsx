"use client";

import { Settings, Bell, Shield, AlertTriangle, ToggleLeft, ToggleRight, Save } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [riskThreshold, setRiskThreshold] = useState(70);
  const [attThreshold, setAttThreshold] = useState(75);
  const [notifications, setNotifications] = useState({
    riskAlert: true, attendanceAlert: true, assignmentAlert: false, weeklyReport: true, parentEmail: false,
  });

  const toggle = (key: keyof typeof notifications) =>
    setNotifications((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure your portal preferences and academic thresholds</p>
      </div>

      {/* Risk & Attendance Thresholds */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500" /> Academic Thresholds
        </h3>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">Risk Alert Threshold</label>
                <p className="text-xs text-slate-400 mt-0.5">Flag students with risk score above this value</p>
              </div>
              <span className="text-xl font-bold text-red-600">{riskThreshold}%</span>
            </div>
            <input type="range" min={50} max={95} value={riskThreshold} onChange={(e) => setRiskThreshold(Number(e.target.value))}
              className="w-full h-2 rounded-full accent-red-500 cursor-pointer" />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>50% (Conservative)</span><span>95% (Strict)</span></div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">Attendance Warning Threshold</label>
                <p className="text-xs text-slate-400 mt-0.5">Warn students with attendance below this value</p>
              </div>
              <span className="text-xl font-bold text-amber-600">{attThreshold}%</span>
            </div>
            <input type="range" min={50} max={90} value={attThreshold} onChange={(e) => setAttThreshold(Number(e.target.value))}
              className="w-full h-2 rounded-full accent-amber-500 cursor-pointer" />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>50% (Relaxed)</span><span>90% (Strict)</span></div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
          <Bell size={18} className="text-blue-500" /> Notification Preferences
        </h3>
        <div className="space-y-4">
          {[
            { key: "riskAlert", label: "High Risk Alerts", desc: "Notify when a student crosses the risk threshold" },
            { key: "attendanceAlert", label: "Low Attendance Alerts", desc: "Daily alerts for students below attendance threshold" },
            { key: "assignmentAlert", label: "Assignment Deadlines", desc: "Remind before assignment due dates" },
            { key: "weeklyReport", label: "Weekly Summary Report", desc: "Auto-generate weekly attendance and risk summary" },
            { key: "parentEmail", label: "Parent Email Alerts", desc: "Automatically email parents on high risk or low attendance" },
          ].map((pref) => (
            <div key={pref.key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
              <div>
                <p className="text-sm font-semibold text-slate-800">{pref.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{pref.desc}</p>
              </div>
              <button onClick={() => toggle(pref.key as keyof typeof notifications)} className="flex-shrink-0">
                {notifications[pref.key as keyof typeof notifications]
                  ? <ToggleRight size={28} className="text-emerald-500" />
                  : <ToggleLeft size={28} className="text-slate-300" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
          <Shield size={18} className="text-purple-500" /> Security
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Current Password</label>
            <input type="password" placeholder="••••••••" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:border-emerald-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">New Password</label>
            <input type="password" placeholder="••••••••" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:border-emerald-400" />
          </div>
        </div>
      </div>

      <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-emerald-900/20">
        <Save size={16} /> Save All Settings
      </button>
    </div>
  );
}
