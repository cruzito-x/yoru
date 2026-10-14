import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { AnnualBonusCard } from './AnnualBonusCard';
import { Quincena25Card } from './Quincena25Card';
import { AppText } from './ui';

const options = [
  { value: 'aguinaldo', label: 'Aguinaldo' },
  { value: 'quincena25', label: 'Quincena 25' },
] as const;

export function SpecialIncomeTabs({ currentDay }: { currentDay: string }) {
  const { colors } = useTheme();
  const { benefit } = useLocalSearchParams<{ benefit?: string }>();
  const active = benefit === 'quincena25' ? 'quincena25' : 'aguinaldo';
  return <View style={{ gap: 14 }}>
    <AppText variant="heading">Ingresos especiales</AppText>
    <View accessibilityRole="tablist" accessibilityLabel="Ingresos especiales"
      style={{ flexDirection: 'row', backgroundColor: colors.surfaceAlt, padding: 4, borderRadius: 16, gap: 4 }}>
      {options.map(option => <Pressable key={option.value} accessibilityRole="tab" accessibilityLabel={option.label}
        accessibilityState={{ selected: active === option.value }} aria-selected={active === option.value}
        onPress={() => router.setParams({ benefit: option.value })}
        style={{ flex: 1, minHeight: 44, padding: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 12,
          backgroundColor: active === option.value ? colors.surface : 'transparent' }}>
        <AppText style={{ fontWeight: '600', fontSize: 13, color: active === option.value ? colors.primary : colors.muted }}>{option.label}</AppText>
      </Pressable>)}
    </View>
    {active === 'aguinaldo' ? <AnnualBonusCard currentDay={currentDay} /> : <Quincena25Card currentDay={currentDay} />}
  </View>;
}
