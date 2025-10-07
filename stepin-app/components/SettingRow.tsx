/**
 * SettingRow Component
 * Individual setting row with different variants: toggle, disclosure, action
 * iOS Settings app style
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';
import { Typography } from '../constants/Typography';

type SettingRowVariant = 'toggle' | 'disclosure' | 'action';

interface SettingRowProps {
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  value?: string;
  variant: SettingRowVariant;
  onPress?: () => void;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  loading?: boolean;
  disabled?: boolean;
  destructive?: boolean;
  showDivider?: boolean;
}

export function SettingRow({
  icon,
  iconColor,
  label,
  value,
  variant,
  onPress,
  toggleValue = false,
  onToggle,
  loading = false,
  disabled = false,
  destructive = false,
  showDivider = true,
}: SettingRowProps) {
  const { colors } = useTheme();
  const finalIconColor = iconColor || colors.system.blue;

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  };

  const handleToggle = (newValue: boolean) => {
    if (!disabled && !loading && onToggle) {
      onToggle(newValue);
    }
  };

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const renderRight = () => {
    if (loading) {
      return <ActivityIndicator size="small" color={colors.system.gray} />;
    }

    switch (variant) {
      case 'toggle':
        return (
          <Switch
            value={toggleValue}
            onValueChange={handleToggle}
            disabled={disabled}
            trackColor={{
              false: colors.system.gray5,
              true: colors.system.green,
            }}
            ios_backgroundColor={colors.system.gray5}
            accessibilityLabel={`Toggle ${label}`}
          />
        );

      case 'disclosure':
        return (
          <View style={styles.disclosureContainer}>
            {value && <Text style={styles.value}>{value}</Text>}
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.system.gray2}
            />
          </View>
        );

      case 'action':
        return null;

      default:
        return null;
    }
  };

  const content = (
    <View style={[styles.container, !showDivider && styles.noDivider]}>
      <View style={styles.leftContainer}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: `${finalIconColor}15` }]}>
            <Ionicons name={icon} size={20} color={finalIconColor} />
          </View>
        )}
        <Text
          style={[
            styles.label,
            destructive && styles.destructiveLabel,
            disabled && styles.disabledLabel,
          ]}
        >
          {label}
        </Text>
      </View>
      <View style={styles.rightContainer}>{renderRight()}</View>
    </View>
  );

  if (variant === 'toggle') {
    // Toggle rows are not tappable, only the switch is interactive
    return content;
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.6}
      accessibilityLabel={label}
      accessibilityHint={variant === 'disclosure' ? 'Opens detail screen' : undefined}
      accessibilityRole="button"
    >
      {content}
    </TouchableOpacity>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44, // iOS minimum tap target
    backgroundColor: colors.background.primary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.light,
  },
  noDivider: {
    borderBottomWidth: 0,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  label: {
    fontSize: 17,
    color: colors.text.primary,
    fontFamily: Typography.fontFamily.regular,
    flex: 1,
  },
  destructiveLabel: {
    color: colors.status.error,
  },
  disabledLabel: {
    color: colors.text.disabled,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  disclosureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 17,
    color: colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
    marginRight: 8,
  },
});

