import React, { useState } from 'react';
import { View } from 'react-native';
import { useBudget } from '../context/BudgetContext';
import { ThemeMode } from '../types/budget';
import { useTheme } from '../theme/useTheme';
import { salaryAt } from '../utils/budget';
import { fortnight, rangeLabel } from '../utils/dates';
import { money, moneyInput, parseMoney } from '../utils/money';
import { AppText, Button, Card, Field, Screen, ScreenHeader, Segmented } from '../components/ui';
import { Icon } from '../components/Icon';
import { PaymentScheduleCard } from '../components/PaymentScheduleCard';
import { AnnualBonusCard } from '../components/AnnualBonusCard';
import { useToday } from '../hooks/useToday';
import { BRAND } from '../config/brand';

const themeOptions: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Claro' }, { value: 'dark', label: 'Oscuro' }, { value: 'system', label: 'Sistema' },
];

export function SettingsScreen() {
  const { state, dispatch } = useBudget();
  const { colors, isDark } = useTheme();
  const currentDay = useToday();
  const currentRange = fortnight(currentDay);
  const currentSalary = salaryAt(state.salaryHistory, currentRange.start);
  const [salary, setSalary] = useState(() => moneyInput(currentSalary));
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  function saveSalary() {
    const amountCents = parseMoney(salary);
    if (amountCents === null) { setSaved(false); return setError('Ingresa un sueldo válido, con máximo dos decimales.'); }
    dispatch({ type: 'SET_SALARY', entry: { from: currentRange.start, amountCents } });
    setError('');
    setSaved(true);
  }

  return <Screen>
    <ScreenHeader title="A tu medida." subtitle="Tu sueldo, tu estilo y tu forma de organizarte." />
    <Card style={{ gap: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Icon name="wallet" color={colors.primary} /><AppText variant="heading">Sueldo quincenal</AppText></View>
      <AppText variant="muted">Configura el ingreso con el que calcularás el saldo de cada quincena.</AppText>
      <Field label="Sueldo quincenal (USD)" value={salary} onChangeText={value => { setSalary(value); setSaved(false); setError(''); }}
        keyboardType="decimal-pad" maxLength={9} placeholder="300.00" />
      <Button title="Guardar sueldo" icon="check" onPress={saveSalary} />
      {!!error && <AppText accessibilityRole="alert" style={{ color: colors.danger }}>{error}</AppText>}
      {saved && <AppText accessibilityRole="alert" style={{ color: colors.success }}>Sueldo actualizado a {money(currentSalary)}.</AppText>}
      <View style={{ padding: 13, backgroundColor: colors.surfaceAlt, borderRadius: 13, gap: 4 }}>
        <AppText style={{ fontSize: 12, fontWeight: '600' }}>Aplica desde la quincena actual</AppText>
        <AppText variant="muted" style={{ fontSize: 11 }}>{rangeLabel(currentRange)}. Los saldos de quincenas anteriores conservan su sueldo.</AppText>
      </View>
    </Card>
    <PaymentScheduleCard currentDay={currentDay} />
    <AnnualBonusCard currentDay={currentDay} />
    <Card style={{ gap: 17 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Icon name={isDark ? 'moon' : 'sun'} color={colors.primary} /><AppText variant="heading">Apariencia</AppText></View>
      <AppText variant="muted">Elige un tema o deja que siga la apariencia de tu teléfono.</AppText>
      <Segmented options={themeOptions} value={state.themeMode} onChange={mode => dispatch({ type: 'SET_THEME', mode })} />
    </Card>
    <Card style={{ gap: 16 }}>
      <AppText variant="heading">Pequeños detalles</AppText>
      <View style={{ gap: 5 }}><AppText style={{ fontSize: 13, fontWeight: '600' }}>Quincenas</AppText><AppText variant="muted">Del 1 al 14 y del 15 al último día del mes. El saldo se calcula dentro de cada período, sin arrastrarlo a la siguiente quincena.</AppText></View>
      <View style={{ gap: 5 }}><AppText style={{ fontSize: 13, fontWeight: '600' }}>Tus datos en este dispositivo</AppText><AppText variant="muted">Los gastos, categorías y ajustes se guardan localmente. No requieren una cuenta ni conexión para usarlos. Desinstalar la app elimina estos datos.</AppText></View>
      <View style={{ gap: 5 }}><AppText style={{ fontSize: 13, fontWeight: '600' }}>Historial semanal</AppText><AppText variant="muted">Cada semana comienza el lunes y termina el domingo.</AppText></View>
    </Card>
    <AppText variant="label" style={{ textAlign: 'center', paddingVertical: 6 }}>{BRAND.wordmark} · VERSIÓN {BRAND.version}</AppText>
  </Screen>;
}
