import { Switch, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type ToggleSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export function ToggleSwitch({ value, onValueChange, disabled }: ToggleSwitchProps) {
  const { colors } = useTheme();
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: colors.border, true: colors.primaryStart }}
      thumbColor={Platform.OS === 'android' ? colors.white : undefined}
      ios_backgroundColor={colors.border}
    />
  );
}
