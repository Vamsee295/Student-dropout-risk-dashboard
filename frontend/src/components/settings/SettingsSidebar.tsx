"use client";

import {
    Settings,
    Target,
    Users,
    Bell,
    Shield,
    Link as LinkIcon,
    FileText,
    Cpu,
    Palette
} from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";

const menuItems = [
    { id: 'general', label: 'General Settings', icon: Settings },
    { id: 'risk-model', label: 'Risk Model Configuration', icon: Target },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Data Integrations', icon: LinkIcon },
    { id: 'intervention-policy', label: 'Intervention Policies', icon: FileText },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'model-info', label: 'Model Transparency', icon: Cpu },
    { id: 'appearance', label: 'Appearance', icon: Palette },
];

export function SettingsSidebar() {
    const { activeTab, setActiveTab } = useSettingsStore();

    return (
        <nav className="p-2 space-y-1">
            {menuItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === item.id
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    <item.icon size={18} className={activeTab === item.id ? "text-blue-600" : "text-gray-400"} />
                    {item.label}
                </button>
            ))}
        </nav>
    );
}
