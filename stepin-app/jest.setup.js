// Jest setup file for React Native + Expo testing
// Note: @testing-library/react-native v12.4+ includes matchers by default

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  }),
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  },
  useSegments: () => [],
  usePathname: () => '/',
  Redirect: ({ href }) => `Redirected to ${href}`,
  Link: ({ href, children }) => children,
  Stack: {
    Screen: () => null,
  },
  Tabs: {
    Screen: () => null,
  },
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock @supabase/supabase-js
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    })),
  })),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      supabaseUrl: 'https://test.supabase.co',
      supabaseAnonKey: 'test-anon-key',
    },
  },
}));

// Mock @sentry/react-native
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setUser: jest.fn(),
  setContext: jest.fn(),
  setTag: jest.fn(),
  setTags: jest.fn(),
  setExtra: jest.fn(),
  withScope: jest.fn((callback) => callback({ setTag: jest.fn(), setContext: jest.fn() })),
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(),
    Directions: {},
  };
});

// Mock @rnmapbox/maps
jest.mock('@rnmapbox/maps', () => ({
  MapView: 'MapView',
  Camera: 'Camera',
  UserLocation: 'UserLocation',
  ShapeSource: 'ShapeSource',
  LineLayer: 'LineLayer',
  setAccessToken: jest.fn(),
}));

// Mock @kingstinct/react-native-healthkit
jest.mock('@kingstinct/react-native-healthkit', () => ({
  isHealthDataAvailable: jest.fn(() => Promise.resolve(true)),
  requestAuthorization: jest.fn(() => Promise.resolve(true)),
  queryQuantitySamples: jest.fn(() => Promise.resolve([])),
}));

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
  deviceType: 2,
  modelName: 'iPhone 14 Pro',
}));

// Mock theme manager with complete color palette
jest.mock('@/lib/theme/themeManager', () => ({
  useTheme: jest.fn(() => ({
    theme: 'light',
    themePreference: 'system',
    setThemePreference: jest.fn(),
    colors: {
      primary: {
        light: '#A8E6CF',
        main: '#4CAF50',
        dark: '#2E7D32',
      },
      secondary: {
        light: '#B3E5FC',
        main: '#03A9F4',
        dark: '#0277BD',
      },
      accent: {
        gold: '#FFD700',
        gray: '#9E9E9E',
        warning: '#FF9800',
      },
      surface: {
        card: '#FFFFFF',
        elevated: '#F5F5F5',
      },
      background: {
        primary: '#FFFFFF',
        secondary: '#F5F5F5',
        tertiary: '#FAFAFA',
      },
      text: {
        primary: '#000000',
        secondary: '#757575',
        disabled: '#BDBDBD',
        inverse: '#FFFFFF',
      },
      status: {
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        info: '#2196F3',
      },
      border: {
        light: '#E0E0E0',
        main: '#BDBDBD',
        dark: '#9E9E9E',
      },
      system: {
        blue: '#007AFF',
        green: '#34C759',
        indigo: '#5856D6',
        orange: '#FF9500',
        pink: '#FF2D55',
        purple: '#AF52DE',
        red: '#FF3B30',
        teal: '#5AC8FA',
        yellow: '#FFCC00',
        gray: '#8E8E93',
        gray2: '#AEAEB2',
        gray3: '#C7C7CC',
        gray4: '#D1D1D6',
        gray5: '#E5E5EA',
        gray6: '#F2F2F7',
      },
    },
  })),
  ThemeProvider: ({ children }) => children,
}));

// Silence console warnings during tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock Date.now() for consistent testing
const MOCK_DATE = new Date('2025-10-09T12:00:00.000Z');
global.Date.now = jest.fn(() => MOCK_DATE.getTime());

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

