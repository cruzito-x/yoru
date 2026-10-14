import React from 'react';
import { Image, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { money } from '../utils/money';
import { AppText, Card } from './ui';

export function FortnightSummaryCard({ balanceCents, incomeCents, spentCents }: {
  balanceCents: number; incomeCents: number; spentCents: number;
}) {
  const { colors } = useTheme();
  const title = balanceCents < 0 ? 'DÉFICIT DE LA QUINCENA' : 'SALDO DISPONIBLE';
  const summarySurface = {
    flex: 1,
    gap: 5,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  } as const;

  return <Card style={{ position: 'relative', overflow: 'hidden', backgroundColor: colors.brand,
    borderColor: 'rgba(255,255,255,0.14)', borderRadius: 24, padding: 20, gap: 16 }}>
    <View pointerEvents="none" accessibilityElementsHidden style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
      <Image source={require('../../assets/dashboard-glass-waves.png')} resizeMode="stretch"
        style={{ position: 'absolute', width: '112%', height: 160, right: -42, bottom: -28, opacity: 0.22 }} />
    </View>
    <View style={{ gap: 5 }}>
      <AppText variant="label" style={{ color: colors.onPrimary, opacity: 0.72 }}>{title}</AppText>
      <AppText style={{ color: colors.onPrimary, fontSize: 36, lineHeight: 43, fontWeight: '700', letterSpacing: -1.1 }}>
        {money(balanceCents)}
      </AppText>
      <AppText style={{ color: colors.onPrimary, opacity: 0.78, fontSize: 12 }}>
        {balanceCents < 0 ? 'Los gastos superan el ingreso configurado.' : 'Después de tus gastos registrados.'}
      </AppText>
    </View>

    <View style={{ flexDirection: 'row', gap: 10 }}>
      <View style={summarySurface}>
        <AppText style={{ color: colors.onPrimary, opacity: 0.72, fontSize: 10, lineHeight: 14 }}>Ingreso neto quincenal</AppText>
        <AppText style={{ color: colors.onPrimary, fontSize: 14, fontWeight: '700' }}>{money(incomeCents)}</AppText>
      </View>
      <View style={summarySurface}>
        <AppText style={{ color: colors.onPrimary, opacity: 0.72, fontSize: 10, lineHeight: 14 }}>Gastos registrados</AppText>
        <AppText style={{ color: colors.onPrimary, fontSize: 14, fontWeight: '700' }}>{money(spentCents)}</AppText>
      </View>
    </View>
  </Card>;
}
