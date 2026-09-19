import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import type { ThemeColors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { ScreenGradient } from '../components/ScreenGradient';

const LOGIN_TYPE_OPTIONS = [
  { id: '12', name: 'Other Vendor' },
  { id: '13', name: 'Mounter' },
  { id: '14', name: 'Monitor' },
];

const CARD_GRADIENT = ['#F68D7E', '#DB4438'] as const;

export default function Login() {
  const { login } = useApp();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [loginType, setLoginType] = useState(LOGIN_TYPE_OPTIONS[0]);
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
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
    <ScreenGradient>
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.welcome}>Welcome!</Text>

        <LinearGradient colors={CARD_GRADIENT} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.card}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={44} color="rgba(255,255,255,0.85)" />
          </View>

          <Pressable style={styles.typeDropdown} onPress={() => setTypePickerOpen(true)}>
            <Ionicons name="briefcase-outline" size={18} color="rgba(255,255,255,0.85)" style={glassStyles.icon} />
            <Text style={styles.typeDropdownText}>{loginType.name}</Text>
            <Ionicons name="chevron-down" size={18} color="rgba(255,255,255,0.85)" />
          </Pressable>

          <Modal visible={typePickerOpen} transparent animationType="fade" onRequestClose={() => setTypePickerOpen(false)}>
            <Pressable style={styles.pickerBackdrop} onPress={() => setTypePickerOpen(false)}>
              <View style={styles.pickerSheet}>
                {LOGIN_TYPE_OPTIONS.map((option) => {
                  const active = option.id === loginType.id;
                  return (
                    <Pressable
                      key={option.id}
                      style={styles.pickerOption}
                      onPress={() => {
                        setLoginType(option);
                        setTypePickerOpen(false);
                      }}
                    >
                      <Text style={[styles.pickerOptionText, active && styles.pickerOptionTextActive]}>
                        {option.name}
                      </Text>
                      {active ? <Ionicons name="checkmark-circle" size={20} color="#DB4438" /> : null}
                    </Pressable>
                  );
                })}
              </View>
            </Pressable>
          </Modal>

          <GlassField
            icon="mail-outline"
            placeholder="Email ID"
            autoCapitalize="none"
            keyboardType="email-address"
            value={username}
            onChangeText={setUsername}
          />

          <GlassField
            icon="lock-closed-outline"
            placeholder="Password"
            secureTextEntry={passwordHidden}
            value={password}
            onChangeText={setPassword}
            rightIcon={passwordHidden ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setPasswordHidden((h) => !h)}
          />

          <View style={styles.optionsRow}>
            <Pressable style={styles.rememberRow} onPress={() => setRememberMe((r) => !r)} hitSlop={8}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe ? <Ionicons name="checkmark" size={13} color="#DB4438" /> : null}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </Pressable>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </View>

          <Pressable
            onPress={onLogin}
            disabled={!canSubmit || submitting}
            style={({ pressed }) => [styles.loginButton, (pressed || !canSubmit || submitting) && styles.loginButtonPressed]}
          >
            <Text style={styles.loginButtonText}>{submitting ? 'Logging in…' : 'LOGIN'}</Text>
          </Pressable>
        </LinearGradient>

        <View style={styles.footer}>
          <Image
            source={require('../assets/images/mmx-cloud-badge.png')}
            style={styles.footerLogo}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </ScreenGradient>
  );
}

type GlassFieldProps = {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address';
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
};

function GlassField({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  autoCapitalize,
  keyboardType,
  rightIcon,
  onRightIconPress,
}: GlassFieldProps) {
  return (
    <View style={glassStyles.wrapper}>
      <Ionicons name={icon} size={18} color="rgba(255,255,255,0.85)" style={glassStyles.icon} />
      <TextInput
        style={glassStyles.input}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.75)"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
      />
      {rightIcon ? (
        <Pressable onPress={onRightIconPress} hitSlop={10}>
          <Ionicons name={rightIcon} size={18} color="rgba(255,255,255,0.85)" />
        </Pressable>
      ) : null}
    </View>
  );
}

const glassStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.45)',
    paddingBottom: spacing.sm,
    marginBottom: spacing.lg,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    paddingVertical: 4,
  },
});

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    container: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xxl,
    },
    welcome: {
      fontSize: 45,
      fontWeight: '800',
      color: colors.onBackground,
      textAlign: 'center',
      marginBottom: spacing.xxl,
    },
    card: {
      marginHorizontal: 20,
      borderRadius: 32,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 8,
    },
    avatar: {
      alignSelf: 'center',
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    typeDropdown: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.45)',
      paddingBottom: spacing.sm,
      marginBottom: spacing.lg,
    },
    typeDropdownText: {
      flex: 1,
      fontSize: 15,
      color: '#FFFFFF',
    },
    pickerBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
    },
    pickerSheet: {
      backgroundColor: '#FFFFFF',
      borderRadius: radius.lg,
      paddingVertical: spacing.xs,
      overflow: 'hidden',
    },
    pickerOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    pickerOptionText: {
      fontSize: 16,
      color: colors.text,
    },
    pickerOptionTextActive: {
      fontWeight: '700',
      color: '#DB4438',
    },
    optionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xl,
    },
    rememberRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkbox: {
      width: 18,
      height: 18,
      borderRadius: 4,
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.85)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.xs,
    },
    checkboxChecked: {
      backgroundColor: '#FFFFFF',
      borderColor: '#FFFFFF',
    },
    rememberText: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.9)',
    },
    forgotText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    loginButton: {
      height: 54,
      borderRadius: radius.pill,
      backgroundColor: '#3B1660',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loginButtonPressed: {
      opacity: 0.85,
    },
    loginButtonText: {
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 1,
      color: '#FFFFFF',
    },
    footer: {
      alignItems: 'center',
      marginTop: spacing.xxl,
    },
    footerLogo: {
      width: 270,
      height: 140,
    },
  });
}
