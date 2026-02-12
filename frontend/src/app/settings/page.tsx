"use client";

import { useSettingsStore } from "@/store/settingsStore";

import { GeneralSettings } from "@/components/settings/sections/GeneralSettings";
import { RiskModelSettings } from "@/components/settings/sections/RiskModelSettings";

import { UserManagement } from "@/components/settings/sections/UserManagement";
import { NotificationSettings } from "@/components/settings/sections/NotificationSettings";
import { InterventionPolicy } from "@/components/settings/sections/InterventionPolicy";

import { IntegrationSettings } from "@/components/settings/sections/IntegrationSettings";
import { SecuritySettings } from "@/components/settings/sections/SecuritySettings";
import { ModelInfo } from "@/components/settings/sections/ModelInfo";
import { AppearanceSettings } from "@/components/settings/sections/AppearanceSettings";

export default function SettingsPage() {
    const { activeTab } = useSettingsStore();

    const renderContent = () => {
        switch (activeTab) {
            case 'general': return <GeneralSettings />;
            case 'risk-model': return <RiskModelSettings />;
            case 'users': return <UserManagement />;
            case 'notifications': return <NotificationSettings />;
            case 'integrations': return <IntegrationSettings />;
            case 'intervention-policy': return <InterventionPolicy />;
            case 'security': return <SecuritySettings />;
            case 'model-info': return <ModelInfo />;
            case 'appearance': return <AppearanceSettings />;
            default: return <GeneralSettings />;
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            {renderContent()}
        </div>
    );
}
