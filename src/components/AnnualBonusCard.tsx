import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useBudget } from '../context/BudgetContext';
import { useTheme } from '../theme/useTheme';
import { money } from '../utils/money';
import { annualBonusSalaryDays, calculateAnnualBonus } from '../utils/payroll';
import { Icon } from './Icon';
import { AppText, Card } from './ui';

export function AnnualBonusCard({ currentDay }: { currentDay: string }) {
  const { state } = useBudget();
  const { colors } = useTheme();
  const [breakdownExpanded, setBreakdownExpanded] = useState(false);
  const year = Number(currentDay.slice(0, 4));
  const salaryCents = state.payrollSettings.monthlySalaryCents;
  const days = annualBonusSalaryDays(state.payrollSettings.serviceMonths);
  const amountCents = calculateAnnualBonus(state.payrollSettings);

  return <Card style={{ gap: 16 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Icon name="wallet" color={colors.primary} /><AppText variant="heading">Aguinaldo · {year}</AppText>
    </View>
    <View style={{ gap: 4 }}>
      <AppText variant="muted">Monto estimado</AppText>
      <AppText style={{ fontSize: 26, lineHeight: 32, fontWeight: '700', color: colors.primary }}>{money(amountCents)}</AppText>
    </View>
    <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden' }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${breakdownExpanded ? 'Ocultar' : 'Mostrar'} desglose estimado del aguinaldo`}
        accessibilityState={{ expanded: breakdownExpanded }} aria-expanded={breakdownExpanded}
        onPress={() => setBreakdownExpanded(value => !value)}
        style={{ minHeight: 54, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <AppText style={{ flex: 1, fontWeight: '600', fontSize: 13 }}>Desglose estimado del aguinaldo</AppText>
        <Icon name={breakdownExpanded ? 'up' : 'down'} color={colors.muted} size={17} />
      </Pressable>
      {breakdownExpanded && <View style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 9 }}>
        <AmountRow label="Sueldo mensual" value={money(salaryCents)} />
        <AmountRow label="Días según antigüedad" value={`${days} días`} />
        <View style={{ borderTopWidth: 1, borderColor: colors.border, paddingTop: 9, marginTop: 2 }}>
          <AmountRow label="Cálculo" value={`${money(salaryCents)} ÷ 30 × ${days}`} strong />
        </View>
        <View style={{ gap: 5, paddingTop: 4 }}>
          <AppText variant="muted" style={{ fontSize: 12 }}>Tramos según antigüedad</AppText>
          <AppText style={{ fontSize: 12, fontWeight: days === 15 ? '700' : '400' }}>1 a menos de 3 años: 15 días de salario</AppText>
          <AppText style={{ fontSize: 12, fontWeight: days === 19 ? '700' : '400' }}>3 a menos de 10 años: 19 días de salario</AppText>
          <AppText style={{ fontSize: 12, fontWeight: days === 21 ? '700' : '400' }}>10 años o más: 21 días de salario</AppText>
        </View>
      </View>}
    </View>
    <AppText variant="muted" style={{ fontSize: 12 }}>Es una estimación basada en la planilla y antigüedad configuradas. Se actualiza automáticamente y no se registra como ingreso.</AppText>
  </Card>;
}

function AmountRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  const { colors } = useTheme();
  return <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
    <AppText style={{ flex: 1, fontSize: 13, fontWeight: strong ? '600' : '400' }}>{label}</AppText>
    <AppText style={{ color: strong ? colors.primary : colors.text, fontSize: 13, fontWeight: strong ? '700' : '500' }}>{value}</AppText>
  </View>;
}
