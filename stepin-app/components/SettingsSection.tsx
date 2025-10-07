/**
 * SettingsSection Component
 * Container for grouped settings items with section title
 * iOS Settings app style
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Typography } from '../constants/Typography';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  footer?: string;
}

export function SettingsSection({ title, children, footer }: SettingsSectionProps) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>{children}</View>
      {footer && <Text style={styles.footer}>{footer}</Text>}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    fontFamily: Typography.fontFamily.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  content: {
    backgroundColor: colors.background.primary,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.light,
  },
  footer: {
    fontSize: 13,
    color: colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
    paddingHorizontal: 16,
    marginTop: 8,
    lineHeight: 18,
  },
});

