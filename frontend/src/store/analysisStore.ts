/**
 * Session-only analysis store.
 * Data persists only until "New Analysis" or session close.
 */

import { create } from "zustand";

export interface AnalysisStudent {
  id: string;
  name: string;
  avatar: string;
  riskScore: number;
  riskLevel: string;
  riskValue: string;
  department?: string;
  attendance_rate?: number;
  engagement_score?: number;
}

export interface AnalysisOverview {
  total_students: number;
  high_risk_count: number;
  average_attendance: number;
  average_risk_score: number;
  high_risk_department: string | null;
  risk_distribution: Record<string, number>;
}

interface AnalysisState {
  hasData: boolean;
  overview: AnalysisOverview | null;
  students: AnalysisStudent[];
  setAnalysisData: (overview: AnalysisOverview, students: AnalysisStudent[]) => void;
  clearAnalysis: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  hasData: false,
  overview: null,
  students: [],
  setAnalysisData: (overview, students) =>
    set({ hasData: true, overview, students }),
  clearAnalysis: () =>
    set({ hasData: false, overview: null, students: [] }),
}));
