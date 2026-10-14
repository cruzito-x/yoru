import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../theme/useTheme';
import { AppText } from './ui';

export interface DonutSegment { id: string; value: number; color: string }

// Dona nativa: cada Circle pinta una parte de la circunferencia con strokeDasharray.
// No necesita Canvas, WebView ni Chart.js para funcionar en Android e iOS.
export function DonutChart({ segments, centerValue, centerLabel }: {
  segments: DonutSegment[]; centerValue: string; centerLabel: string;
}) {
  const { colors } = useTheme();
  const size = 204, radius = 83, stroke = 22;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  let consumed = 0;
  return <View style={{ width: size, height: size, alignSelf: 'center' }} accessibilityRole="image" accessibilityLabel={`${centerLabel}: ${centerValue}`}>
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={colors.track} strokeWidth={stroke} />
      {segments.filter(s => s.value > 0).map(segment => {
        const length = total > 0 ? segment.value / total * circumference : 0;
        const offset = consumed;
        consumed += length;
        return <Circle key={segment.id} cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={segment.color} strokeWidth={stroke} strokeDasharray={`${length} ${circumference}`}
          strokeDashoffset={-offset} transform={`rotate(-90 ${size / 2} ${size / 2})`} />;
      })}
    </Svg>
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', gap: 4 }}>
      <AppText style={{ fontSize: 30, fontWeight: '700', letterSpacing: -1 }}>{centerValue}</AppText>
      <AppText variant="muted" style={{ fontSize: 11 }}>{centerLabel}</AppText>
    </View>
  </View>;
}
