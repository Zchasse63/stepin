# Testing Guide - Stepin Walking App
## React Native Testing Library (RNTL) Implementation

---

## Overview

This guide covers the testing infrastructure for the Stepin app using React Native Testing Library (RNTL), Jest, and best practices for testing React Native components.

**Test Framework**: Jest 30.x
**Testing Library**: @testing-library/react-native 13.x
**Test Environment**: Node with Expo preset

---

## Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- __tests__/components/FadeInView.test.tsx

# Run specific test suite
npm test -- --testNamePattern="ActivityVisibilityModal"
```

---

## Test Structure

### Directory Organization

```
stepin-app/
├── __tests__/
│   ├── components/         # Component tests
│   │   ├── FadeInView.test.tsx
│   │   ├── Skeleton.test.tsx
│   │   ├── ActivityVisibilityModal.test.tsx
│   │   └── StreakHero.test.tsx
│   ├── lib/                # Utility function tests
│   │   └── map-utils.test.ts
│   └── utils/              # Test utilities and helpers
│       └── test-utils.tsx
├── jest.config.js          # Jest configuration
├── jest-setup.ts           # Global test setup and mocks
└── __mocks__/              # Manual mocks for assets
    ├── fileMock.js
    └── styleMock.js
```

---

## Configuration Files

### jest.config.js

Key configuration options:

```javascript
{
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  testEnvironment: 'node',
  transformIgnorePatterns: [/* modules to transform */],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',  // Path alias support
  },
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
}
```

### jest-setup.ts

Global mocks and test environment setup:

- **Expo modules**: Router, Haptics, Location, Secure Store
- **React Native Reanimated**: Animation mocks
- **Mapbox**: Map component mocks
- **HealthKit**: Health data mocks
- **Supabase**: Database client mocks
- **Zustand**: State management mocks

---

## Writing Tests

### Basic Component Test

```typescript
import { render } from '../utils/test-utils';
import MyComponent from '../../components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    const { getByText } = render(<MyComponent />);
    expect(getByText('Hello')).toBeTruthy();
  });
});
```

### Testing User Interactions

```typescript
import { render, fireEvent } from '../utils/test-utils';

it('should call onPress when button is pressed', () => {
  const mockOnPress = jest.fn();
  const { getByText } = render(<Button onPress={mockOnPress} />);

  fireEvent.press(getByText('Submit'));

  expect(mockOnPress).toHaveBeenCalledTimes(1);
});
```

### Testing Async Behavior

```typescript
import { render, waitFor } from '../utils/test-utils';

it('should display data after loading', async () => {
  const { getByText } = render(<DataComponent />);

  await waitFor(() => {
    expect(getByText('Loaded Data')).toBeTruthy();
  }, { timeout: 3000 });
});
```

### Testing with Props

```typescript
it('should display custom visibility level', () => {
  const { getByText } = render(
    <ActivityVisibilityModal
      visible={true}
      currentVisibility="private"
      onClose={jest.fn()}
      onSave={jest.fn()}
    />
  );

  expect(getByText('Private')).toBeTruthy();
});
```

---

## Test Utilities

### Custom Render Function

Located in `__tests__/utils/test-utils.tsx`:

```typescript
import { render, RenderOptions } from '@testing-library/react-native';
import { ThemeProvider } from '../../lib/theme/themeManager';

const AllTheProviders = ({ children }) => {
  return <ThemeProvider>{children}</ThemeProvider>;
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export { customRender as render };
```

**Benefits:**
- Wraps components with necessary providers
- Ensures consistent theme context
- Simplifies test setup

### Mock Data Generators

```typescript
import { mockWalk, mockProfile, mockPrivacyZone } from '../utils/test-utils';

const testWalk = mockWalk({ steps: 10000, distance_meters: 8000 });
const testProfile = mockProfile({ daily_goal: 8000 });
const testZone = mockPrivacyZone({ radius_meters: 500 });
```

---

## Testing Patterns

### 1. Testing Animations

Animations use React Native Reanimated, which is mocked in `jest-setup.ts`:

```typescript
describe('FadeInView', () => {
  it('should render children correctly', () => {
    const { getByText } = render(
      <FadeInView>
        <Text>Animated Content</Text>
      </FadeInView>
    );

    expect(getByText('Animated Content')).toBeTruthy();
  });
});
```

**Note**: Animation values are mocked, so you can't test actual animation behavior, only that components render.

### 2. Testing Modals

```typescript
it('should render when visible is true', () => {
  const { getByText } = render(
    <MyModal visible={true} onClose={jest.fn()} />
  );

  expect(getByText('Modal Content')).toBeTruthy();
});

it('should not render content when visible is false', () => {
  const { queryByText } = render(
    <MyModal visible={false} onClose={jest.fn()} />
  );

  expect(queryByText('Modal Content')).toBeNull();
});
```

### 3. Testing Form Inputs

```typescript
import { fireEvent } from '../utils/test-utils';

it('should update selection when option is pressed', () => {
  const { getByText } = render(<VisibilityPicker />);

  const publicOption = getByText('Public');
  fireEvent.press(publicOption);

  // Verify selection updated
  expect(publicOption).toBeTruthy();
});
```

### 4. Testing Accessibility

```typescript
it('should have accessible labels', () => {
  const { getByText, getByLabelText } = render(<MyForm />);

  expect(getByLabelText('Email Address')).toBeTruthy();
  expect(getByText('Submit')).toBeTruthy();
});
```

### 5. Testing Error States

```typescript
it('should handle save errors gracefully', async () => {
  const mockErrorSave = jest.fn(() => Promise.reject(new Error('Save failed')));

  const { getByText } = render(
    <MyForm onSave={mockErrorSave} />
  );

  fireEvent.press(getByText('Save'));

  await waitFor(() => {
    expect(mockErrorSave).toHaveBeenCalled();
  });
});
```

---

## Testing Geographic Functions

### Haversine Distance

```typescript
describe('calculateDistance', () => {
  it('should calculate distance between two points correctly', () => {
    const sanFrancisco = { lat: 37.7749, lng: -122.4194 };
    const losAngeles = { lat: 34.0522, lng: -118.2437 };

    const distance = calculateDistance(
      sanFrancisco.lat,
      sanFrancisco.lng,
      losAngeles.lat,
      losAngeles.lng
    );

    // SF to LA is ~559 km
    expect(distance).toBeGreaterThan(550000);
    expect(distance).toBeLessThan(565000);
  });

  it('should return 0 for same coordinates', () => {
    const distance = calculateDistance(37.7749, -122.4194, 37.7749, -122.4194);
    expect(distance).toBe(0);
  });
});
```

### Privacy Zone Detection

```typescript
describe('isInPrivacyZone', () => {
  const homeZone = {
    id: '1',
    name: 'Home',
    latitude: 37.7749,
    longitude: -122.4194,
    radius_meters: 250,
  };

  it('should return true for coordinate inside privacy zone', () => {
    const coord = { lat: 37.7749, lng: -122.4194 };
    expect(isInPrivacyZone(coord, [homeZone])).toBe(true);
  });

  it('should return false for coordinate outside privacy zone', () => {
    const coord = { lat: 37.8049, lng: -122.4394 };
    expect(isInPrivacyZone(coord, [homeZone])).toBe(false);
  });
});
```

---

## Mocking Strategies

### Mocking Supabase

```typescript
// In your test file
const mockSupabaseFrom = jest.fn(() => ({
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(() =>
    Promise.resolve({
      data: { user_id: 'test-user', current_streak: 5 },
      error: null,
    })
  ),
}));

jest.mock('../../lib/supabase/client', () => ({
  supabase: {
    from: mockSupabaseFrom,
    auth: { /* auth mocks */ },
  },
}));
```

### Mocking Zustand Stores

```typescript
jest.mock('../../lib/store/authStore', () => ({
  useAuthStore: (selector) => {
    const state = {
      user: mockUser,
      signIn: jest.fn(),
      signOut: jest.fn(),
    };
    return selector(state);
  },
}));
```

### Mocking Navigation

Already mocked in `jest-setup.ts`:

```typescript
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}));
```

---

## Coverage Reports

### Viewing Coverage

```bash
npm run test:coverage
```

Coverage reports are generated in:
- **HTML**: `coverage/lcov-report/index.html` (open in browser)
- **Text**: Console output
- **LCOV**: `coverage/lcov.info` (for CI tools)

### Coverage Thresholds

Configured in `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 50,
    functions: 50,
    lines: 50,
    statements: 50,
  },
}
```

### Improving Coverage

Focus on:
1. **Critical paths**: User journeys, data mutations
2. **Edge cases**: Error states, empty data, boundary conditions
3. **Accessibility**: Screen reader announcements, keyboard navigation
4. **Business logic**: Privacy filtering, streak calculations, distance calculations

---

## Common Issues & Solutions

### Issue: "Cannot find module 'expo-*'"

**Solution**: Add mock to `jest-setup.ts`:

```typescript
jest.mock('expo-module-name', () => ({
  functionName: jest.fn(),
}));
```

### Issue: "ReferenceError: You are trying to import a file outside of the scope"

**Solution**: Don't call functions from outside jest.mock(). Define mocks inline:

```typescript
// ❌ Bad
jest.mock('module', () => ({ thing: externalFunction() }));

// ✅ Good
jest.mock('module', () => ({ thing: jest.fn() }));
```

### Issue: "Animated: useNativeDriver is not supported"

**Solution**: Already handled in `jest-setup.ts` with Reanimated mock.

### Issue: Component returns null during tests

**Solution**: Component may have conditional rendering. Mock data or props to ensure visibility:

```typescript
// Component only renders when streak > 0
const mockSupabaseData = { current_streak: 5, longest_streak: 10 };
```

### Issue: "Unable to find an element"

**Solutions**:
1. Use `queryBy*` instead of `getBy*` for elements that might not exist
2. Use `waitFor()` for async rendering
3. Increase timeout: `waitFor(() => {...}, { timeout: 3000 })`
4. Debug with `debug()`: `const { debug } = render(<Component />); debug();`

---

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ❌ Bad: Testing implementation details
expect(component.state.loading).toBe(false);

// ✅ Good: Testing user-visible behavior
expect(getByText('Loaded Data')).toBeTruthy();
```

### 2. Use Accessible Queries

Priority order:
1. `getByRole` - Best for accessibility
2. `getByLabelText` - For form inputs
3. `getByText` - For content
4. `getByTestId` - Last resort

```typescript
// ✅ Accessible query
const button = getByRole('button', { name: 'Submit' });

// ⚠️ Less ideal
const button = getByTestId('submit-button');
```

### 3. Avoid Testing Library Internals

```typescript
// ❌ Bad
expect(component.props.onPress).toBeDefined();

// ✅ Good
fireEvent.press(getByText('Button'));
expect(mockHandler).toHaveBeenCalled();
```

### 4. Keep Tests Isolated

```typescript
beforeEach(() => {
  jest.clearAllMocks(); // Reset mocks between tests
});
```

### 5. Test Error Boundaries

```typescript
it('should handle rendering errors gracefully', () => {
  const ThrowError = () => { throw new Error('Test error'); };

  // Use error boundary wrapper
  const { getByText } = render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(getByText('Something went wrong')).toBeTruthy();
});
```

---

## Test Coverage Summary

### Current Test Files (105 tests passing)

| File | Tests | Coverage |
|------|-------|----------|
| `map-utils.test.ts` | 27 | Utility functions |
| `FadeInView.test.tsx` | 15 | Animation components |
| `Skeleton.test.tsx` | 25 | Loading states |
| `ActivityVisibilityModal.test.tsx` | 19 | Privacy UI |
| `StreakHero.test.tsx` | 18 | Gamification |

### Areas Covered

✅ Geographic calculations (Haversine, GeoJSON)
✅ Privacy zone detection
✅ Route segmentation
✅ Animation components
✅ Loading skeletons
✅ Modal interactions
✅ Form handling
✅ Accessibility features

### Next Steps for Testing

- [ ] Test KeyInsightsGrid component
- [ ] Test LifetimeMilestones component
- [ ] Test MapView component
- [ ] Integration tests for critical user flows
- [ ] E2E tests using Maestro (already configured)

---

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## Resources

- [React Native Testing Library Docs](https://callstack.github.io/react-native-testing-library/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
- [Expo Testing Guide](https://docs.expo.dev/guides/testing/)

---

**Document Version**: 1.0
**Last Updated**: October 21, 2025
**Maintained By**: Stepin Development Team
