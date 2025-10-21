/**
 * LifetimeMilestones Component Tests
 * Tests for lifetime achievement display
 */

import React from 'react';
import { render } from '../utils/test-utils';
import LifetimeMilestones from '../../components/LifetimeMilestones';
import { StepMilestones } from '../../constants/App';

describe('LifetimeMilestones', () => {
  const defaultProps = {
    totalSteps: 50000,
    totalWalks: 45,
  };

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { UNSAFE_root } = render(<LifetimeMilestones {...defaultProps} />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render section title', () => {
      const { getByText } = render(<LifetimeMilestones {...defaultProps} />);
      expect(getByText('Lifetime Achievements')).toBeTruthy();
    });

    it('should render Total Steps card', () => {
      const { getByText } = render(<LifetimeMilestones {...defaultProps} />);
      expect(getByText('Total Steps')).toBeTruthy();
      expect(getByText('50,000')).toBeTruthy();
    });

    it('should render Total Walks card', () => {
      const { getByText } = render(<LifetimeMilestones {...defaultProps} />);
      expect(getByText('Total Walks')).toBeTruthy();
      expect(getByText('45')).toBeTruthy();
    });

    it('should render milestone icons', () => {
      const { getByText } = render(<LifetimeMilestones {...defaultProps} />);
      expect(getByText('👣')).toBeTruthy(); // Steps icon
      expect(getByText('🚶')).toBeTruthy(); // Walks icon
    });
  });

  describe('Total Steps Display', () => {
    it('should format steps with commas', () => {
      const { getByText } = render(
        <LifetimeMilestones totalSteps={123456} totalWalks={50} />
      );
      expect(getByText('123,456')).toBeTruthy();
    });

    it('should display zero steps', () => {
      const { getAllByText } = render(
        <LifetimeMilestones totalSteps={0} totalWalks={0} />
      );
      // Both cards show '0'
      const zeros = getAllByText('0');
      expect(zeros.length).toBe(2);
    });

    it('should display single digit steps', () => {
      const { getByText } = render(
        <LifetimeMilestones totalSteps={5} totalWalks={1} />
      );
      expect(getByText('5')).toBeTruthy();
    });

    it('should display million+ steps with commas', () => {
      const { getByText } = render(
        <LifetimeMilestones totalSteps={1234567} totalWalks={500} />
      );
      expect(getByText('1,234,567')).toBeTruthy();
    });
  });

  describe('Total Walks Display', () => {
    it('should display walks without commas for small numbers', () => {
      const { getByText } = render(
        <LifetimeMilestones totalSteps={10000} totalWalks={99} />
      );
      expect(getByText('99')).toBeTruthy();
    });

    it('should format large walk counts with commas', () => {
      const { getByText } = render(
        <LifetimeMilestones totalSteps={500000} totalWalks={1234} />
      );
      expect(getByText('1,234')).toBeTruthy();
    });

    it('should display zero walks', () => {
      const { getAllByText } = render(
        <LifetimeMilestones totalSteps={0} totalWalks={0} />
      );
      const zeros = getAllByText('0');
      expect(zeros.length).toBeGreaterThan(0);
    });
  });

  describe('Step Milestones', () => {
    it('should show motivation for Bronze milestone (100k)', () => {
      const { getByText } = render(
        <LifetimeMilestones totalSteps={95000} totalWalks={50} />
      );
      // Within 10k threshold, should show motivation
      expect(getByText(/Only.*more to Bronze.*🎯/i)).toBeTruthy();
    });

    it('should show motivation for Silver milestone (250k)', () => {
      const { getByText } = render(
        <LifetimeMilestones totalSteps={245000} totalWalks={50} />
      );
      expect(getByText(/Only.*more to Silver/i)).toBeTruthy();
    });

    it('should show motivation for Gold milestone (500k)', () => {
      const { getByText } = render(
        <LifetimeMilestones totalSteps={495000} totalWalks={50} />
      );
      expect(getByText(/Only.*more to Gold/i)).toBeTruthy();
    });

    it('should show motivation for Platinum milestone (1M)', () => {
      const { getByText } = render(
        <LifetimeMilestones totalSteps={995000} totalWalks={50} />
      );
      expect(getByText(/Only.*more to Platinum/i)).toBeTruthy();
    });

    it('should not show motivation when far from milestone', () => {
      const { queryByText } = render(
        <LifetimeMilestones totalSteps={50000} totalWalks={50} />
      );
      // 50k steps to Bronze (100k) - outside threshold
      expect(queryByText(/Only.*more to Bronze/i)).toBeNull();
    });

    it('should not show motivation when all milestones achieved', () => {
      const { queryByText } = render(
        <LifetimeMilestones totalSteps={2000000} totalWalks={500} />
      );
      // Beyond all milestones
      expect(queryByText(/Only.*more to/i)).toBeNull();
    });

    it('should calculate correct steps to Bronze', () => {
      const { getByText } = render(
        <LifetimeMilestones totalSteps={95000} totalWalks={50} />
      );
      // 100,000 - 95,000 = 5,000
      expect(getByText(/Only 5,000 more/i)).toBeTruthy();
    });

    it('should calculate correct steps to Silver', () => {
      const { getByText } = render(
        <LifetimeMilestones totalSteps={248000} totalWalks={50} />
      );
      // 250,000 - 248,000 = 2,000
      expect(getByText(/Only 2,000 more/i)).toBeTruthy();
    });
  });

  describe('Walk Milestones', () => {
    it('should show motivation for next hundred walks when close', () => {
      const { getByText } = render(
        <LifetimeMilestones totalSteps={50000} totalWalks={95} />
      );
      // Next milestone is 100, within 10 walks
      expect(getByText(/Only 5 more to 100.*🎉/i)).toBeTruthy();
    });

    it('should show motivation for 200 walks', () => {
      const { getByText } = render(
        <LifetimeMilestones totalSteps={50000} totalWalks={195} />
      );
      expect(getByText(/Only 5 more to 200/i)).toBeTruthy();
    });

    it('should show motivation for 500 walks', () => {
      const { getByText } = render(
        <LifetimeMilestones totalSteps={50000} totalWalks={498} />
      );
      expect(getByText(/Only 2 more to 500/i)).toBeTruthy();
    });

    it('should not show motivation when far from next hundred', () => {
      const { queryByText } = render(
        <LifetimeMilestones totalSteps={50000} totalWalks={45} />
      );
      // 55 walks to 100 - outside threshold
      expect(queryByText(/Only.*more to 100/i)).toBeNull();
    });

    it('should calculate next milestone correctly at zero', () => {
      const { queryByText } = render(
        <LifetimeMilestones totalSteps={0} totalWalks={0} />
      );
      // At 0 walks, next milestone is 100 (too far to show)
      expect(queryByText(/Only.*more to/i)).toBeNull();
    });

    it('should calculate next milestone correctly at 100', () => {
      const { queryByText } = render(
        <LifetimeMilestones totalSteps={100000} totalWalks={100} />
      );
      // At exactly 100, next is 200 (too far to show)
      expect(queryByText(/Only.*more to/i)).toBeNull();
    });
  });

  describe('Motivation Thresholds', () => {
    it('should show steps motivation within 10,000 steps', () => {
      const { getByText } = render(
        <LifetimeMilestones totalSteps={StepMilestones.BRONZE - 9999} totalWalks={50} />
      );
      expect(getByText(/Only.*more to Bronze/i)).toBeTruthy();
    });

    it('should not show steps motivation beyond 10,000 steps', () => {
      const { queryByText } = render(
        <LifetimeMilestones totalSteps={StepMilestones.BRONZE - 10001} totalWalks={50} />
      );
      expect(queryByText(/Only.*more to Bronze/i)).toBeNull();
    });

    it('should show walks motivation within 10 walks', () => {
      const { getByText } = render(
        <LifetimeMilestones totalSteps={50000} totalWalks={91} />
      );
      // 9 walks to 100
      expect(getByText(/Only 9 more to 100/i)).toBeTruthy();
    });

    it('should not show walks motivation beyond 10 walks', () => {
      const { queryByText } = render(
        <LifetimeMilestones totalSteps={50000} totalWalks={89} />
      );
      // 11 walks to 100
      expect(queryByText(/Only.*more to 100/i)).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle exactly at Bronze milestone', () => {
      const { queryByText } = render(
        <LifetimeMilestones totalSteps={StepMilestones.BRONZE} totalWalks={50} />
      );
      // At exactly 100k, next milestone is Silver
      // Too far to show motivation
      expect(queryByText(/Only.*more to Bronze/i)).toBeNull();
    });

    it('should handle exactly at Platinum milestone', () => {
      const { queryByText } = render(
        <LifetimeMilestones totalSteps={StepMilestones.PLATINUM} totalWalks={50} />
      );
      // Beyond all milestones
      expect(queryByText(/Only.*more to/i)).toBeNull();
    });

    it('should handle both motivations showing simultaneously', () => {
      const { getByText } = render(
        <LifetimeMilestones totalSteps={95000} totalWalks={95} />
      );
      // Both should show
      expect(getByText(/Only.*more to Bronze/i)).toBeTruthy();
      expect(getByText(/Only.*more to 100/i)).toBeTruthy();
    });

    it('should handle neither motivation showing', () => {
      const { queryByText } = render(
        <LifetimeMilestones totalSteps={50000} totalWalks={50} />
      );
      // Neither should show
      expect(queryByText(/Only.*more to/i)).toBeNull();
    });

    it('should handle very large numbers', () => {
      const { getByText } = render(
        <LifetimeMilestones totalSteps={10000000} totalWalks={5000} />
      );
      expect(getByText('10,000,000')).toBeTruthy();
      expect(getByText('5,000')).toBeTruthy();
    });
  });

  describe('Milestone Names', () => {
    it('should use correct milestone name for each tier', () => {
      const bronzeProps = { totalSteps: 95000, totalWalks: 50 };
      const { getByText: getBronze } = render(<LifetimeMilestones {...bronzeProps} />);
      expect(getBronze(/Bronze/i)).toBeTruthy();

      const silverProps = { totalSteps: 245000, totalWalks: 50 };
      const { getByText: getSilver } = render(<LifetimeMilestones {...silverProps} />);
      expect(getSilver(/Silver/i)).toBeTruthy();

      const goldProps = { totalSteps: 495000, totalWalks: 50 };
      const { getByText: getGold } = render(<LifetimeMilestones {...goldProps} />);
      expect(getGold(/Gold/i)).toBeTruthy();

      const platinumProps = { totalSteps: 995000, totalWalks: 50 };
      const { getByText: getPlatinum } = render(<LifetimeMilestones {...platinumProps} />);
      expect(getPlatinum(/Platinum/i)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should render all text accessibly', () => {
      const { getByText } = render(<LifetimeMilestones {...defaultProps} />);

      expect(getByText('Lifetime Achievements')).toBeTruthy();
      expect(getByText('Total Steps')).toBeTruthy();
      expect(getByText('Total Walks')).toBeTruthy();
      expect(getByText('50,000')).toBeTruthy();
      expect(getByText('45')).toBeTruthy();
    });

    it('should render motivation messages accessibly', () => {
      const { getByText } = render(
        <LifetimeMilestones totalSteps={95000} totalWalks={95} />
      );

      // Both motivation messages should be accessible
      expect(getByText(/Only.*more to Bronze/i)).toBeTruthy();
      expect(getByText(/Only.*more to 100/i)).toBeTruthy();
    });
  });

  describe('Props Validation', () => {
    it('should accept all required props', () => {
      const { UNSAFE_root } = render(
        <LifetimeMilestones totalSteps={100} totalWalks={10} />
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should handle zero values', () => {
      const { UNSAFE_root } = render(
        <LifetimeMilestones totalSteps={0} totalWalks={0} />
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should handle very large values', () => {
      const { UNSAFE_root } = render(
        <LifetimeMilestones totalSteps={999999999} totalWalks={99999} />
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Visual Structure', () => {
    it('should render two milestone cards', () => {
      const { getByText } = render(<LifetimeMilestones {...defaultProps} />);

      // Both cards should be present
      expect(getByText('Total Steps')).toBeTruthy();
      expect(getByText('Total Walks')).toBeTruthy();
    });

    it('should show motivation banners when applicable', () => {
      const { getByText } = render(
        <LifetimeMilestones totalSteps={95000} totalWalks={95} />
      );

      // Both motivation banners should render with emojis
      expect(getByText(/Only.*more to Bronze.*🎯/i)).toBeTruthy();
      expect(getByText(/Only.*more to 100.*🎉/i)).toBeTruthy();
    });
  });
});
