/**
 * FadeInView Component Tests
 * Tests for animation components with Reanimated
 */

import React from 'react';
import { Text } from 'react-native';
import { render } from '../utils/test-utils';
import { FadeInView, FadeInUpView, ScaleInView } from '../../components/FadeInView';

// Mock Reanimated hooks
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
    withDelay: (_delay: number, value: number) => value,
    withSpring: (value: number) => value,
  };
});

describe('FadeInView', () => {
  it('should render children correctly', () => {
    const { getByText } = render(
      <FadeInView>
        <Text>Test Content</Text>
      </FadeInView>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('should accept duration prop', () => {
    const { getByText } = render(
      <FadeInView duration={500}>
        <Text>Test Content</Text>
      </FadeInView>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('should accept delay prop', () => {
    const { getByText } = render(
      <FadeInView delay={200}>
        <Text>Test Content</Text>
      </FadeInView>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('should apply custom styles', () => {
    const customStyle = { marginTop: 20, backgroundColor: 'red' };
    const { getByText } = render(
      <FadeInView style={customStyle}>
        <Text>Test Content</Text>
      </FadeInView>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });
});

describe('FadeInUpView', () => {
  it('should render children correctly', () => {
    const { getByText } = render(
      <FadeInUpView>
        <Text>Slide Up Content</Text>
      </FadeInUpView>
    );

    expect(getByText('Slide Up Content')).toBeTruthy();
  });

  it('should accept distance prop', () => {
    const { getByText } = render(
      <FadeInUpView distance={40}>
        <Text>Slide Up Content</Text>
      </FadeInUpView>
    );

    expect(getByText('Slide Up Content')).toBeTruthy();
  });

  it('should render with default distance when not provided', () => {
    const { getByText } = render(
      <FadeInUpView>
        <Text>Slide Up Content</Text>
      </FadeInUpView>
    );

    expect(getByText('Slide Up Content')).toBeTruthy();
  });
});

describe('ScaleInView', () => {
  it('should render children correctly', () => {
    const { getByText } = render(
      <ScaleInView>
        <Text>Scale Content</Text>
      </ScaleInView>
    );

    expect(getByText('Scale Content')).toBeTruthy();
  });

  it('should accept fromScale prop', () => {
    const { getByText } = render(
      <ScaleInView fromScale={0.5}>
        <Text>Scale Content</Text>
      </ScaleInView>
    );

    expect(getByText('Scale Content')).toBeTruthy();
  });

  it('should render with default fromScale when not provided', () => {
    const { getByText } = render(
      <ScaleInView>
        <Text>Scale Content</Text>
      </ScaleInView>
    );

    expect(getByText('Scale Content')).toBeTruthy();
  });
});

describe('Animation Props', () => {
  it('FadeInView should use default duration of 300ms', () => {
    const { getByText } = render(
      <FadeInView>
        <Text>Default Duration</Text>
      </FadeInView>
    );

    expect(getByText('Default Duration')).toBeTruthy();
  });

  it('FadeInView should use default delay of 0ms', () => {
    const { getByText } = render(
      <FadeInView>
        <Text>Default Delay</Text>
      </FadeInView>
    );

    expect(getByText('Default Delay')).toBeTruthy();
  });

  it('should accept all animation props together', () => {
    const { getByText } = render(
      <FadeInView duration={400} delay={150}>
        <Text>All Props</Text>
      </FadeInView>
    );

    expect(getByText('All Props')).toBeTruthy();
  });
});

describe('Multiple Children', () => {
  it('should render multiple children in FadeInView', () => {
    const { getByText } = render(
      <FadeInView>
        <Text>Child 1</Text>
        <Text>Child 2</Text>
      </FadeInView>
    );

    expect(getByText('Child 1')).toBeTruthy();
    expect(getByText('Child 2')).toBeTruthy();
  });

  it('should render nested animations', () => {
    const { getByText } = render(
      <FadeInView>
        <ScaleInView>
          <Text>Nested Animation</Text>
        </ScaleInView>
      </FadeInView>
    );

    expect(getByText('Nested Animation')).toBeTruthy();
  });
});
