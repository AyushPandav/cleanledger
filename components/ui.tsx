import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';

interface BadgeProps {
  variant: 'low' | 'med' | 'high' | 'done' | 'pending' | 'locked';
  children: string;
  style?: StyleProp<ViewStyle>;
}

export function Badge({ variant, children, style }: BadgeProps) {
  const variantStyles = {
    low: { backgroundColor: colors.greenLight, color: colors.green },
    med: { backgroundColor: colors.yellowLight, color: colors.yellow },
    high: { backgroundColor: colors.redLight, color: colors.red },
    done: { backgroundColor: colors.greenLight, color: colors.green },
    pending: { backgroundColor: colors.grayBadge, color: colors.grayDark },
    locked: { backgroundColor: colors.grayBadge, color: colors.grayDisabled },
  };

  return (
    <View style={[styles.badge, { backgroundColor: variantStyles[variant].backgroundColor }, style]}>
      <Text style={[styles.badgeText, { color: variantStyles[variant].color }]}>{children}</Text>
    </View>
  );
}

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export function ProgressBar({ progress, color = colors.green, height = 8, style }: ProgressBarProps) {
  return (
    <View style={[styles.progressOuter, { height }, style]}>
      <View style={[styles.progressInner, { width: `${progress}%`, backgroundColor: color }]} />
    </View>
  );
}

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'grey';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  return (
    <View style={[
      styles.card,
      variant === 'grey' && styles.cardGrey,
      style,
    ]}>
      {children}
    </View>
  );
}

interface InputProps {
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

export function Input({ value, onChangeText, placeholder, keyboardType, secureTextEntry, multiline, numberOfLines }: InputProps) {
  return (
    <TextInput
      style={[styles.input, multiline && styles.inputMultiline]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.grayDark}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      multiline={multiline}
      numberOfLines={numberOfLines}
    />
  );
}

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'green';
  style?: StyleProp<ViewStyle>;
}

export function Button({ children, onPress, variant = 'primary', style }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'green' && styles.buttonGreen,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.buttonText,
        variant === 'secondary' && styles.buttonTextSecondary,
      ]}>{children}</Text>
    </TouchableOpacity>
  );
}

interface LabelProps {
  children: string;
}

export function Label({ children }: LabelProps) {
  return <Text style={styles.label}>{children}</Text>;
}

interface SectionTitleProps {
  children: string;
}

export function SectionTitle({ children }: SectionTitleProps) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  progressOuter: {
    backgroundColor: colors.borderLighter,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressInner: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardGrey: {
    backgroundColor: colors.gray,
    borderColor: colors.borderLighter,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    fontFamily: 'System',
    backgroundColor: colors.white,
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    width: '100%',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonPrimary: {
    backgroundColor: colors.black,
  },
  buttonSecondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonGreen: {
    backgroundColor: colors.green,
  },
  buttonText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.white,
  },
  buttonTextSecondary: {
    color: colors.black,
    fontWeight: '500',
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
