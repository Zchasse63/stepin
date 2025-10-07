/**
 * Onboarding Screen - Multi-step onboarding flow
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useTheme } from '../../lib/theme/themeManager';
import { Layout } from '../../constants/Layout';
import { Typography } from '../../constants/Typography';
import { OnboardingStep } from '../../components/onboarding/OnboardingStep';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { AnimatedButton } from '../../components/AnimatedButton';
import { useAuthStore } from '../../lib/store/authStore';
import { useProfileStore } from '../../lib/store/profileStore';
import { supabase } from '../../lib/supabase/client';
import { getHealthService } from '../../lib/health';
import { logger } from '../../lib/utils/logger';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_STEPS = 6;

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepGoal, setStepGoal] = useState(7000);
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { updateProfile } = useProfileStore();

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      flatListRef.current?.scrollToIndex({ index: nextStep, animated: true });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      flatListRef.current?.scrollToIndex({ index: prevStep, animated: true });
    }
  };

  const handleGrantPermissions = async () => {
    setLoading(true);
    try {
      const healthService = getHealthService();
      const result = await healthService.requestPermissions();
      if (result.granted) {
        Alert.alert('Success', 'Health permissions granted!');
      } else {
        Alert.alert('Permissions Not Granted', "You can still log walks manually.");
      }
      handleNext();
    } catch (error) {
      logger.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions.');
      handleNext();
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          daily_step_goal: stepGoal,
        })
        .eq('id', user.id);
      await updateProfile({ daily_step_goal: stepGoal });
      router.replace('/(tabs)');
    } catch (error) {
      logger.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to complete onboarding.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = ({ index }: { index: number }) => {
    const iconCircleStyle = [styles.iconCircle, { backgroundColor: colors.background.tertiary }];
    
    switch (index) {
      case 0:
        return (
          <OnboardingStep
            title="Welcome to Stepin! 👋"
            description="Your personal walking companion that celebrates every step of your journey."
            illustration={
              <View style={iconCircleStyle}>
                <Ionicons name="footsteps" size={80} color={colors.primary.main} />
              </View>
            }
          />
        );
      case 1:
        return (
          <OnboardingStep
            title="How It Works"
            description="Stepin makes walking simple and rewarding."
            illustration={
              <View style={iconCircleStyle}>
                <Ionicons name="walk" size={80} color={colors.primary.main} />
              </View>
            }
          />
        );
      case 2:
        return (
          <OnboardingStep
            title="Set Your Daily Goal"
            description="Choose a step goal that feels right for you."
            illustration={
              <View style={styles.goalDisplay}>
                <Text style={[styles.goalNumber, { color: colors.primary.main }]}>{stepGoal.toLocaleString()}</Text>
                <Text style={[styles.goalLabel, { color: colors.text.secondary }]}>steps per day</Text>
              </View>
            }
            content={
              <View style={styles.goalContent}>
                <Slider
                  style={styles.slider}
                  minimumValue={2000}
                  maximumValue={20000}
                  step={500}
                  value={stepGoal}
                  onValueChange={setStepGoal}
                  minimumTrackTintColor={colors.primary.main}
                  maximumTrackTintColor={colors.border.light}
                  thumbTintColor={colors.primary.main}
                />
              </View>
            }
          />
        );
      case 3:
        return (
          <OnboardingStep
            title="Connect Your Health Data"
            description={`Stepin can automatically track your steps from ${Platform.OS === 'ios' ? 'Apple Health' : 'Google Fit'}.`}
            illustration={
              <View style={iconCircleStyle}>
                <Ionicons name="fitness" size={80} color={colors.primary.main} />
              </View>
            }
          />
        );
      case 4:
        return (
          <OnboardingStep
            title="Stay Motivated"
            description="Get gentle reminders to help you stay on track."
            illustration={
              <View style={iconCircleStyle}>
                <Ionicons name="notifications" size={80} color={colors.primary.main} />
              </View>
            }
          />
        );
      case 5:
        return (
          <OnboardingStep
            title="You're All Set! 🎉"
            description="You're ready to start your walking journey. Every step counts!"
            illustration={
              <View style={iconCircleStyle}>
                <Ionicons name="checkmark-circle" size={80} color={colors.status.success} />
              </View>
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={styles.progressContainer}>
        <ProgressDots totalSteps={TOTAL_STEPS} currentStep={currentStep} />
      </View>
      <FlatList
        ref={flatListRef}
        data={Array.from({ length: TOTAL_STEPS })}
        renderItem={renderStep}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.flatList}
      />
      <View style={styles.buttonContainer}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
        <View style={styles.mainButtons}>
          {currentStep === 3 ? (
            <>
              <AnimatedButton title="Grant Permission" onPress={handleGrantPermissions} loading={loading} style={styles.button} />
              <TouchableOpacity onPress={handleNext} style={styles.skipButton}>
                <Text style={[styles.skipText, { color: colors.text.secondary }]}>Skip for now</Text>
              </TouchableOpacity>
            </>
          ) : currentStep === 4 ? (
            <>
              <AnimatedButton title="Enable Notifications" onPress={handleNext} style={styles.button} />
              <TouchableOpacity onPress={handleNext} style={styles.skipButton}>
                <Text style={[styles.skipText, { color: colors.text.secondary }]}>Skip</Text>
              </TouchableOpacity>
            </>
          ) : currentStep === TOTAL_STEPS - 1 ? (
            <AnimatedButton title="Start Walking" onPress={handleComplete} loading={loading} style={styles.button} />
          ) : (
            <AnimatedButton title={currentStep === 0 ? 'Get Started' : 'Next'} onPress={handleNext} style={styles.button} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressContainer: { paddingTop: 60, paddingBottom: 20, alignItems: 'center' },
  flatList: { flex: 1 },
  buttonContainer: { padding: Layout.spacing.xl, paddingBottom: 40 },
  backButton: { position: 'absolute', left: Layout.spacing.xl, top: Layout.spacing.xl },
  mainButtons: { alignItems: 'center' },
  button: { width: '100%', marginBottom: Layout.spacing.md },
  skipButton: { padding: Layout.spacing.sm },
  skipText: { ...Typography.body },
  iconCircle: { width: 160, height: 160, borderRadius: 80, justifyContent: 'center', alignItems: 'center', marginBottom: Layout.spacing.lg },
  goalDisplay: { alignItems: 'center', marginBottom: Layout.spacing.lg },
  goalNumber: { ...Typography.largeTitle, fontSize: 64, fontWeight: '700' },
  goalLabel: { ...Typography.body },
  goalContent: { width: '100%' },
  slider: { width: '100%', height: 40 },
});
