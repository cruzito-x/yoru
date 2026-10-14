import React from 'react';
import { View } from 'react-native';
import { useBudget } from '../context/BudgetContext';
import { useTheme } from '../theme/useTheme';
import { money } from '../utils/money';
import { annualBonusSalaryDays, calculateAnnualBonus } from '../utils/payroll';
import { Icon } from './Icon';
import { AppText, Card } from './ui';

export function AnnualBonusCard({ currentDay }: { currentDay: string }) {
  const { state } = useBudget();
  const { colors } = useTheme();
  const year = Number(currentDay.slice(0, 4));
  const salaryCents = state.payrollSettings.monthlySalaryCents;
  const days = annualBonusSalaryDays(state.payrollSettings.serviceMonths);
  const amountCents = calculateAnnualBonus(state.payrollSettings);

  return <Card style={{ gap: 16 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Icon name="wallet" color={colors.primary} /><AppText variant="heading">Aguinaldo estimado · {year}</AppText>
    </View>
    <AppText variant="muted">{money(salaryCents)} de sueldo mensual ÷ 30 × {days} días.</AppText>
    <View style={{ backgroundColor: colors.surfaceAlt, padding: 13, borderRadius: 13, gap: 4 }}>
      <AppText style={{ fontSize: 12, fontWeight: days === 15 ? '700' : '400' }}>1 a menos de 3 años: 15 días de salario</AppText>
      <AppText style={{ fontSize: 12, fontWeight: days === 19 ? '700' : '400' }}>3 a menos de 10 años: 19 días de salario</AppText>
      <AppText style={{ fontSize: 12, fontWeight: days === 21 ? '700' : '400' }}>10 años o más: 21 días de salario</AppText>
    </View>
    <View style={{ backgroundColor: colors.surfaceAlt, padding: 16, borderRadius: 14, gap: 4 }}>
      <AppText variant="muted">Resultado calculado</AppText>
      <AppText style={{ fontSize: 24, fontWeight: '700', color: colors.primary }}>{money(amountCents)}</AppText>
    </View>
    <AppText variant="muted" style={{ fontSize: 12 }}>Es una estimación basada en la planilla y antigüedad configuradas. Se actualiza automáticamente y no se registra como ingreso.</AppText>
  </Card>;
}
