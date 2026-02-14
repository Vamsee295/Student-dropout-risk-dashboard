"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type NotificationType = 'alert' | 'info' | 'success' | 'warning';

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
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            title: 'High Risk Alert',
            message: 'Student John Doe has dropped below 75% attendance.',
            type: 'alert',
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
            read: false,
        },
        {
            id: '2',
            title: 'System Update',
            message: 'The dashboard will undergo maintenance at midnight.',
            type: 'info',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            read: false,
        },
        {
            id: '3',
            title: 'Report Generated',
            message: 'Your requested attendance report is ready for download.',
            type: 'success',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            read: true,
        },
    ]);

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
            id: Math.random().toString(36).substr(2, 9),
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
