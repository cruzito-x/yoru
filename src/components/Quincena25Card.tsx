import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useBudget } from '../context/BudgetContext';
import { useTheme } from '../theme/useTheme';
import { money } from '../utils/money';
import { quincena25Year } from '../utils/dates';
import { calculateQuincena25 } from '../utils/payroll';
import { Icon } from './Icon';
import { AppText, Card } from './ui';

export function Quincena25Card({ currentDay }: { currentDay: string }) {
  const { state } = useBudget();
  const { colors } = useTheme();
  const [breakdownExpanded, setBreakdownExpanded] = useState(false);
  const year = quincena25Year(currentDay);
  const salaryCents = state.payrollSettings.monthlySalaryCents;
  const amountCents = calculateQuincena25(salaryCents);

  return <Card style={{ gap: 16 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Icon name="wallet" color={colors.primary} /><AppText variant="heading">Quincena 25 · {year}</AppText>
    </View>
    <View style={{ gap: 12 }}>
      <View style={{ gap: 4 }}>
        <AppText variant="muted">Monto anual</AppText>
        <AppText style={{ color: colors.primary, fontSize: 26, lineHeight: 32, fontWeight: '700' }}>{money(amountCents)}</AppText>
      </View>
      <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden' }}>
        <Pressable accessibilityRole="button" accessibilityLabel={`${breakdownExpanded ? 'Ocultar' : 'Mostrar'} desglose de la Quincena 25`}
          accessibilityState={{ expanded: breakdownExpanded }} aria-expanded={breakdownExpanded}
          onPress={() => setBreakdownExpanded(value => !value)}
          style={{ minHeight: 54, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <AppText style={{ flex: 1, fontWeight: '600', fontSize: 13 }}>Desglose de la Quincena 25</AppText>
          <View style={{ transform: [{ rotate: breakdownExpanded ? '180deg' : '0deg' }] }}>
            <Icon name="down" color={colors.muted} size={17} />
          </View>
        </Pressable>
        {breakdownExpanded && <View style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 9 }}>
          <AmountRow label="Sueldo mensual bruto" value={money(salaryCents)} />
          <View style={{ borderTopWidth: 1, borderColor: colors.border, paddingTop: 9, marginTop: 2 }}>
            <AmountRow label="Cálculo" value={`${money(salaryCents)} ÷ 2`} strong />
          </View>
          <AppText variant="muted" style={{ fontSize: 12 }}>Pago anual del 15 al 25 de enero de {year}.</AppText>
        </View>}
      </View>
    </View>
    <AppText variant="muted" style={{ fontSize: 12 }}>Es una estimación basada en el sueldo mensual bruto guardado. Se actualiza automáticamente y no se registra como ingreso.</AppText>
  </Card>;
}

function AmountRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  const { colors } = useTheme();
  return <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
    <AppText style={{ flex: 1, fontSize: 13, fontWeight: strong ? '600' : '400' }}>{label}</AppText>
    <AppText style={{ color: strong ? colors.primary : colors.text, fontSize: 13, fontWeight: strong ? '700' : '500' }}>{value}</AppText>
  </View>;
}
