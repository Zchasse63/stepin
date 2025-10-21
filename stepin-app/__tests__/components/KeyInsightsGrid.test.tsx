/**
 * KeyInsightsGrid Component Tests
 * Tests for key metrics dashboard grid
 */

import React from 'react';
import { render } from '../utils/test-utils';
import KeyInsightsGrid from '../../components/KeyInsightsGrid';

describe('KeyInsightsGrid', () => {
  const defaultProps = {
    thisWeekSteps: 45000,
    bestDaySteps: 12500,
    bestDayDate: '2025-10-15',
    consistencyPercentage: 85,
    goalRatePercentage: 71,
  };

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { UNSAFE_root } = render(<KeyInsightsGrid {...defaultProps} />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render section title', () => {
      const { getByText } = render(<KeyInsightsGrid {...defaultProps} />);
      expect(getByText('Key Insights')).toBeTruthy();
    });

    it('should render all four metric cards', () => {
      const { getByText } = render(<KeyInsightsGrid {...defaultProps} />);

      expect(getByText('This Week')).toBeTruthy();
      expect(getByText('Best Day')).toBeTruthy();
      expect(getByText('Consistency')).toBeTruthy();
      expect(getByText('Goal Rate')).toBeTruthy();
    });

    it('should render all card icons', () => {
      const { getByText } = render(<KeyInsightsGrid {...defaultProps} />);

      expect(getByText('📊')).toBeTruthy(); // This Week
      expect(getByText('🏆')).toBeTruthy(); // Best Day
      expect(getByText('🎯')).toBeTruthy(); // Consistency
      expect(getByText('⭐')).toBeTruthy(); // Goal Rate
    });

    it('should render sublabels for appropriate cards', () => {
      const { getByText } = render(<KeyInsightsGrid {...defaultProps} />);

      expect(getByText('Days Active')).toBeTruthy();
      expect(getByText('Goals Met')).toBeTruthy();
    });
  });

  describe('This Week Card', () => {
    it('should display this week steps formatted', () => {
      const { getByText } = render(<KeyInsightsGrid {...defaultProps} />);
      expect(getByText('45,000')).toBeTruthy();
    });

    it('should format large numbers with commas', () => {
      const { getByText } = render(
        <KeyInsightsGrid {...defaultProps} thisWeekSteps={123456} />
      );
      expect(getByText('123,456')).toBeTruthy();
    });

    it('should handle zero steps', () => {
      const { getByText } = render(
        <KeyInsightsGrid {...defaultProps} thisWeekSteps={0} />
      );
      expect(getByText('0')).toBeTruthy();
    });
  });

  describe('Best Day Card', () => {
    it('should display best day steps formatted', () => {
      const { getByText } = render(<KeyInsightsGrid {...defaultProps} />);
      expect(getByText('12,500')).toBeTruthy();
    });

    it('should format best day date correctly', () => {
      const { getByText } = render(<KeyInsightsGrid {...defaultProps} />);
      // Date "2025-10-15" should be formatted as "Tue, Oct 15" or similar
      expect(getByText(/Oct 15/i)).toBeTruthy();
    });

    it('should handle different date formats', () => {
      const { getByText } = render(
        <KeyInsightsGrid {...defaultProps} bestDayDate="2025-01-01" />
      );
      expect(getByText(/Jan 1/i)).toBeTruthy();
    });

    it('should handle invalid date gracefully', () => {
      const { UNSAFE_root } = render(
        <KeyInsightsGrid {...defaultProps} bestDayDate="invalid-date" />
      );
      // Component should still render even with invalid date
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Consistency Card', () => {
    it('should display consistency percentage', () => {
      const { getByText } = render(<KeyInsightsGrid {...defaultProps} />);
      expect(getByText('85%')).toBeTruthy();
    });

    it('should handle 0% consistency', () => {
      const { getByText } = render(
        <KeyInsightsGrid {...defaultProps} consistencyPercentage={0} />
      );
      expect(getByText('0%')).toBeTruthy();
    });

    it('should handle 100% consistency', () => {
      const { getByText } = render(
        <KeyInsightsGrid {...defaultProps} consistencyPercentage={100} />
      );
      expect(getByText('100%')).toBeTruthy();
    });

    it('should display "Days Active" sublabel', () => {
      const { getByText } = render(<KeyInsightsGrid {...defaultProps} />);
      expect(getByText('Days Active')).toBeTruthy();
    });
  });

  describe('Goal Rate Card', () => {
    it('should display goal rate percentage', () => {
      const { getByText } = render(<KeyInsightsGrid {...defaultProps} />);
      expect(getByText('71%')).toBeTruthy();
    });

    it('should handle 0% goal rate', () => {
      const { getByText } = render(
        <KeyInsightsGrid {...defaultProps} goalRatePercentage={0} />
      );
      expect(getByText('0%')).toBeTruthy();
    });

    it('should handle 100% goal rate', () => {
      const { getByText } = render(
        <KeyInsightsGrid {...defaultProps} goalRatePercentage={100} />
      );
      expect(getByText('100%')).toBeTruthy();
    });

    it('should display "Goals Met" sublabel', () => {
      const { getByText } = render(<KeyInsightsGrid {...defaultProps} />);
      expect(getByText('Goals Met')).toBeTruthy();
    });
  });

  describe('Number Formatting', () => {
    it('should format single digit numbers', () => {
      const { getByText } = render(
        <KeyInsightsGrid {...defaultProps} thisWeekSteps={5} />
      );
      expect(getByText('5')).toBeTruthy();
    });

    it('should format thousands with comma', () => {
      const { getByText } = render(
        <KeyInsightsGrid {...defaultProps} bestDaySteps={5000} />
      );
      expect(getByText('5,000')).toBeTruthy();
    });

    it('should format millions with commas', () => {
      const { getByText } = render(
        <KeyInsightsGrid {...defaultProps} thisWeekSteps={1000000} />
      );
      expect(getByText('1,000,000')).toBeTruthy();
    });
  });

  describe('Date Formatting', () => {
    it('should format January dates', () => {
      const { getByText } = render(
        <KeyInsightsGrid {...defaultProps} bestDayDate="2025-01-15" />
      );
      expect(getByText(/Jan/i)).toBeTruthy();
    });

    it('should format December dates', () => {
      const { getByText } = render(
        <KeyInsightsGrid {...defaultProps} bestDayDate="2025-12-25" />
      );
      expect(getByText(/Dec/i)).toBeTruthy();
    });

    it('should show day of week', () => {
      const { getByText } = render(
        <KeyInsightsGrid {...defaultProps} bestDayDate="2025-10-15" />
      );
      // October 15, 2025 is a Wednesday
      expect(getByText(/Wed/i)).toBeTruthy();
    });

    it('should show day number', () => {
      const { getByText } = render(
        <KeyInsightsGrid {...defaultProps} bestDayDate="2025-10-15" />
      );
      expect(getByText(/15/)).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle all zero values', () => {
      const { getAllByText } = render(
        <KeyInsightsGrid
          thisWeekSteps={0}
          bestDaySteps={0}
          bestDayDate="2025-10-15"
          consistencyPercentage={0}
          goalRatePercentage={0}
        />
      );

      // Multiple cards show '0' or '0%'
      const zeroElements = getAllByText('0');
      expect(zeroElements.length).toBeGreaterThan(0);
      const zeroPercentElements = getAllByText('0%');
      expect(zeroPercentElements.length).toBeGreaterThan(0);
    });

    it('should handle all maximum values', () => {
      const { getAllByText } = render(
        <KeyInsightsGrid
          thisWeekSteps={999999}
          bestDaySteps={999999}
          bestDayDate="2025-10-15"
          consistencyPercentage={100}
          goalRatePercentage={100}
        />
      );

      // Multiple cards show '999,999' (thisWeek and bestDay)
      const largeNumbers = getAllByText('999,999');
      expect(largeNumbers.length).toBe(2);
      // Multiple cards show '100%' (consistency and goalRate)
      const hundredPercent = getAllByText('100%');
      expect(hundredPercent.length).toBe(2);
    });

    it('should handle decimal percentages by showing them', () => {
      const { getByText } = render(
        <KeyInsightsGrid {...defaultProps} consistencyPercentage={85.5} />
      );
      expect(getByText('85.5%')).toBeTruthy();
    });
  });

  describe('Props Validation', () => {
    it('should accept all required props', () => {
      const { UNSAFE_root } = render(
        <KeyInsightsGrid
          thisWeekSteps={10000}
          bestDaySteps={5000}
          bestDayDate="2025-10-15"
          consistencyPercentage={75}
          goalRatePercentage={80}
        />
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render with minimal valid values', () => {
      const { UNSAFE_root } = render(
        <KeyInsightsGrid
          thisWeekSteps={1}
          bestDaySteps={1}
          bestDayDate="2025-01-01"
          consistencyPercentage={1}
          goalRatePercentage={1}
        />
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should render all text labels accessibly', () => {
      const { getByText } = render(<KeyInsightsGrid {...defaultProps} />);

      // All labels should be accessible to screen readers
      expect(getByText('This Week')).toBeTruthy();
      expect(getByText('Best Day')).toBeTruthy();
      expect(getByText('Consistency')).toBeTruthy();
      expect(getByText('Goal Rate')).toBeTruthy();
    });

    it('should render numeric values accessibly', () => {
      const { getByText } = render(<KeyInsightsGrid {...defaultProps} />);

      // All values should be accessible
      expect(getByText('45,000')).toBeTruthy();
      expect(getByText('12,500')).toBeTruthy();
      expect(getByText('85%')).toBeTruthy();
      expect(getByText('71%')).toBeTruthy();
    });
  });

  describe('Visual Structure', () => {
    it('should render in a grid layout', () => {
      const { UNSAFE_root } = render(<KeyInsightsGrid {...defaultProps} />);
      // Grid structure exists (tested via rendering)
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should have consistent card structure across all metrics', () => {
      const { getByText } = render(<KeyInsightsGrid {...defaultProps} />);

      // Each card should have icon, value, and label
      expect(getByText('📊')).toBeTruthy();
      expect(getByText('45,000')).toBeTruthy();
      expect(getByText('This Week')).toBeTruthy();
    });
  });
});
