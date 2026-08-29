import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ILLUSTRATION_SIZE, radius, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { Card } from '../components/Card';
import { TextField } from '../components/TextField';
import { Dropdown } from '../components/Dropdown';
import { GradientButton } from '../components/GradientButton';
import { useApp } from '../context/AppContext';

const LOGIN_TYPE_OPTIONS = [
  { id: '13', name: 'Mounter' },
  { id: '12', name: 'Other Vendor' },
];

export default function Login() {
  const { login } = useApp();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [loginType, setLoginType] = useState(LOGIN_TYPE_OPTIONS[0]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = username.trim().length > 0 && password.trim().length > 0;

  const onLogin = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const result = await login(username.trim(), password, Number(loginType.id));
      if (result.loginUserType === '13') {
        router.replace('/(tabs)');
      } else {
        router.replace('/vendor-select');
      }
    } catch (error) {
      Alert.alert('Login failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.illustrationWrap}>
          <Image
            source={require('../assets/images/login-lifestyle.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Please fill in the credentials</Text>
        </View>

        <Card tint="surface" style={styles.formCard}>
          <View style={styles.form}>
            <Dropdown
              icon="briefcase-outline"
              placeholder="Select login type"
              value={loginType}
              options={LOGIN_TYPE_OPTIONS}
              onSelect={setLoginType}
            />
            <View style={styles.spacer} />
            <TextField
              icon="person-outline"
              placeholder="Username"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
            <View style={styles.spacer} />
            <TextField
              icon="key-outline"
              placeholder="Password"
              secure
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <GradientButton
            label="Login"
            onPress={onLogin}
            loading={submitting}
            disabled={!canSubmit}
            style={styles.button}
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xxl,
      paddingBottom: spacing.lg,
    },
    illustrationWrap: {
      alignItems: 'center',
      paddingTop: 40,
      marginBottom: spacing.lg,
    },
    illustration: {
      width: ILLUSTRATION_SIZE,
      height: ILLUSTRATION_SIZE,
    },
    header: {
      marginBottom: spacing.xl,
    },
    title: {
      fontSize: 34,
      fontWeight: '800',
      color: colors.text,
    },
    subtitle: {
      marginTop: spacing.xs,
      fontSize: 15,
      color: colors.textMuted,
    },
    formCard: {
      borderRadius: radius.lg,
    },
    form: {
      marginBottom: spacing.lg,
    },
    spacer: {
      height: spacing.sm,
    },
    button: {
      marginTop: 0,
    },
  });
}
