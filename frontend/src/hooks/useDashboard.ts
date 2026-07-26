/**
 * useDashboard — Shared hook for cross-role dashboard utilities
 *
 * Provides: system notifications, unread count, notification marking.
 *
 * Usage:
 *   const { notifications, unreadCount, markRead } = useDashboard();
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { dashboardService, type SystemNotification, type SystemStatus } from '@/services/dashboardService';

interface UseDashboardState {
  notifications: SystemNotification[];
  unreadCount: number;
  systemStatus: SystemStatus | null;
  isLoading: boolean;
  markRead: (id: number) => Promise<void>;
  refetch: () => void;
}

export function useDashboard(): UseDashboardState {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [notifs, status] = await Promise.all([
        dashboardService.getNotifications(),
        dashboardService.getSystemStatus(),
      ]);
      setNotifications(notifs);
      setSystemStatus(status);
    } catch {
      // Non-critical — fail silently
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const markRead = useCallback(async (id: number) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await dashboardService.markNotificationRead(id);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    systemStatus,
    isLoading,
    markRead,
    refetch: fetchAll,
  };
}
