import React, { useRef } from 'react';
import { Image, Platform, View } from 'react-native';
import { BlurTargetView, BlurView } from 'expo-blur';
import Svg, { Path } from 'react-native-svg';
import { Category } from '../types/budget';
import { useTheme } from '../theme/useTheme';
import { money } from '../utils/money';
import { AppText, Card } from './ui';
import { Icon } from './Icon';

type DashboardSummary = {
  variant: 'dashboard'; balanceCents: number; incomeCents: number; spentCents: number;
};
type HistorySummary = {
  variant: 'history'; totalCents: number; movementCount: number; mainCategory?: Category & { total: number };
  previousTotalCents: number; comparisonLabel: string;
};

export function SummaryCard(props: DashboardSummary | HistorySummary) {
  const { colors, isDark } = useTheme();
  const blurTarget = useRef<View>(null);
  const foreground = isDark ? colors.onPrimary : colors.text;
  const subdued = isDark ? colors.onPrimary : colors.muted;
  const surfaceColor = isDark ? colors.brand : colors.surfaceAlt;
  const isHistory = props.variant === 'history';
  const balanceCents = props.variant === 'dashboard' ? props.balanceCents : 0;
  const totalCents = props.variant === 'history' ? props.totalCents : 0;
  const difference = isHistory ? props.totalCents - props.previousTotalCents : 0;
  const changed = difference !== 0;
  const isIncrease = difference > 0;
  const trendColor = isIncrease ? colors.danger : colors.success;
  const percent = isHistory && props.previousTotalCents > 0
    ? Math.abs(difference / props.previousTotalCents * 100)
    : null;
  const percentLabel = percent === null
    ? isHistory && props.totalCents > 0 ? '—' : '0%'
    : !changed ? '0%'
      : `${isIncrease ? '+' : '−'}${percent < 1 ? percent.toFixed(1).replace('.', ',') : Math.round(percent)}%`;
  return <Card style={{ position: 'relative', overflow: 'hidden', backgroundColor: surfaceColor,
    borderColor: isDark ? 'rgba(255,255,255,0.14)' : colors.border, borderRadius: 24,
    padding: 20, gap: isHistory ? 12 : 16 }}>
    {Platform.OS === 'android' ? <View pointerEvents="none" accessibilityElementsHidden
      style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
      <Image source={require('../../assets/dashboard-glass-waves.png')} resizeMode="stretch"
        style={{ position: 'absolute', width: '112%', height: isHistory ? 190 : 160, right: -42, bottom: isHistory ? -36 : -28,
          opacity: isDark ? (isHistory ? 0.2 : 0.22) : (isHistory ? 0.22 : 0.42) }} />
    </View> : <BlurTargetView ref={blurTarget} pointerEvents="none" accessibilityElementsHidden
      style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
      <Image source={require('../../assets/dashboard-glass-waves.png')} resizeMode="stretch"
        style={{ position: 'absolute', width: '112%', height: isHistory ? 190 : 160, right: -42, bottom: isHistory ? -36 : -28,
          opacity: isDark ? (isHistory ? 0.2 : 0.22) : (isHistory ? 0.22 : 0.42) }} />
    </BlurTargetView>}
    {Platform.OS !== 'android' && <BlurView blurTarget={blurTarget} intensity={6} tint={isDark ? 'dark' : 'light'}
      blurMethod="dimezisBlurView" pointerEvents="none"
      style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />}

    {props.variant === 'dashboard' ? <>
      <View style={{ gap: 5 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
          <AppText variant="label" style={{ color: subdued, opacity: 0.78 }}>
            {balanceCents < 0 ? 'DÉFICIT DE LA QUINCENA' : 'SALDO DISPONIBLE'}
          </AppText>
          <CardChip />
        </View>
        <AppText style={{ color: foreground, fontSize: 36, lineHeight: 43, fontWeight: '700', letterSpacing: -1.1 }}>
          {money(balanceCents)}
        </AppText>
        <AppText style={{ color: subdued, opacity: 0.84, fontSize: 12 }}>
          {balanceCents < 0 ? 'Los gastos superan el ingreso configurado.' : 'Después de tus gastos y cargos fijos.'}
        </AppText>
      </View>
      <View style={{ flexDirection: 'row', gap: 14, paddingTop: 12,
        borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.16)' : colors.border }}>
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
          <AppText style={{ color: subdued, opacity: 0.82, fontSize: 10, lineHeight: 14 }}>Ingreso neto quincenal</AppText>
          <AppText style={{ color: foreground, fontSize: 14, fontWeight: '600' }}>{money(props.incomeCents)}</AppText>
        </View>
        <View style={{ width: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.16)' : colors.border }} />
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
          <AppText style={{ color: subdued, opacity: 0.82, fontSize: 10, lineHeight: 14 }}>Gastos de la quincena</AppText>
          <AppText style={{ color: foreground, fontSize: 14, fontWeight: '600' }}>{money(props.spentCents)}</AppText>
        </View>
      </View>
    </> : <>
      <View style={{ gap: 5 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Icon name="wallet" color={foreground} size={16} />
          <AppText variant="label" style={{ color: subdued, opacity: 0.82 }}>GASTOS DEL PERÍODO</AppText>
        </View>
        <AppText style={{ color: foreground, fontSize: 34, lineHeight: 41, fontWeight: '700', letterSpacing: -1 }}>
          {money(totalCents)}
        </AppText>
      </View>
      <View style={{ gap: 8, paddingTop: 11, borderTopWidth: 1,
        borderTopColor: isDark ? 'rgba(255,255,255,0.16)' : colors.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <AppText style={{ color: subdued, opacity: 0.9, fontSize: 11, fontWeight: '700' }}>Movimientos</AppText>
          <AppText style={{ color: foreground, fontSize: 11, fontWeight: '400' }}>{props.movementCount}</AppText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <AppText style={{ color: subdued, opacity: 0.9, fontSize: 11, fontWeight: '700' }}>Mayor categoría</AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6, flex: 1, minWidth: 0 }}>
            {props.mainCategory && <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: props.mainCategory.color }} />}
            {props.mainCategory ? <>
              <AppText numberOfLines={1} style={{ color: subdued, fontSize: 11, fontWeight: '400', flexShrink: 1 }}>
                {props.mainCategory.name}
              </AppText>
              <AppText style={{ color: foreground, fontSize: 11, fontWeight: '600', flexShrink: 0 }}>
                ({money(props.mainCategory.total)})
              </AppText>
            </> : <AppText style={{ color: foreground, fontSize: 11, fontWeight: '400' }}>Sin gastos</AppText>}
          </View>
        </View>
      </View>
      <View accessibilityLabel={`${props.comparisonLabel}: ${percent === null && props.totalCents > 0 ? 'sin base anterior para calcular el porcentaje' : percentLabel}`}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {changed && <TrendArrow color={trendColor} upward={!isIncrease} />}
        <AppText numberOfLines={1} style={{ flex: 1, minWidth: 0, color: subdued, opacity: 0.86, fontSize: 11 }}>
          <AppText style={{ color: changed ? trendColor : foreground, fontSize: 11, fontWeight: '700' }}>{percentLabel}</AppText>
          <AppText style={{ color: subdued, opacity: 0.9, fontSize: 11, fontWeight: '600' }}>{` ${props.comparisonLabel}`}</AppText>
        </AppText>
      </View>
    </>}
  </Card>;
}

function TrendArrow({ color, upward }: { color: string; upward: boolean }) {
  return <Svg width={24} height={24} viewBox="0 0 40 40" accessibilityElementsHidden>
    <Path d={upward ? 'M5 32 15 22l7 7 13-15M26 14h9v9' : 'M5 8l10 10 7-7 13 15m-9 0h9v-9'}
      fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}

function CardChip() {
  return <View accessibilityElementsHidden style={{ width: 30, height: 22, borderRadius: 5,
    backgroundColor: 'rgba(221,190,126,0.25)', borderWidth: 1, borderColor: 'rgba(241,218,166,0.48)',
    overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ position: 'absolute', width: 1, height: '100%', backgroundColor: 'rgba(241,218,166,0.42)' }} />
    <View style={{ position: 'absolute', height: 1, width: '100%', backgroundColor: 'rgba(241,218,166,0.42)' }} />
    <View style={{ width: 17, height: 11, borderWidth: 1, borderColor: 'rgba(241,218,166,0.42)', borderRadius: 3 }} />
  </View>;
}
