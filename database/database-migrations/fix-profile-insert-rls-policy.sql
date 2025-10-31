-- Fix: Add Missing Profile INSERT RLS Policy
-- Date: 2025-10-31
-- Issue: Users cannot create their own profile records due to missing INSERT policy
-- 
-- This migration adds the missing INSERT policy to the profiles table,
-- allowing authenticated users to create their own profile record.

-- ============================================================================
-- Add INSERT policy for profiles table
-- ============================================================================

-- Check if the policy already exists, and create it if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
    
    RAISE NOTICE 'Profile INSERT policy created successfully';
  ELSE
    RAISE NOTICE 'Profile INSERT policy already exists';
  END IF;
END $$;

-- ============================================================================
-- Verification
-- ============================================================================

-- Verify the policy was created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    RAISE NOTICE 'Verification passed: Profile INSERT policy is in place';
  ELSE
    RAISE EXCEPTION 'Verification failed: Profile INSERT policy was not created';
  END IF;
END $$;

-- ============================================================================
-- Expected Policies on profiles table after this migration:
-- ============================================================================
-- 1. "Users can view own profile" (SELECT)
-- 2. "Users can update own profile" (UPDATE)
-- 3. "Users can insert own profile" (INSERT) <- NEW
-- ============================================================================
