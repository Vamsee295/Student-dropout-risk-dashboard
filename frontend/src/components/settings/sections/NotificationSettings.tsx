"use client";

import { useSettingsStore, NotificationSettings as NotifSettingsType } from "@/store/settingsStore";
import { Save, Loader2, Bell, Mail, Smartphone } from "lucide-react";
import { useState } from "react";

export function NotificationSettings() {
    const { notifications, updateNotifications, isLoading, setIsLoading } = useSettingsStore();
    const [hasChanges, setHasChanges] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        setIsLoading(false);
        setHasChanges(false);
    };

    const handleChange = (key: keyof NotifSettingsType, value: boolean) => {
        updateNotifications({ [key]: value });
        setHasChanges(true);
    };

    const Toggle = ({ label, checked, onChange, icon: Icon, description }: any) => (
        <div className="flex items-start justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex gap-3">
                <div className={`p-2 rounded-lg ${checked ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Icon size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 text-sm">{label}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                </div>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-gray-900">Notification Preferences</h2>
                <p className="text-sm text-gray-500">
                    Control how and when you receive alerts from the system.
                </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <Toggle
                    label="High Risk Email Alerts"
                    description="Receive an email immediately when a student crosses the high-risk threshold."
                    icon={Mail}
                    checked={notifications.emailAlerts}
                    onChange={(val: boolean) => handleChange('emailAlerts', val)}
                />
                <Toggle
                    label="SMS Alerts"
                    description="Receive text messages for critical interventions."
                    icon={Smartphone}
                    checked={notifications.smsAlerts}
                    onChange={(val: boolean) => handleChange('smsAlerts', val)}
                />
                <Toggle
                    label="Weekly Risk Digest"
                    description="A summary of risk trends and new high-risk students sent every Monday."
                    icon={Bell}
                    checked={notifications.weeklyDigest}
                    onChange={(val: boolean) => handleChange('weeklyDigest', val)}
                />
                <Toggle
                    label="Intervention Reminders"
                    description="Notifications for overdue or upcoming interventions assigned to you."
                    icon={Bell}
                    checked={notifications.interventionReminders}
                    onChange={(val: boolean) => handleChange('interventionReminders', val)}
                />
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={!hasChanges || isLoading}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white transition-all ${hasChanges && !isLoading
                            ? "bg-blue-600 hover:bg-blue-700 shadow-md"
                            : "bg-gray-300 cursor-not-allowed"
                        }`}
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Preferences
                </button>
            </div>
        </div>
    );
}
