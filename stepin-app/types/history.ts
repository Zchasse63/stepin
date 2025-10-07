/**
 * History and progress tracking types
 */

import { Walk, DailyStats } from './database';

export type TimePeriod = 'week' | 'month' | 'year';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface HistoryData {
  walks: Walk[];
  dailyStats: DailyStats[];
  totalSteps: number;
  totalWalks: number;
  averageSteps: number;
  daysGoalMet: number;
  goalMetPercentage: number;
}

export interface DayData {
  date: string; // ISO date string
  steps: number;
  goalMet: boolean;
  walks: Walk[];
}

export interface SummaryStats {
  totalSteps: number;
  totalWalks: number;
  averageSteps: number;
  daysGoalMet: number;
  goalMetPercentage: number;
}

export interface Insight {
  id: string;
  type: 'positive' | 'nudge' | 'milestone';
  icon: string;
  title: string;
  description: string;
  priority: number; // Higher = more important
}

