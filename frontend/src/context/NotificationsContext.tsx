"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

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

        // Generate role-specific initial notifications
        let initialNotifications: Notification[] = [];

        if (user.role === 'STUDENT') {
            initialNotifications = [
                {
                    id: 's1',
                    title: 'Upcoming Deadline',
                    message: 'Mathematics Assignment 3 is due in 24 hours.',
                    type: 'deadline',
                    timestamp: new Date(Date.now() - 1000 * 60 * 30),
                    read: false,
                },
                {
                    id: 's2',
                    title: 'Midterm Warning',
                    message: 'Database Systems midterm exam scheduled for next Monday.',
                    type: 'warning',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
                    read: false,
                },
                {
                    id: 's3',
                    title: 'Submission Received',
                    message: 'Your Physics lab report has been successfully submitted.',
                    type: 'success',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
                    read: true,
                },
            ];
        } else if (user.role === 'FACULTY' || user.role === 'ADMIN') {
            initialNotifications = [
                {
                    id: 'f1',
                    title: 'Pending Intervention',
                    message: 'Academic counseling session required for student John Doe.',
                    type: 'intervention',
                    timestamp: new Date(Date.now() - 1000 * 60 * 15),
                    read: false,
                },
                {
                    id: 'f2',
                    title: 'High Risk Student',
                    message: 'Student Sarah Smith has showing consecutive performance decline.',
                    type: 'alert',
                    timestamp: new Date(Date.now() - 1000 * 60 * 45),
                    read: false,
                },
                {
                    id: 'f3',
                    title: 'New At-Risk Cluster',
                    message: '3 students in CSE Section A have moved to High Risk category.',
                    type: 'alert',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
                    read: false,
                },
                {
                    id: 'f4',
                    title: 'Remedial Class Scheduled',
                    message: 'Extra session for Mathematics scheduled for tomorrow 4 PM.',
                    type: 'info',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
                    read: true,
                },
            ];
        }

        setNotifications(initialNotifications);
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
