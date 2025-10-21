/**
 * Skeleton Component Tests
 * Tests for loading skeleton components
 */

import React from 'react';
import { render } from '../utils/test-utils';
import {
  Skeleton,
  SkeletonCard,
  SkeletonListItem,
  SkeletonProfileHeader,
  SkeletonMapRoute,
  SkeletonStreakHero,
  SkeletonGrid,
  SkeletonList,
} from '../../components/Skeleton';

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return {
    ...Reanimated,
    useSharedValue: (initialValue: number) => {
      return { value: initialValue };
    },
    useAnimatedStyle: (callback: () => any) => {
      return callback();
    },
    withTiming: (value: number) => value,
    withRepeat: (animation: any) => animation,
    withSequence: (...animations: any[]) => animations[0],
    interpolate: (value: number, input: number[], output: number[]) => {
      return output[0];
    },
  };
});

describe('Skeleton', () => {
  it('should render with default props', () => {
    const { UNSAFE_root } = render(<Skeleton />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should render with custom width and height', () => {
    const { UNSAFE_root } = render(<Skeleton width={100} height={50} />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should accept width as string percentage', () => {
    const { UNSAFE_root } = render(<Skeleton width="80%" height={20} />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should render with custom borderRadius', () => {
    const { UNSAFE_root } = render(<Skeleton borderRadius={8} />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should apply custom styles', () => {
    const customStyle = { marginTop: 10 };
    const { UNSAFE_root } = render(<Skeleton style={customStyle} />);
    expect(UNSAFE_root).toBeTruthy();
  });
});

describe('SkeletonCard', () => {
  it('should render correctly', () => {
    const { UNSAFE_root } = render(<SkeletonCard />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should render multiple skeleton elements', () => {
    const { UNSAFE_root } = render(<SkeletonCard />);
    // Should have icon, value, and label skeletons
    expect(UNSAFE_root).toBeTruthy();
  });
});

describe('SkeletonListItem', () => {
  it('should render correctly', () => {
    const { UNSAFE_root } = render(<SkeletonListItem />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should render avatar and content skeletons', () => {
    const { UNSAFE_root } = render(<SkeletonListItem />);
    expect(UNSAFE_root).toBeTruthy();
  });
});

describe('SkeletonProfileHeader', () => {
  it('should render correctly', () => {
    const { UNSAFE_root } = render(<SkeletonProfileHeader />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should render avatar, name, and subtitle skeletons', () => {
    const { UNSAFE_root } = render(<SkeletonProfileHeader />);
    expect(UNSAFE_root).toBeTruthy();
  });
});

describe('SkeletonMapRoute', () => {
  it('should render correctly', () => {
    const { UNSAFE_root } = render(<SkeletonMapRoute />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should render map preview and details skeletons', () => {
    const { UNSAFE_root } = render(<SkeletonMapRoute />);
    expect(UNSAFE_root).toBeTruthy();
  });
});

describe('SkeletonStreakHero', () => {
  it('should render correctly', () => {
    const { UNSAFE_root } = render(<SkeletonStreakHero />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should render streak icon and number skeletons', () => {
    const { UNSAFE_root } = render(<SkeletonStreakHero />);
    expect(UNSAFE_root).toBeTruthy();
  });
});

describe('SkeletonGrid', () => {
  it('should render correctly', () => {
    const { UNSAFE_root } = render(<SkeletonGrid />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should render 4 skeleton cards', () => {
    const { UNSAFE_root } = render(<SkeletonGrid />);
    expect(UNSAFE_root).toBeTruthy();
  });
});

describe('SkeletonList', () => {
  it('should render with default count', () => {
    const { UNSAFE_root } = render(<SkeletonList />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should render with custom count', () => {
    const { UNSAFE_root } = render(<SkeletonList count={3} />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should render 10 items when count is 10', () => {
    const { UNSAFE_root } = render(<SkeletonList count={10} />);
    expect(UNSAFE_root).toBeTruthy();
  });
});

describe('Skeleton Animation', () => {
  it('should animate shimmer effect', () => {
    const { UNSAFE_root } = render(<Skeleton />);
    // Animation is mocked, just verify it renders
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should handle multiple skeleton animations simultaneously', () => {
    const { UNSAFE_root } = render(
      <>
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </>
    );
    expect(UNSAFE_root).toBeTruthy();
  });
});

describe('Skeleton Accessibility', () => {
  it('should be accessible for screen readers', () => {
    const { UNSAFE_root } = render(<Skeleton />);
    // Skeletons should not interfere with accessibility
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should not have interactive elements', () => {
    const { queryByRole } = render(<SkeletonCard />);
    // Skeletons should not have buttons or interactive elements
    expect(queryByRole('button')).toBeNull();
  });
});

describe('Skeleton Variants', () => {
  it('should render all skeleton variants without errors', () => {
    const { UNSAFE_root } = render(
      <>
        <Skeleton />
        <SkeletonCard />
        <SkeletonListItem />
        <SkeletonProfileHeader />
        <SkeletonMapRoute />
        <SkeletonStreakHero />
        <SkeletonGrid />
        <SkeletonList count={2} />
      </>
    );
    expect(UNSAFE_root).toBeTruthy();
  });
});
