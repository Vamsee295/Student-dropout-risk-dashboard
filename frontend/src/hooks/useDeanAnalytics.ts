import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/api/axios';

export function useDeanAnalytics() {
  const [multiTrend, setMultiTrend] = useState([]);
  const [yearlyGraduation, setYearlyGraduation] = useState([]);
  const [researchGrowth, setResearchGrowth] = useState([]);
  const [leaderboards, setLeaderboards] = useState({ departments: [], placement: [] });
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const [trendRes, gradRes, researchRes, leaderRes] = await Promise.all([
        apiClient.get('/analytics/dean/multi-trend'),
        apiClient.get('/analytics/dean/yearly-graduation'),
        apiClient.get('/analytics/dean/research-growth'),
        apiClient.get('/analytics/dean/leaderboards')
      ]);
      setMultiTrend(trendRes.data);
      setYearlyGraduation(gradRes.data);
      setResearchGrowth(researchRes.data);
      setLeaderboards(leaderRes.data);
    } catch (err) {
      console.error("Error fetching dean analytics data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { multiTrend, yearlyGraduation, researchGrowth, leaderboards, isLoading, refetch: fetchAnalytics };
}
