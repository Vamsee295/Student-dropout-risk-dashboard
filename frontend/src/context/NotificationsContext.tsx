"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import apiClient from '@/lib/api';

export type NotificationType = 'alert' | 'info' | 'success' | 'warning' | 'deadline' | 'intervention';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    timestamp: Date;
    read: boolean;
}

interface NotificationsContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    clearNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
    const { user } = useAuthStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            return;
        }

        apiClient
            .get('/analytics/notifications', { params: { role: user.role } })
            .then((res) => {
                const items = (res.data?.notifications || []).map((n: any) => ({
                    ...n,
                    timestamp: new Date(n.timestamp),
                }));
                setNotifications(items);
            })
            .catch(() => {
                setNotifications([
                    {
                        id: 'fallback',
                        title: 'Dashboard Ready',
                        message: 'Your dashboard is loaded with the latest data.',
                        type: 'info' as NotificationType,
                        timestamp: new Date(),
                        read: false,
                    },
                ]);
            });
    }, [user]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: `notif-${Date.now()}-${performance.now().toString(36).replace('.', '')}`,
            timestamp: new Date(),
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    return (
        <NotificationsContext.Provider
            value={{
                notifications,
                unreadCount,
                markAsRead,
                markAllAsRead,
                addNotification,
                clearNotifications,
            }}
        >
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationsContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationsProvider');
    }
    return context;
}
