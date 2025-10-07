# Stepin MVP Development Plan

## Executive Summary

**Goal**: Ship a functional, non-competitive wellness walking app MVP in 6-8 weeks using Supabase, validating product-market fit before adding PowerSync offline-first capabilities.

**Core Value Proposition**: The only walking app that celebrates 2,000 steps as much as 10,000 steps, with zero competitive pressure and grandmother-friendly simplicity.

---

## 🚀 Quick Start

This documentation is organized into phases that guide you through building the Stepin MVP from foundation to launch. Each phase is designed to be completed sequentially, with clear acceptance criteria and implementation guidance.

### Development Timeline
- **Weeks 1-4**: Core functionality (Phases 1-4)
- **Weeks 5-6**: Polish and testing (Phase 5)
- **Weeks 7-8**: Launch preparation (Phase 6)

---

## 📚 Table of Contents

### Development Phases

1. **[Phase 1: Foundation & Authentication](phase-1-foundation-auth.md)** (Week 1)
   - Project setup with Expo and React Native
   - Supabase database configuration
   - Authentication flow implementation

2. **[Phase 2: Core Step Tracking](phase-2-step-tracking.md)** (Week 2)
   - HealthKit/Health Connect integration
   - Today screen with step counter
   - Manual walk logging

3. **[Phase 3: History & Progress Tracking](phase-3-history-progress.md)** (Week 3)
   - History screen with charts
   - Calendar heat map
   - Progress insights

4. **[Phase 4: Profile & Settings](phase-4-profile-settings.md)** (Week 4)
   - User profile management
   - Settings and preferences
   - Local notifications

5. **[Phase 5: Polish & Testing](phase-5-polish-testing.md)** (Weeks 5-6)
   - Animations and micro-interactions
   - Error handling
   - Comprehensive testing

6. **[Phase 6: MVP Launch Prep](phase-6-launch-prep.md)** (Weeks 7-8)
   - App Store preparation
   - Build and submission
   - Post-launch monitoring

### Supporting Documentation

- **[Implementation Guide](implementation-guide.md)** - How to use this plan with Augment Code
- **[Database Schema](database-schema.sql)** - Complete SQL schema for Supabase
- **[Future Roadmap](future-roadmap.md)** - Post-MVP features and PowerSync integration
- **[App Store Copy](store-assets/app-store-copy.md)** - Marketing materials and store listings
- **[Testing Checklist](testing/testing-checklist.md)** - Comprehensive manual testing guide

---

## 🛠 Technical Stack

- **Frontend**: React Native 0.81.4 with New Architecture
- **Framework**: Expo SDK 52+ with Expo Router
- **Backend**: Supabase (Auth + Postgres + Realtime)
- **State Management**: Zustand
- **Health Data**: 
  - iOS: @kingstinct/react-native-healthkit
  - Android: react-native-health-connect
- **Location**: Expo Location
- **Animations**: React Native Reanimated
- **Icons**: @expo/vector-icons

---

## 🎯 Success Metrics for MVP

**Usage Goals**:
- 100 users actively logging walks weekly
- Average 4+ walks logged per user
- 60%+ day-7 retention
- Positive qualitative feedback about non-competitive approach

**Technical Goals**:
- <1% crash rate
- <2 second app load time
- Health data syncs successfully >95% of time
- 60fps animations throughout

---

## 💡 Core Design Principles

1. **Grandmother-Friendly**: Large text, clear hierarchy, minimal complexity
2. **Celebration-Focused**: Positive reinforcement for ANY progress
3. **No Comparison**: Never show other users' data or competitive elements
4. **Privacy First**: User data stays under user control
5. **Accessibility**: Works for users of all abilities

---

## 💰 Estimated Costs (First 3 Months, 1000 Users)

- **Supabase**: $0-25/month
- **Expo EAS**: $0 (hobby plan)
- **Domain**: $12/year
- **Total**: ~$25-40/month

After validation, PowerSync can be added ($35-60/month) for true offline-first experience.

---

## 🏁 Getting Started

1. **Read the [Implementation Guide](implementation-guide.md)** to understand how to work with Augment Code
2. **Start with [Phase 1](phase-1-foundation-auth.md)** to set up your project foundation
3. **Follow phases sequentially** - each builds on the previous
4. **Test thoroughly** after each phase before moving forward
5. **Reference the [Database Schema](database-schema.sql)** when setting up Supabase

---

## 📖 How to Use This Documentation

Each phase document contains:
- **Augment Code Prompts**: Ready-to-use prompts for AI-assisted development
- **Technical Specifications**: Detailed requirements and implementation details
- **Component Descriptions**: What to build and how it should work
- **Acceptance Criteria**: How to verify the phase is complete

Work through phases in order, testing each thoroughly before proceeding to the next.

---

## 📞 Questions or Issues?

This is a comprehensive technical specification designed for systematic implementation. If you encounter ambiguities or need clarification on any phase, refer to:
- The original master document: `stepin_mvp_development_plan_MASTER_ORIGINAL.md`
- The implementation guide for prompting strategies
- The testing checklist for validation criteria

---

**Ready to start walking? Start coding. 🚶‍♀️**

[Begin with Phase 1: Foundation & Authentication →](phase-1-foundation-auth.md)

