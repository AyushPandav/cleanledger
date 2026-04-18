import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../utils/validation';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'investor' | 'startup'>('investor');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (password.length < 6) {
      newErrors.password = 'Please enter your password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    clearError();
    if (!validateForm()) return;

    try {
      await login(email, password, selectedRole);
      if (selectedRole === 'startup') {
        router.replace('/(startup)');
      } else {
        router.replace('/(investor)');
      }
    } catch (err) {
      // Error is set in context
    }
  };

  // Demo credentials helper
  const fillDemoCredentials = () => {
    setEmail('test@example.com');
    setPassword('TestPassword123');
    setSelectedRole('investor');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoSection}>
          <Text style={styles.logo}>VestBridge</Text>
          <Text style={styles.welcome}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.roleSection}>
          <Text style={styles.roleLabel}>Select your role</Text>
          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[styles.roleCard, selectedRole === 'investor' && styles.roleCardSelected]}
              onPress={() => setSelectedRole('investor')}
            >
              <View style={[styles.roleIcon, styles.roleInv]}>
                <Text style={styles.roleIconText}>I</Text>
              </View>
              <Text style={styles.roleTitle}>Investor</Text>
              <Text style={styles.roleDesc}>Fund startups</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleCard, selectedRole === 'startup' && styles.roleCardSelected]}
              onPress={() => setSelectedRole('startup')}
            >
              <View style={[styles.roleIcon, styles.roleSt]}>
                <Text style={styles.roleIconText}>S</Text>
              </View>
              <Text style={styles.roleTitle}>Startup</Text>
              <Text style={styles.roleDesc}>Raise capital</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Email Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="you@example.com"
            placeholderTextColor={colors.grayDark}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            editable={!isLoading}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        {/* Password Input */}
        <View style={styles.formGroup}>
          <View style={styles.passwordHeader}>
            <Text style={styles.label}>Password</Text>
            <TouchableOpacity>
              <Text style={styles.forgotText}>Forgot?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
              placeholder="••••••••"
              placeholderTextColor={colors.grayDark}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialCommunityIcons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={colors.grayDark}
              />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        {/* Sign In Button */}
        <TouchableOpacity
          style={[styles.btnPrimary, isLoading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.btnPrimaryText}>Sign in</Text>
          )}
        </TouchableOpacity>

        {/* Create Account Button */}
        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => router.push('/(auth)/signup')}
          disabled={isLoading}
        >
          <Text style={styles.btnSecondaryText}>Create account</Text>
        </TouchableOpacity>

        {/* Demo Credentials Helper */}
        <TouchableOpacity
          style={styles.demoBtn}
          onPress={fillDemoCredentials}
        >
          <View style={styles.demoBtnContent}>
            <MaterialCommunityIcons name="key" size={16} color={colors.text} />
            <Text style={styles.demoBtnText}>Demo Login (test@example.com)</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.terms}>By continuing you agree to our Terms of Use</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  logoSection: {
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  logo: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    letterSpacing: 1,
    color: colors.green,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  welcome: {
    fontSize: fontSize.display,
    fontWeight: '600',
    lineHeight: 32,
    marginBottom: spacing.xs,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  roleSection: {
    marginBottom: spacing.xxl,
  },
  roleLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  roleCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  roleCardSelected: {
    borderColor: colors.green,
    backgroundColor: colors.greenLight,
  },
  roleIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  roleInv: {
    backgroundColor: colors.black,
  },
  roleSt: {
    backgroundColor: colors.greenLight,
  },
  roleIconText: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.white,
  },
  roleTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  roleDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  forgotText: {
    fontSize: fontSize.sm,
    color: colors.green,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.text,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.red,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: spacing.lg + 30,
  },
  eyeIcon: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    padding: spacing.sm,
  },
  errorText: {
    color: colors.red,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  errorBanner: {
    backgroundColor: colors.redLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorBannerText: {
    color: colors.red,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  btnPrimary: {
    backgroundColor: colors.black,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnPrimaryText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.white,
  },
  btnSecondary: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  btnSecondaryText: {
    fontSize: fontSize.lg,
    fontWeight: '500',
    color: colors.text,
  },
  demoBtn: {
    backgroundColor: colors.grayLight,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  demoBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  demoBtnText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text,
  },
  terms: {
    textAlign: 'center',
    fontSize: fontSize.sm,
    color: colors.grayDisabled,
    marginTop: spacing.md,
  },
});
