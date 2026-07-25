"use client";

import { useState } from "react";
import { Bell, Moon, Shield, Smartphone, Globe, Palette, Save, Check } from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    assignments: true, attendance: true, grades: true, announcements: true,
    weeklyReport: true, aiInsights: true, placement: false,
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true, attendanceVisible: false, gradeVisible: false,
  });
  const [prefs, setPrefs] = useState({ darkMode: false, language: "English", timezone: "Asia/Kolkata" });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange}
      className={`relative w-10 h-5 rounded-full transition-colors ${value ? "bg-blue-600" : "bg-slate-200"}`}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5.5 left-0.5" : "left-0.5"}`}
        style={{ transform: value ? "translateX(calc(100% + 2px))" : "translateX(0)" }} />
    </button>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-400 mt-0.5">Manage your account preferences and notifications</p>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-5">
          <Bell size={18} className="text-blue-600" />
          <h3 className="font-bold text-slate-900">Notifications</h3>
        </div>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, val]) => {
            const labels: Record<string, { label: string; desc: string }> = {
              assignments: { label: "Assignment Reminders", desc: "Get notified about due dates and new assignments" },
              attendance: { label: "Attendance Alerts", desc: "Warnings when attendance falls below threshold" },
              grades: { label: "Grade Updates", desc: "Notified when marks are published" },
              announcements: { label: "Faculty Announcements", desc: "Important messages from your professors" },
              weeklyReport: { label: "Weekly Progress Report", desc: "Summary of your week every Sunday" },
              aiInsights: { label: "AI Coach Insights", desc: "Personalized recommendations from your AI coach" },
              placement: { label: "Placement Alerts", desc: "Job and internship opening notifications" },
            };
            const info = labels[key];
            return (
              <div key={key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{info.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{info.desc}</p>
                </div>
                <Toggle value={val} onChange={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-5">
          <Shield size={18} className="text-purple-600" />
          <h3 className="font-bold text-slate-900">Privacy</h3>
        </div>
        <div className="space-y-4">
          {Object.entries(privacy).map(([key, val]) => {
            const labels: Record<string, { label: string; desc: string }> = {
              profileVisible: { label: "Profile Visible to Peers", desc: "Other students can see your basic profile" },
              attendanceVisible: { label: "Attendance Visible to Peers", desc: "Share your attendance percentage with classmates" },
              gradeVisible: { label: "Grades Visible to Peers", desc: "Share your academic performance publicly" },
            };
            const info = labels[key];
            return (
              <div key={key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{info.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{info.desc}</p>
                </div>
                <Toggle value={val} onChange={() => setPrivacy((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-5">
          <Palette size={18} className="text-amber-500" />
          <h3 className="font-bold text-slate-900">Display & Language</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-semibold text-slate-800">Dark Mode</p>
              <p className="text-xs text-slate-400 mt-0.5">Switch to dark theme</p>
            </div>
            <Toggle value={prefs.darkMode} onChange={() => setPrefs((p) => ({ ...p, darkMode: !p.darkMode }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Language</label>
              <select value={prefs.language} onChange={(e) => setPrefs((p) => ({ ...p, language: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400">
                <option>English</option>
                <option>Hindi</option>
                <option>Tamil</option>
                <option>Telugu</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Timezone</label>
              <select value={prefs.timezone} onChange={(e) => setPrefs((p) => ({ ...p, timezone: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400">
                <option>Asia/Kolkata</option>
                <option>UTC</option>
                <option>Asia/Dubai</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-5">
          <Shield size={18} className="text-red-500" />
          <h3 className="font-bold text-slate-900">Security</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {["Current Password", "New Password", "Confirm Password"].map((label, i) => (
            <div key={i}>
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{label}</label>
              <input type="password" placeholder="••••••••"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400" />
            </div>
          ))}
        </div>
        <button className="mt-3 px-4 py-2 text-xs font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
          Update Password
        </button>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
            saved ? "bg-emerald-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
          } shadow-sm`}>
          {saved ? <><Check size={16} /> Saved!</> : <><Save size={15} /> Save Settings</>}
        </button>
      </div>
    </div>
  );
}
