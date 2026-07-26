import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/api/axios';

export function useAttendance() {
  const [weeklyData, setWeeklyData] = useState([]);
  const [belowThreshold, setBelowThreshold] = useState([]);
  const [attendanceGrid, setAttendanceGrid] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAttendance = useCallback(async () => {
    setIsLoading(true);
    try {
      const [weeklyRes, belowRes, gridRes] = await Promise.all([
        apiClient.get('/attendance/weekly'),
        apiClient.get('/attendance/below-threshold'),
        apiClient.get('/attendance/grid')
      ]);
      setWeeklyData(weeklyRes.data);
      setBelowThreshold(belowRes.data);
      setAttendanceGrid(gridRes.data);
    } catch (err) {
      console.error("Error fetching attendance data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  return { weeklyData, belowThreshold, attendanceGrid, isLoading, refetch: fetchAttendance };
}
