import React from 'react';
import { View } from 'react-native';
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
  const year = quincena25Year(currentDay);
  const salaryCents = state.payrollSettings.monthlySalaryCents;
  const amountCents = calculateQuincena25(salaryCents);

  return <Card style={{ gap: 16 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Icon name="wallet" color={colors.primary} /><AppText variant="heading">Quincena 25 estimada · {year}</AppText>
    </View>
    <AppText variant="muted">Pago anual del 15 al 25 de enero de {year}. Equivale a la mitad del sueldo mensual bruto: {money(salaryCents)} ÷ 2.</AppText>
    <View style={{ backgroundColor: colors.surfaceAlt, padding: 16, borderRadius: 14, gap: 4 }}>
      <AppText variant="muted">Resultado calculado</AppText>
      <AppText style={{ fontSize: 24, fontWeight: '700', color: colors.primary }}>{money(amountCents)}</AppText>
    </View>
    <AppText variant="muted" style={{ fontSize: 12 }}>Es una estimación basada en el sueldo mensual bruto guardado. Se actualiza automáticamente y no se registra como ingreso.</AppText>
  </Card>;
}
