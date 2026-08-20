import { useState } from 'react';
import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { TextField } from '../components/TextField';
import { GradientButton } from '../components/GradientButton';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = username.trim().length > 0 && password.trim().length > 0;

  const onLogin = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    await login(username.trim(), password);
    setSubmitting(false);
    router.replace('/vendor-select');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.cloudsRow}>
          <Ionicons name="cloud-outline" size={54} color={colors.border} />
        </View>
        <View style={styles.cloudsRowRight}>
          <Ionicons name="cloud-outline" size={64} color={colors.border} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Please fill in the credentials</Text>
        </View>

        <View style={styles.form}>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  cloudsRow: {
    alignItems: 'flex-start',
  },
  cloudsRowRight: {
    alignItems: 'flex-end',
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
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
  form: {
    marginBottom: spacing.xl,
  },
  spacer: {
    height: spacing.md,
  },
  button: {
    marginTop: spacing.sm,
  },
});
