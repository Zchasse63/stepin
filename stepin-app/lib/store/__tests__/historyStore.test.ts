/**
 * Unit tests for historyStore
 * Tests history state management and actions
 */

import { useHistoryStore } from '../historyStore';
import { HistoryData } from '../../../types/history';

// Mock dateUtils
jest.mock('../../utils/dateUtils', () => ({
  getDateRangeForPeriod: jest.fn((period) => ({
    startDate: new Date(2025, 9, 1),
    endDate: new Date(2025, 9, 7),
  })),
}));

describe('historyStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useHistoryStore.setState({
      selectedPeriod: 'week',
      dateRange: {
        startDate: new Date(2025, 9, 1),
        endDate: new Date(2025, 9, 7),
      },
      historyData: null,
      isLoading: false,
      error: null,
      selectedDate: null,
    });
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useHistoryStore.getState();
      
      expect(state.selectedPeriod).toBe('week');
      expect(state.dateRange).toBeDefined();
      expect(state.historyData).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.selectedDate).toBeNull();
    });
  });

  describe('setSelectedPeriod', () => {
    it('should update selected period and date range', () => {
      const { setSelectedPeriod } = useHistoryStore.getState();
      
      setSelectedPeriod('month');
      
      const state = useHistoryStore.getState();
      expect(state.selectedPeriod).toBe('month');
      expect(state.dateRange).toBeDefined();
    });

    it('should clear selected date when changing period', () => {
      // Set initial selected date
      useHistoryStore.setState({ selectedDate: '2025-10-05' });
      
      const { setSelectedPeriod } = useHistoryStore.getState();
      setSelectedPeriod('month');
      
      const state = useHistoryStore.getState();
      expect(state.selectedDate).toBeNull();
    });

    it('should handle all period types', () => {
      const { setSelectedPeriod } = useHistoryStore.getState();
      
      setSelectedPeriod('week');
      expect(useHistoryStore.getState().selectedPeriod).toBe('week');
      
      setSelectedPeriod('month');
      expect(useHistoryStore.getState().selectedPeriod).toBe('month');
      
      setSelectedPeriod('year');
      expect(useHistoryStore.getState().selectedPeriod).toBe('year');
    });
  });

  describe('setHistoryData', () => {
    it('should set history data', () => {
      const mockData: HistoryData = {
        dailyStats: [],
        walks: [],
        summaryStats: {
          totalSteps: 50000,
          totalWalks: 10,
          averageSteps: 5000,
          daysGoalMet: 5,
          goalMetPercentage: 50,
        },
        insights: [],
      };
      
      const { setHistoryData } = useHistoryStore.getState();
      setHistoryData(mockData);
      
      const state = useHistoryStore.getState();
      expect(state.historyData).toEqual(mockData);
      expect(state.error).toBeNull();
    });

    it('should clear error when setting data', () => {
      // Set initial error
      useHistoryStore.setState({ error: 'Previous error' });
      
      const mockData: HistoryData = {
        dailyStats: [],
        walks: [],
        summaryStats: {
          totalSteps: 0,
          totalWalks: 0,
          averageSteps: 0,
          daysGoalMet: 0,
          goalMetPercentage: 0,
        },
        insights: [],
      };
      
      const { setHistoryData } = useHistoryStore.getState();
      setHistoryData(mockData);
      
      const state = useHistoryStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('should set loading state to true', () => {
      const { setLoading } = useHistoryStore.getState();
      
      setLoading(true);
      
      const state = useHistoryStore.getState();
      expect(state.isLoading).toBe(true);
    });

    it('should set loading state to false', () => {
      // Set initial loading state
      useHistoryStore.setState({ isLoading: true });
      
      const { setLoading } = useHistoryStore.getState();
      setLoading(false);
      
      const state = useHistoryStore.getState();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      const { setError } = useHistoryStore.getState();
      
      setError('Failed to load data');
      
      const state = useHistoryStore.getState();
      expect(state.error).toBe('Failed to load data');
      expect(state.isLoading).toBe(false);
    });

    it('should clear error when set to null', () => {
      // Set initial error
      useHistoryStore.setState({ error: 'Previous error' });
      
      const { setError } = useHistoryStore.getState();
      setError(null);
      
      const state = useHistoryStore.getState();
      expect(state.error).toBeNull();
    });

    it('should set loading to false when error is set', () => {
      // Set initial loading state
      useHistoryStore.setState({ isLoading: true });
      
      const { setError } = useHistoryStore.getState();
      setError('Error occurred');
      
      const state = useHistoryStore.getState();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setSelectedDate', () => {
    it('should set selected date', () => {
      const { setSelectedDate } = useHistoryStore.getState();
      
      setSelectedDate('2025-10-09');
      
      const state = useHistoryStore.getState();
      expect(state.selectedDate).toBe('2025-10-09');
    });

    it('should clear selected date when set to null', () => {
      // Set initial selected date
      useHistoryStore.setState({ selectedDate: '2025-10-05' });
      
      const { setSelectedDate } = useHistoryStore.getState();
      setSelectedDate(null);
      
      const state = useHistoryStore.getState();
      expect(state.selectedDate).toBeNull();
    });
  });

  describe('clearHistoryData', () => {
    it('should clear all history data and reset state', () => {
      // Set initial state with data
      useHistoryStore.setState({
        historyData: {
          dailyStats: [],
          walks: [],
          summaryStats: {
            totalSteps: 50000,
            totalWalks: 10,
            averageSteps: 5000,
            daysGoalMet: 5,
            goalMetPercentage: 50,
          },
          insights: [],
        },
        error: 'Some error',
        isLoading: true,
        selectedDate: '2025-10-05',
      });
      
      const { clearHistoryData } = useHistoryStore.getState();
      clearHistoryData();
      
      const state = useHistoryStore.getState();
      expect(state.historyData).toBeNull();
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.selectedDate).toBeNull();
    });
  });
});

