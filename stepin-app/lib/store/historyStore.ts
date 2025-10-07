/**
 * History data store using Zustand
 * Manages selected time period, date ranges, and history data
 */

import { create } from 'zustand';
import { TimePeriod, DateRange, HistoryData } from '../../types/history';
import { getDateRangeForPeriod } from '../utils/dateUtils';

interface HistoryState {
  // Selected time period
  selectedPeriod: TimePeriod;
  
  // Date range for selected period
  dateRange: DateRange;
  
  // History data
  historyData: HistoryData | null;
  
  // Loading state
  isLoading: boolean;
  
  // Error state
  error: string | null;
  
  // Selected day for details view
  selectedDate: string | null;
  
  // Actions
  setSelectedPeriod: (period: TimePeriod) => void;
  setHistoryData: (data: HistoryData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedDate: (date: string | null) => void;
  clearHistoryData: () => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  // Initial state
  selectedPeriod: 'week',
  dateRange: getDateRangeForPeriod('week'),
  historyData: null,
  isLoading: false,
  error: null,
  selectedDate: null,
  
  // Actions
  setSelectedPeriod: (period) => {
    const dateRange = getDateRangeForPeriod(period);
    set({ 
      selectedPeriod: period, 
      dateRange,
      selectedDate: null // Clear selected date when changing period
    });
  },
  
  setHistoryData: (data) => set({ historyData: data, error: null }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error, isLoading: false }),
  
  setSelectedDate: (date) => set({ selectedDate: date }),
  
  clearHistoryData: () => set({ 
    historyData: null, 
    error: null, 
    isLoading: false,
    selectedDate: null
  }),
}));

