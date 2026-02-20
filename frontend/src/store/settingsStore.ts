import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RiskThresholds {
    highRisk: number;
    mediumRisk: number;
    attendanceWarning: number;
    lmsInactivity: number;
    gradeDrop: number;
}

export interface FeatureWeights {
    attendance: number;
    grades: number;
    lmsActivity: number;
    assignmentCompletion: number;
    financialAid: number;
}

export interface GeneralSettings {
    institutionName: string;
    academicYear: string;
    semester: string;
    timezone: string;
    refreshFrequency: 'realtime' | 'daily' | 'weekly';
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Advisor' | 'Faculty';
    status: 'Active' | 'Inactive';
    lastLogin: string;
}

export interface NotificationSettings {
    emailAlerts: boolean;
    smsAlerts: boolean;
    weeklyDigest: boolean;
    dailySummary: boolean;
    interventionReminders: boolean;
}

interface SettingsState {
    activeTab: string;
    setActiveTab: (tab: string) => void;

    general: GeneralSettings;
    updateGeneral: (settings: Partial<GeneralSettings>) => void;

    riskThresholds: RiskThresholds;
    updateRiskThresholds: (thresholds: Partial<RiskThresholds>) => void;

    featureWeights: FeatureWeights;
    updateFeatureWeights: (weights: Partial<FeatureWeights>) => void;

    users: User[];
    addUser: (user: User) => void;
    removeUser: (id: string) => void;
    updateUser: (id: string, data: Partial<User>) => void;
    updateUserRole: (id: string, role: User['role']) => void;

    notifications: NotificationSettings;
    updateNotifications: (settings: Partial<NotificationSettings>) => void;

    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            activeTab: 'general',
            setActiveTab: (tab) => set({ activeTab: tab }),

            general: {
                institutionName: 'EduSight University',
                academicYear: '2025-2026',
                semester: 'Spring 2026',
                timezone: 'EST (UTC-5)',
                refreshFrequency: 'realtime',
            },
            updateGeneral: (settings) =>
                set((state) => ({ general: { ...state.general, ...settings } })),

            riskThresholds: {
                highRisk: 75,
                mediumRisk: 50,
                attendanceWarning: 70,
                lmsInactivity: 5,
                gradeDrop: 15,
            },
            updateRiskThresholds: (thresholds) =>
                set((state) => ({ riskThresholds: { ...state.riskThresholds, ...thresholds } })),

            featureWeights: {
                attendance: 0.3,
                grades: 0.3,
                lmsActivity: 0.2,
                assignmentCompletion: 0.1,
                financialAid: 0.1,
            },
            updateFeatureWeights: (weights) =>
                set((state) => ({ featureWeights: { ...state.featureWeights, ...weights } })),

            users: [
                { id: '1', name: 'Admin User', email: 'admin@edusight.edu', role: 'Admin', status: 'Active', lastLogin: new Date().toISOString().split('T')[0] },
                { id: '2', name: 'Faculty Advisor', email: 'faculty@edusight.edu', role: 'Advisor', status: 'Active', lastLogin: new Date().toISOString().split('T')[0] },
            ],
            addUser: (user) => set((state) => ({ users: [...state.users, user] })),
            removeUser: (id) => set((state) => ({ users: state.users.filter((u) => u.id !== id) })),
            updateUser: (id, data) =>
                set((state) => ({
                    users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
                })),
            updateUserRole: (id, role) =>
                set((state) => ({
                    users: state.users.map((u) => u.id === id ? { ...u, role } : u)
                })),

            notifications: {
                emailAlerts: true,
                smsAlerts: false,
                weeklyDigest: true,
                dailySummary: false,
                interventionReminders: true,
            },
            updateNotifications: (settings) =>
                set((state) => ({ notifications: { ...state.notifications, ...settings } })),

            isLoading: false,
            setIsLoading: (loading) => set({ isLoading: loading }),
        }),
        {
            name: 'edusight-settings',
            partialize: (state) => ({
                general: state.general,
                riskThresholds: state.riskThresholds,
                featureWeights: state.featureWeights,
                users: state.users,
                notifications: state.notifications,
            }),
        }
    )
);
