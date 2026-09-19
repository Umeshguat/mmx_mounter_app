import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { gradients } from '../theme/colors';

type Props = {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

// Each screen paints its own opaque gradient instead of relying on a single
// shared backdrop behind the navigator — React Navigation keeps previous
// screens mounted underneath the active one, so a transparent screen background
// let the previous screen's content flash through during push/pop transitions.
export function ScreenGradient({ style, children }: Props) {
  return (
    <View style={[styles.flex, style]}>
      <LinearGradient
        colors={gradients.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
