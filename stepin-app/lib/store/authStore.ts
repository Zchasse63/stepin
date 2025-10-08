/**
 * Authentication store using Zustand
 * Manages user authentication state and actions
 */

import { create } from 'zustand';
import { supabase } from '../supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;

  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearError: () => void;
  devBypassAuth: () => void; // Development only - bypass auth
}

// Export type for use in other files
export type AuthStore = AuthState;

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  user: null,
  session: null,
  loading: false,
  error: null,

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      set({
        user: data.user,
        session: data.session,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to sign in',
        loading: false,
      });
      throw error;
    }
  },

  // Sign up with email, password, and display name
  signUp: async (email: string, password: string, displayName: string) => {
    try {
      console.log('🔄 [AuthStore] Starting sign-up...');
      console.log('   Email:', email);
      console.log('   Display Name:', displayName);

      set({ loading: true, error: null });

      console.log('🔄 [AuthStore] Calling Supabase auth.signUp...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      console.log('📦 [AuthStore] Supabase response received');
      console.log('   User:', data.user ? `✅ ${data.user.id}` : '❌ null');
      console.log('   Session:', data.session ? '✅ Created' : '❌ null');
      console.log('   Error:', error ? `❌ ${error.message}` : '✅ None');

      if (error) {
        console.error('❌ [AuthStore] Supabase returned error:', error);
        throw error;
      }

      // Note: User might need to verify email depending on Supabase settings
      // For MVP, we'll assume auto-confirm is enabled
      console.log('✅ [AuthStore] Setting user and session in store');
      set({
        user: data.user,
        session: data.session,
        loading: false,
      });

      console.log('✅ [AuthStore] Sign-up completed successfully');
    } catch (error: any) {
      console.error('❌ [AuthStore] Sign-up error caught:', error);
      console.error('   Message:', error.message);
      console.error('   Code:', error.code);
      console.error('   Status:', error.status);

      set({
        error: error.message || 'Failed to sign up',
        loading: false,
      });
      throw error;
    }
  },

  // Sign out
  signOut: async () => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      set({
        user: null,
        session: null,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to sign out',
        loading: false,
      });
      throw error;
    }
  },

  // Check for existing session (on app start)
  checkSession: async () => {
    try {
      set({ loading: true, error: null });

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      set({
        user: session?.user ?? null,
        session: session,
        loading: false,
      });

      // Set up auth state change listener
      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          user: session?.user ?? null,
          session: session,
        });
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to check session',
        loading: false,
      });
    }
  },

  // Clear error message
  clearError: () => set({ error: null }),

  // Development only - bypass authentication
  // WARNING: Only use this in development! Remove before production
  devBypassAuth: () => {
    if (__DEV__) {
      const mockUser: User = {
        id: 'dev-user-123',
        email: 'dev@stepin.app',
        app_metadata: {},
        user_metadata: { display_name: 'Dev User' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;

      const mockSession: Session = {
        access_token: 'dev-token',
        refresh_token: 'dev-refresh',
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: mockUser,
      } as Session;

      set({
        user: mockUser,
        session: mockSession,
        loading: false,
        error: null,
      });
    } else {
      console.warn('devBypassAuth is only available in development mode');
    }
  },
}));

