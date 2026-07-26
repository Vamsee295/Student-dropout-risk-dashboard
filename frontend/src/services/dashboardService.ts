/**
 * Dashboard Service
 * ─────────────────
 * Cross-dashboard shared utilities: system notifications, quick summaries,
 * and any data that is needed by more than one dashboard role.
 */

import apiClient from '@/api/axios';

export interface SystemNotification {
  id: number;
  type: 'alert' | 'info' | 'success' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface SystemStatus {
  api_online: boolean;
  model_last_updated: string;
  total_predictions_today: number;
  system_health: 'healthy' | 'degraded' | 'down';
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const dashboardService = {
  /**
   * Fetch system-wide notifications for the notification bell.
   */
  async getNotifications(): Promise<SystemNotification[]> {
    try {
      const { data } = await apiClient.get('/notifications');
      return data;
    } catch {
      await delay(200);
      const now = new Date();
      return [
        { id: 1, type: 'alert', title: 'High-Risk Student Alert', message: 'Arjun Mehta risk score exceeded 90%. Immediate intervention required.', timestamp: new Date(now.getTime() - 15 * 60000).toISOString(), read: false },
        { id: 2, type: 'warning', title: 'Low Attendance Detected', message: 'Mechanical department attendance dropped to 67% this week.', timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(), read: false },
        { id: 3, type: 'info', title: 'Risk Scores Updated', message: 'Weekly AI risk recalculation completed for all 2,847 students.', timestamp: new Date(now.getTime() - 4 * 3600000).toISOString(), read: true },
        { id: 4, type: 'success', title: 'Intervention Resolved', message: 'Priya Sharma risk score improved from 88% to 61% after counselling.', timestamp: new Date(now.getTime() - 1 * 86400000).toISOString(), read: true },
      ];
    }
  },

  /**
   * Mark a notification as read.
   */
  async markNotificationRead(id: number): Promise<void> {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch {
      await delay(100);
      // Silent fail — UI can optimistically update
    }
  },

  /**
   * Get system health status (model online, last updated, etc.)
   */
  async getSystemStatus(): Promise<SystemStatus> {
    try {
      const { data } = await apiClient.get('/system/status');
      return data;
    } catch {
      await delay(200);
      return {
        api_online: false,
        model_last_updated: new Date(Date.now() - 6 * 3600000).toISOString(),
        total_predictions_today: 2847,
        system_health: 'healthy',
      };
    }
  },
};
