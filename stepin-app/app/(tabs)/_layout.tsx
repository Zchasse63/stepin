import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Layout } from '../../constants/Layout';
import { Typography } from '../../constants/Typography';
import { useTheme } from '../../lib/theme/themeManager';
import { hapticFeedback } from '../../lib/animations/celebrationAnimations';
import { ProfileButton } from '../../components/ProfileButton';

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);
const AnimatedFeather = Animated.createAnimatedComponent(Feather);

function TabBarIcon({ name, color, focused, iconSet = 'ionicons', emphasized = false }: {
  name: any;
  color: string;
  focused: boolean;
  iconSet?: 'ionicons' | 'feather';
  emphasized?: boolean;
}) {
  const { colors } = useTheme();
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

  // Emphasized style for Map tab
  if (emphasized) {
    return (
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: focused ? colors.primary.main : colors.background.secondary,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: -8,
        }}
      >
        {iconSet === 'feather' ? (
          <AnimatedFeather
            name={name}
            size={Layout.tabBar.iconSize}
            color={focused ? '#FFFFFF' : color}
            style={animatedStyle}
          />
        ) : (
          <AnimatedIonicons
            name={name}
            size={Layout.tabBar.iconSize}
            color={focused ? '#FFFFFF' : color}
            style={animatedStyle}
          />
        )}
      </View>
    );
  }

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
        headerShown: true,
        headerRight: () => <ProfileButton />,
        headerStyle: {
          backgroundColor: colors.background.primary,
        },
        headerTintColor: colors.text.primary,
        headerShadowVisible: false,
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
              emphasized={true}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="buddies"
        options={{
          title: 'Buddies',
          headerTitle: 'Buddies',
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
        name="insights"
        options={{
          title: 'Insights',
          headerTitle: 'Insights',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name="trending-up"
              color={color}
              focused={focused}
              iconSet="feather"
            />
          ),
        }}
      />
    </Tabs>
  );
}

