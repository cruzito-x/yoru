import React from 'react';
import { View } from 'react-native';
import { useBudget } from '../context/BudgetContext';
import { ThemeMode } from '../types/budget';
import { useTheme } from '../theme/useTheme';
import { AppText, Card, Screen, ScreenHeader, Segmented } from '../components/ui';
import { Icon } from '../components/Icon';
import { PaymentScheduleCard } from '../components/PaymentScheduleCard';
import { PayrollCard } from '../components/PayrollCard';
import { SpecialIncomeTabs } from '../components/SpecialIncomeTabs';
import { FixedExpensesCard } from '../components/FixedExpensesCard';
import { useToday } from '../hooks/useToday';
import { BRAND } from '../config/brand';
import { AppFooter } from '../components/AppFooter';

const themeOptions: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Claro' }, { value: 'dark', label: 'Oscuro' }, { value: 'system', label: 'Sistema' },
];

export function SettingsScreen() {
  const { state, dispatch } = useBudget();
  const { colors, isDark } = useTheme();
  const currentDay = useToday();

  return <Screen>
    <ScreenHeader subtitle="Tu sueldo, tu estilo y tu forma de organizarte." />
    <PayrollCard currentDay={currentDay} />
    <PaymentScheduleCard currentDay={currentDay} />
    <SpecialIncomeTabs currentDay={currentDay} />
    <FixedExpensesCard />
    <Card style={{ gap: 17 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Icon name={isDark ? 'moon' : 'sun'} color={colors.primary} /><AppText variant="heading">Apariencia</AppText></View>
      <AppText variant="muted">Elige un tema o deja que siga la apariencia de tu teléfono.</AppText>
      <Segmented options={themeOptions} value={state.themeMode} onChange={mode => dispatch({ type: 'SET_THEME', mode })} />
    </Card>
    <View style={{ alignItems: 'center', gap: 2, paddingVertical: 6 }}>
      <AppText variant="label">{BRAND.wordmark} · VERSIÓN {BRAND.version}</AppText>
      <AppFooter />
    </View>
  </Screen>;
}
