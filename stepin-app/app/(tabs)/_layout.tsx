import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Layout } from '../../constants/Layout';
import { Typography } from '../../constants/Typography';
import { useTheme } from '../../lib/theme/themeManager';
import { hapticFeedback } from '../../lib/animations/celebrationAnimations';

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);
const AnimatedFeather = Animated.createAnimatedComponent(Feather);

function TabBarIcon({ name, color, focused, iconSet = 'ionicons' }: {
  name: any;
  color: string;
  focused: boolean;
  iconSet?: 'ionicons' | 'feather';
}) {
  const scale = useSharedValue(focused ? 1.1 : 1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, {
      damping: 15,
      stiffness: 150,
    });

    if (focused) {
      hapticFeedback.light();
    }
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (iconSet === 'feather') {
    return (
      <AnimatedFeather
        name={name}
        size={Layout.tabBar.iconSize}
        color={color}
        style={animatedStyle}
      />
    );
  }

  return (
    <AnimatedIonicons
      name={name}
      size={Layout.tabBar.iconSize}
      color={color}
      style={animatedStyle}
    />
  );
}

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          height: Layout.tabBar.height + 34, // Add safe area for iOS
          paddingBottom: 34, // iOS safe area
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: colors.border.light,
          backgroundColor: colors.background.primary,
        },
        tabBarLabelStyle: {
          fontSize: Typography.fontSize.xs,
          fontWeight: Typography.fontWeight.medium,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="footsteps" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="calendar" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          headerTitle: 'Your Routes',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name="map"
              color={color}
              focused={focused}
              iconSet="feather"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="buddies"
        options={{
          title: 'Buddies',
          headerTitle: 'Your Buddies',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name="users"
              color={color}
              focused={focused}
              iconSet="feather"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="person" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

