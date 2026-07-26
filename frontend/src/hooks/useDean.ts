/**
 * useDean — Custom hook for Dean/Admin Dashboard data
 *
 * Usage:
 *   const { overview, departments, alerts, isLoading, error, refetch } = useDean();
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  deanService,
  type DeanOverview,
  type DepartmentStat,
  type FacultyPerformance,
  type AcademicTrends,
  type EngagementData,
  type InterventionStats,
  type PredictiveInsight,
  type DropoutTrend,
  type RetentionTrend,
  type RiskDistribution,
  type ActiveAlert,
} from '@/services/deanService';

interface UseDeanState {
  overview: DeanOverview | null;
  departments: DepartmentStat[] | null;
  facultyPerformance: FacultyPerformance[] | null;
  academicTrends: AcademicTrends | null;
  engagement: EngagementData | null;
  interventions: InterventionStats | null;
  predictiveInsights: PredictiveInsight | null;
  dropoutTrend: DropoutTrend[] | null;
  retentionTrend: RetentionTrend[] | null;
  riskDistribution: RiskDistribution[] | null;
  alerts: ActiveAlert[] | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDean(): UseDeanState {
  const [overview, setOverview] = useState<DeanOverview | null>(null);
  const [departments, setDepartments] = useState<DepartmentStat[] | null>(null);
  const [facultyPerformance, setFacultyPerformance] = useState<FacultyPerformance[] | null>(null);
  const [academicTrends, setAcademicTrends] = useState<AcademicTrends | null>(null);
  const [engagement, setEngagement] = useState<EngagementData | null>(null);
  const [interventions, setInterventions] = useState<InterventionStats | null>(null);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight | null>(null);
  const [dropoutTrend, setDropoutTrend] = useState<DropoutTrend[] | null>(null);
  const [retentionTrend, setRetentionTrend] = useState<RetentionTrend[] | null>(null);
  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution[] | null>(null);
  const [alerts, setAlerts] = useState<ActiveAlert[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      // Priority 1: Critical above-fold data
      const results1 = await Promise.allSettled([
        deanService.getOverview(),
        deanService.getDepartmentAnalytics(),
        deanService.getRiskDistribution(),
        deanService.getActiveAlerts(),
        deanService.getDropoutTrend(),
        deanService.getRetentionTrend(),
      ]);
      const [ov, dept, dist, alrts, dtTrend, rtTrend] = results1;

      if (ov.status === 'fulfilled') setOverview(ov.value);
      else throw new Error(ov.reason?.message || 'Failed to load executive overview');
      if (dept.status === 'fulfilled') setDepartments(dept.value);
      if (dist.status === 'fulfilled') setRiskDistribution(dist.value);
      if (alrts.status === 'fulfilled') setAlerts(alrts.value);
      if (dtTrend.status === 'fulfilled') setDropoutTrend(dtTrend.value);
      if (rtTrend.status === 'fulfilled') setRetentionTrend(rtTrend.value);

      // Priority 2: Secondary analytics (non-blocking)
      const results2 = await Promise.allSettled([
        deanService.getFacultyPerformance(),
        deanService.getAcademicTrends(),
        deanService.getEngagementAttendance(),
        deanService.getInterventions(),
        deanService.getPredictiveInsights(),
      ]);
      const [facPerf, acad, eng, intv, pred] = results2;
      if (facPerf.status === 'fulfilled') setFacultyPerformance(facPerf.value);
      if (acad.status === 'fulfilled') setAcademicTrends(acad.value);
      if (eng.status === 'fulfilled') setEngagement(eng.value);
      if (intv.status === 'fulfilled') setInterventions(intv.value);
      if (pred.status === 'fulfilled') setPredictiveInsights(pred.value);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load executive dashboard. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return {
    overview,
    departments,
    facultyPerformance,
    academicTrends,
    engagement,
    interventions,
    predictiveInsights,
    dropoutTrend,
    retentionTrend,
    riskDistribution,
    alerts,
    isLoading,
    isRefreshing,
    error,
    refetch: () => fetchAll(true),
  };
}
