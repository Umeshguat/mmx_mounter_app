import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../theme/colors';

type HandshakeIllustrationProps = {
  size?: number;
};

export function HandshakeIllustration({ size = 200 }: HandshakeIllustrationProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const navy = colors.logoNavy;
  const blue = colors.primaryStart;
  const cyan = colors.primaryEnd;
  const skin = '#F3B98C';
  const hair = '#2B1B12';

  return (
    <View style={[styles.wrap, { width: size, height: size * 0.72 }]}>
      <Svg width="100%" height="100%" viewBox="0 0 300 216" fill="none">
        {/* backdrop blob */}
        <Circle cx="150" cy="118" r="92" fill={blue} opacity={0.08} />

        {/* speech bubbles */}
        <Rect x="34" y="14" width="64" height="34" rx="12" fill={colors.cardBlue} />
        <Path d="M50 46 L46 58 L64 48 Z" fill={colors.cardBlue} />
        <Rect x="46" y="24" width="40" height="4" rx="2" fill={colors.cardBlueIcon} opacity={0.6} />
        <Rect x="46" y="33" width="28" height="4" rx="2" fill={colors.cardBlueIcon} opacity={0.6} />

        <Rect x="200" y="6" width="64" height="34" rx="12" fill={colors.cardBlue} />
        <Path d="M234 38 L238 50 L250 40 Z" fill={colors.cardBlue} />
        <Rect x="212" y="16" width="40" height="4" rx="2" fill={colors.cardBlueIcon} opacity={0.6} />
        <Rect x="212" y="25" width="28" height="4" rx="2" fill={colors.cardBlueIcon} opacity={0.6} />

        {/* left man - navy suit */}
        <Path d="M74 216 L74 150 Q74 122 108 122 Q140 122 140 150 L140 216 Z" fill={navy} />
        <Rect x="102" y="128" width="14" height="30" fill={colors.white} opacity={0.9} />
        <Path d="M104 128 L112 140 L120 128 Z" fill={blue} />
        <Circle cx="110" cy="96" r="26" fill={skin} />
        <Path d="M84 92 Q84 64 110 64 Q136 64 136 92 Q136 76 110 76 Q84 76 84 92 Z" fill={hair} />
        {/* left arm reaching to handshake */}
        <Path d="M138 150 Q168 150 182 138" stroke={navy} strokeWidth={22} strokeLinecap="round" fill="none" />

        {/* right man - blue blazer */}
        <Path d="M160 216 L160 150 Q160 122 194 122 Q226 122 226 150 L226 216 Z" fill={blue} />
        <Rect x="188" y="128" width="14" height="30" fill={colors.white} opacity={0.9} />
        <Circle cx="196" cy="96" r="26" fill={skin} />
        <Path d="M170 92 Q170 64 196 64 Q222 64 222 92 Q222 76 196 76 Q170 76 170 92 Z" fill={hair} />
        {/* right arm reaching to handshake */}
        <Path d="M162 150 Q136 150 122 138" stroke={blue} strokeWidth={22} strokeLinecap="round" fill="none" />

        {/* clasped hands */}
        <Circle cx="152" cy="138" r="14" fill={skin} />
        <Rect x="140" y="130" width="24" height="16" rx="8" fill={cyan} opacity={0.9} />
      </Svg>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
