/**
 * Unit tests for authStore
 * Tests authentication state management and actions
 */

import { useAuthStore } from '../authStore';
import { supabase } from '../../supabase/client';

// Mock Supabase client
jest.mock('../../supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}));

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      session: null,
      loading: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('signIn', () => {
    it('should successfully sign in with valid credentials', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { access_token: 'token-123', user: mockUser };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { signIn } = useAuthStore.getState();
      await signIn('test@example.com', 'password123');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.session).toEqual(mockSession);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set loading to true during sign in', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            const state = useAuthStore.getState();
            expect(state.loading).toBe(true);
            resolve({ data: { user: null, session: null }, error: null });
          })
      );

      const { signIn } = useAuthStore.getState();
      await signIn('test@example.com', 'password123');
    });

    it('should handle sign in error', async () => {
      const mockError = { message: 'Invalid credentials', code: 'invalid_credentials' };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const { signIn } = useAuthStore.getState();

      await expect(signIn('test@example.com', 'wrongpassword')).rejects.toEqual(mockError);

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Invalid credentials');
    });

    it('should clear previous error on new sign in attempt', async () => {
      // Set initial error state
      useAuthStore.setState({ error: 'Previous error' });

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123' }, session: { access_token: 'token' } },
        error: null,
      });

      const { signIn } = useAuthStore.getState();
      await signIn('test@example.com', 'password123');

      const state = useAuthStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('signUp', () => {
    it('should successfully sign up with valid data', async () => {
      const mockUser = { id: 'user-456', email: 'newuser@example.com' };
      const mockSession = { access_token: 'token-456', user: mockUser };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { signUp } = useAuthStore.getState();
      await signUp('newuser@example.com', 'password123', 'New User');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.session).toEqual(mockSession);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should include display name in sign up options', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-456' }, session: null },
        error: null,
      });

      const { signUp } = useAuthStore.getState();
      await signUp('newuser@example.com', 'password123', 'Test User');

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        options: {
          data: {
            display_name: 'Test User',
          },
        },
      });
    });

    it('should handle sign up error', async () => {
      const mockError = { message: 'Email already exists', code: 'email_exists' };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const { signUp } = useAuthStore.getState();

      await expect(
        signUp('existing@example.com', 'password123', 'Test User')
      ).rejects.toEqual(mockError);

      const state = useAuthStore.getState();
      expect(state.error).toBe('Email already exists');
      expect(state.loading).toBe(false);
    });
  });

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      // Set initial authenticated state
      useAuthStore.setState({
        user: { id: 'user-123', email: 'test@example.com' } as any,
        session: { access_token: 'token-123' } as any,
      });

      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      const { signOut } = useAuthStore.getState();
      await signOut();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle sign out error', async () => {
      const mockError = { message: 'Sign out failed' };

      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: mockError,
      });

      const { signOut } = useAuthStore.getState();

      await expect(signOut()).rejects.toEqual(mockError);

      const state = useAuthStore.getState();
      expect(state.error).toBe('Sign out failed');
      expect(state.loading).toBe(false);
    });
  });

  describe('checkSession', () => {
    it('should restore session if valid session exists', async () => {
      const mockUser = { id: 'user-789', email: 'test@example.com' };
      const mockSession = { access_token: 'token-789', user: mockUser };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { checkSession } = useAuthStore.getState();
      await checkSession();

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.session).toEqual(mockSession);
      expect(state.loading).toBe(false);
    });

    it('should clear state if no session exists', async () => {
      // Set initial authenticated state
      useAuthStore.setState({
        user: { id: 'user-123' } as any,
        session: { access_token: 'token' } as any,
      });

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const { checkSession } = useAuthStore.getState();
      await checkSession();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
    });

    it('should handle session check error', async () => {
      const mockError = { message: 'Session check failed' };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: mockError,
      });

      const { checkSession } = useAuthStore.getState();
      await checkSession();

      const state = useAuthStore.getState();
      // checkSession intentionally clears error to allow app to continue
      // User can sign in manually if session check fails
      expect(state.error).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useAuthStore.setState({ error: 'Some error' });

      const { clearError } = useAuthStore.getState();
      clearError();

      const state = useAuthStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('devBypassAuth', () => {
    it('should set mock user and session in development', () => {
      const { devBypassAuth } = useAuthStore.getState();
      devBypassAuth();

      const state = useAuthStore.getState();
      expect(state.user).toBeDefined();
      expect(state.user?.id).toBe('dev-user-123');
      expect(state.user?.email).toBe('dev@stepin.app');
      expect(state.session).toBeDefined();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});

