import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Polygon, Rect } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../theme/colors';

type DeskWorkerIllustrationProps = {
  size?: number;
};

export function DeskWorkerIllustration({ size = 220 }: DeskWorkerIllustrationProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const navy = colors.logoNavy;
  const blue = colors.primaryStart;
  const cyan = colors.primaryEnd;
  const skin = '#F3B98C';
  const desk = colors.surfaceMuted;
  const deskEdge = colors.border;

  return (
    <View style={[styles.wrap, { width: size, height: size * 0.82 }]}>
      <Svg width="100%" height="100%" viewBox="0 0 300 246" fill="none">
        {/* corner accent swoosh */}
        <Path d="M300 0 L300 90 C 230 80, 210 20, 230 0 Z" fill={blue} opacity={0.14} />
        <Path d="M300 0 L300 60 C 250 55, 240 15, 255 0 Z" fill={blue} opacity={0.22} />

        {/* desk top (isometric) */}
        <Polygon points="30,176 150,148 270,176 150,204" fill={desk} stroke={deskEdge} strokeWidth={1.5} />
        {/* desk front */}
        <Polygon points="30,176 150,204 150,222 30,194" fill={deskEdge} opacity={0.5} />
        <Polygon points="270,176 150,204 150,222 270,194" fill={deskEdge} opacity={0.35} />

        {/* monitor stand */}
        <Rect x="140" y="150" width="10" height="16" rx="2" fill={navy} opacity={0.5} />
        {/* monitor */}
        <Rect x="96" y="76" width="108" height="76" rx="8" fill={navy} />
        <Rect x="104" y="84" width="92" height="58" rx="3" fill={colors.background} />
        {/* chart line inside monitor */}
        <Polyline colors={[blue, cyan]} />
        <Circle cx="118" cy="118" r="3" fill={cyan} />
        <Circle cx="140" cy="102" r="3" fill={cyan} />
        <Circle cx="162" cy="112" r="3" fill={cyan} />
        <Circle cx="184" cy="94" r="3" fill={cyan} />
        <Rect x="110" y="128" width="16" height="4" rx="2" fill={colors.border} />
        <Rect x="132" y="128" width="24" height="4" rx="2" fill={colors.border} />

        {/* keyboard */}
        <Polygon points="98,170 150,158 168,164 116,176" fill={colors.background} stroke={deskEdge} strokeWidth={1} />
        {/* mouse */}
        <Ellipse cx="188" cy="168" rx="6" ry="4" fill={colors.background} stroke={deskEdge} strokeWidth={1} />

        {/* coffee cup */}
        <Rect x="58" y="160" width="14" height="14" rx="3" fill={colors.white} stroke={deskEdge} strokeWidth={1} />
        <Path d="M72 164 q6 0 6 5 q0 5 -6 5" stroke={deskEdge} strokeWidth={1.2} fill="none" />

        {/* books stack */}
        <Rect x="208" y="168" width="34" height="7" rx="1.5" fill={cyan} opacity={0.85} />
        <Rect x="210" y="161" width="30" height="7" rx="1.5" fill={blue} opacity={0.85} />
        <Rect x="208" y="154" width="34" height="7" rx="1.5" fill={navy} opacity={0.85} />

        {/* plant */}
        <Path d="M226 152 C218 140,222 128,230 122 C236 132,236 146,226 152 Z" fill={cyan} opacity={0.8} />
        <Path d="M226 152 C232 142,240 134,248 132 C246 144,238 152,226 152 Z" fill={blue} opacity={0.8} />
        <Rect x="220" y="152" width="14" height="10" rx="2" fill={navy} opacity={0.6} />

        {/* chair */}
        <Rect x="118" y="192" width="6" height="30" rx="2" fill={deskEdge} />
        <Circle cx="121" cy="224" r="4" fill={deskEdge} />
        <Path d="M96 176 Q94 150 118 150 Q120 150 120 154 L120 176 Z" fill={navy} opacity={0.18} />

        {/* person - seated, side/isometric lean */}
        <Ellipse cx="118" cy="150" rx="24" ry="30" fill={blue} />
        <Circle cx="120" cy="108" r="16" fill={skin} />
        <Path d="M104 100 Q106 84 120 84 Q136 84 136 100 L136 96 Q120 92 104 96 Z" fill={navy} />
        <Rect x="96" y="122" width="30" height="20" rx="8" fill={blue} />
        <Path d="M126 128 L150 152 L146 158 L120 136 Z" fill={skin} />
        <Circle cx="150" cy="152" r="5" fill={skin} />
      </Svg>
    </View>
  );
}

function Polyline({ colors }: { colors: [string, string] }) {
  return (
    <Path
      d="M112 118 L134 102 L156 112 L178 94"
      stroke={colors[1]}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
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
