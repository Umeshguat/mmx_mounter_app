import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../theme/colors';

type CityWorkersIllustrationProps = {
  width?: number;
};

function Worker({ x, vest, helmet, skin }: { x: number; vest: string; helmet: string; skin: string }) {
  return (
    <>
      <Rect x={x} y={70} width={10} height={20} rx={3} fill={vest} />
      <Circle cx={x + 5} cy={62} r={7} fill={skin} />
      <Path d={`M${x - 2} 55 Q${x + 5} 48 ${x + 12} 55 Z`} fill={helmet} />
      <Rect x={x - 3} y={90} width={5} height={14} rx={2} fill={vest} opacity={0.85} />
      <Rect x={x + 8} y={90} width={5} height={14} rx={2} fill={vest} opacity={0.85} />
    </>
  );
}

export function CityWorkersIllustration({ width = 340 }: CityWorkersIllustrationProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const navy = colors.logoNavy;
  const red = colors.logoRed;
  const cyan = colors.primaryEnd;
  const blue = colors.primaryStart;
  const skin = '#F3B98C';

  return (
    <View style={[styles.wrap, { width, height: width * 0.34 }]}>
      <Svg width="100%" height="100%" viewBox="0 0 340 116" fill="none">
        {/* sky arc */}
        <Path d="M4 30 Q120 4 336 26" stroke={colors.border} strokeWidth={1} strokeDasharray="3 4" fill="none" />
        <Circle cx="308" cy="16" r="10" fill={cyan} opacity={0.5} />

        {/* buildings */}
        <Rect x="14" y="34" width="34" height="50" rx="3" fill={colors.surfaceMuted} />
        <Rect x="54" y="18" width="44" height="66" rx="3" fill={colors.surfaceMuted} />
        <Rect x="250" y="30" width="38" height="54" rx="3" fill={colors.surfaceMuted} />
        <Rect x="292" y="14" width="40" height="70" rx="3" fill={colors.surfaceMuted} />
        {/* windows */}
        <Rect x="62" y="28" width="8" height="8" rx="1.5" fill={blue} opacity={0.35} />
        <Rect x="78" y="28" width="8" height="8" rx="1.5" fill={red} opacity={0.3} />
        <Rect x="62" y="44" width="8" height="8" rx="1.5" fill={blue} opacity={0.35} />
        <Rect x="78" y="44" width="8" height="8" rx="1.5" fill={blue} opacity={0.35} />
        <Rect x="300" y="26" width="8" height="8" rx="1.5" fill={cyan} opacity={0.4} />
        <Rect x="316" y="26" width="8" height="8" rx="1.5" fill={red} opacity={0.3} />
        <Rect x="300" y="42" width="8" height="8" rx="1.5" fill={blue} opacity={0.35} />

        <Rect x="0" y="84" width="340" height="2" fill={colors.border} />

        {/* trees */}
        <Circle cx="110" cy="76" r="10" fill={cyan} opacity={0.55} />
        <Rect x="108" y="84" width="4" height="10" fill={navy} opacity={0.4} />
        <Circle cx="222" cy="74" r="9" fill={red} opacity={0.35} />
        <Rect x="220" y="82" width="4" height="10" fill={navy} opacity={0.4} />

        {/* bench */}
        <Rect x="140" y="78" width="34" height="4" rx="2" fill={navy} opacity={0.5} />
        <Rect x="142" y="82" width="3" height="10" fill={navy} opacity={0.5} />
        <Rect x="170" y="82" width="3" height="10" fill={navy} opacity={0.5} />

        {/* sign post */}
        <Rect x="196" y="60" width="3" height="24" fill={navy} opacity={0.5} />
        <Rect x="188" y="52" width="20" height="12" rx="2" fill={blue} />

        {/* traffic cone */}
        <Path d="M52 84 L58 62 L64 84 Z" fill={red} />
        <Rect x="50" y="82" width="16" height="4" rx="1" fill={red} />

        <Worker x={20} vest={red} helmet={blue} skin={skin} />
        <Worker x={100} vest={blue} helmet={navy} skin={skin} />
        <Worker x={260} vest={navy} helmet={red} skin={skin} />
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
