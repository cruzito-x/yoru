import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useBudget } from '../context/BudgetContext';
import { useTheme } from '../theme/useTheme';
import { money, moneyInput, parseMoney, sanitizeMoneyInput } from '../utils/money';
import { calculateFortnightPayroll, isValidPayrollSettings } from '../utils/payroll';
import { fortnight } from '../utils/dates';
import { Icon } from './Icon';
import { AppText, Button, Card, Field, Segmented } from './ui';
import { ConfirmAction } from './ModalSheet';

const incomeTabs: { value: 'income' | 'payroll'; label: string }[] = [
  { value: 'income', label: 'Ingresos' },
  { value: 'payroll', label: 'Planilla' },
];

export function PayrollCard({ currentDay }: { currentDay: string }) {
  const range = fortnight(currentDay);
  return <IncomeForm key={range.start} />;
}

function IncomeForm() {
  const { state, dispatch } = useBudget();
  const { colors } = useTheme();
  const [tab, setTab] = useState<'income' | 'payroll'>('income');
  const [salary, setSalary] = useState(() => moneyInput(state.payrollSettings.monthlySalaryCents));
  const [travel, setTravel] = useState(() => moneyInput(state.payrollSettings.travelAllowanceCents));
  const [years, setYears] = useState(() => String(Math.floor(state.payrollSettings.serviceMonths / 12)));
  const [months, setMonths] = useState(() => String(state.payrollSettings.serviceMonths % 12));
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);
  const [allowanceExpanded, setAllowanceExpanded] = useState(false);
  const [tenureExpanded, setTenureExpanded] = useState(false);
  const [breakdownExpanded, setBreakdownExpanded] = useState(false);
  const salaryCents = parseMoney(salary);
  const travelCents = parseMoney(travel);
  const validYears = /^\d{1,3}$/.test(years);
  const validMonths = /^\d{1,2}$/.test(months) && Number(months) < 12;
  const draft = {
    monthlySalaryCents: salaryCents ?? 0,
    serviceMonths: Number(years) * 12 + Number(months),
    travelAllowanceCents: travelCents ?? 0,
  };
  const valid = validYears && validMonths && salaryCents !== null && travelCents !== null
    && isValidPayrollSettings(draft);
  const payroll = salaryCents !== null && salaryCents > 0
    ? calculateFortnightPayroll(salaryCents) : null;
  const travelPerFortnightCents = Math.round((travelCents ?? 0) / 2);
  const totalIncome = (payroll?.netCents ?? 0) + travelPerFortnightCents;
  const tenureSummary = `${years} ${Number(years) === 1 ? 'año' : 'años'} · ${months} ${Number(months) === 1 ? 'mes' : 'meses'}`;
  const dirty = !valid || draft.monthlySalaryCents !== state.payrollSettings.monthlySalaryCents
    || draft.serviceMonths !== state.payrollSettings.serviceMonths
    || draft.travelAllowanceCents !== state.payrollSettings.travelAllowanceCents;

  function change(setter: (value: string) => void, value: string) {
    setter(value); setError(''); setSaved(false);
  }

  function save() {
    setSaved(false);
    if (salaryCents === null || salaryCents <= 0) return setError('Ingresa un sueldo mensual válido, con máximo dos decimales.');
    if (travelCents === null) return setError('Ingresa viáticos válidos, con máximo dos decimales.');
    if (!validYears || !validMonths) return setError('Ingresa años completos y de 0 a 11 meses adicionales.');
    if (!isValidPayrollSettings(draft)) return setError('Estas reglas requieren una antigüedad de 1 a 100 años.');
    setConfirmSave(true);
  }

  function saveConfirmed() {
    dispatch({ type: 'SET_PAYROLL', settings: draft });
    setError(''); setSaved(true); setConfirmSave(false);
  }

  return <Card testID="income-settings" style={{ gap: 16 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Icon name="wallet" color={colors.primary} /><AppText variant="heading">Ingresos y planilla</AppText>
    </View>
    <Segmented options={incomeTabs} value={tab} onChange={setTab} />
    {tab === 'income' ? <View style={{ gap: 14 }}>
      {payroll && <View style={{ gap: 12 }}>
        <View style={{ gap: 4 }}>
          <AppText variant="muted">Disponible por quincena</AppText>
          <AppText style={{ color: colors.primary, fontSize: 26, fontWeight: '700' }}>{money(totalIncome)}</AppText>
        </View>
        <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden' }}>
          <Pressable accessibilityRole="button" accessibilityLabel={`${breakdownExpanded ? 'Ocultar' : 'Mostrar'} desglose quincenal`}
            accessibilityState={{ expanded: breakdownExpanded }} aria-expanded={breakdownExpanded}
            onPress={() => setBreakdownExpanded(value => !value)}
            style={{ minHeight: 54, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <AppText style={{ flex: 1, fontWeight: '600', fontSize: 13 }}>Desglose estimado por quincena</AppText>
            <View style={{ transform: [{ rotate: breakdownExpanded ? '180deg' : '0deg' }] }}>
              <Icon name="down" color={colors.muted} size={17} />
            </View>
          </Pressable>
          {breakdownExpanded && <View style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 9 }}>
            <AmountRow label="Salario bruto" amount={payroll.grossCents} />
            <AmountRow label="AFP · 7.25%" amount={-payroll.afpCents} />
            <AmountRow label="ISSS · 3%" amount={-payroll.isssCents} />
            <AmountRow label="Renta" amount={-payroll.incomeTaxCents} />
            <AmountRow label="Planilla neta" amount={payroll.netCents} strong />
            <AmountRow label="Viáticos libres de impuestos" amount={travelPerFortnightCents} />
            <View style={{ borderTopWidth: 1, borderColor: colors.border, paddingTop: 10, marginTop: 2 }}>
              <AmountRow label="Total disponible para tu presupuesto" amount={totalIncome} strong />
            </View>
          </View>}
        </View>
      </View>}
    </View> : <View style={{ gap: 16 }}>
      <Field label="Sueldo mensual bruto en planilla (USD)" value={salary} keyboardType="decimal-pad" maxLength={9}
        placeholder="500.00" hint="Antes de descuentos; base del aguinaldo y la Quincena 25."
        onChangeText={value => change(setSalary, sanitizeMoneyInput(value))} />
      <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden' }}>
        <Pressable accessibilityRole="button" accessibilityLabel={`${allowanceExpanded ? 'Ocultar' : 'Mostrar'} detalle de viáticos`}
          accessibilityState={{ expanded: allowanceExpanded }} aria-expanded={allowanceExpanded}
          onPress={() => setAllowanceExpanded(value => !value)}
          style={{ minHeight: 58, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText style={{ fontWeight: '600', fontSize: 13 }}>Viáticos libres de impuestos</AppText>
            <AppText variant="muted" style={{ fontSize: 12 }}>{money(travelCents ?? 0)} al mes · {money(travelPerFortnightCents)} por quincena</AppText>
          </View>
          <View style={{ transform: [{ rotate: allowanceExpanded ? '180deg' : '0deg' }] }}>
            <Icon name="down" color={colors.muted} size={17} />
          </View>
        </Pressable>
        {allowanceExpanded && <View style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 8 }}>
          <Field label="Viáticos mensuales (USD)" value={travel} keyboardType="decimal-pad" maxLength={9}
            placeholder="150.00" hint="Se reparten entre tus dos quincenas y se suman después de los descuentos."
            onChangeText={value => change(setTravel, sanitizeMoneyInput(value))} />
        </View>}
      </View>
      <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden' }}>
        <Pressable accessibilityRole="button" accessibilityLabel={`${tenureExpanded ? 'Ocultar' : 'Mostrar'} antigüedad para el aguinaldo`}
          accessibilityState={{ expanded: tenureExpanded }} aria-expanded={tenureExpanded}
          onPress={() => setTenureExpanded(value => !value)}
          style={{ minHeight: 58, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText style={{ fontWeight: '600', fontSize: 13 }}>Antigüedad para el aguinaldo</AppText>
            <AppText variant="muted" style={{ fontSize: 12 }}>{tenureSummary}</AppText>
          </View>
          <View style={{ transform: [{ rotate: tenureExpanded ? '180deg' : '0deg' }] }}>
            <Icon name="down" color={colors.muted} size={17} />
          </View>
        </Pressable>
        {tenureExpanded && <View style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}><Field label="Años de servicio" value={years} keyboardType="number-pad" maxLength={3}
              onChangeText={value => change(setYears, value)} /></View>
            <View style={{ flex: 1 }}><Field label="Meses adicionales" value={months} keyboardType="number-pad" maxLength={2}
              onChangeText={value => change(setMonths, value)} /></View>
          </View>
        </View>}
      </View>
    </View>}
    {tab === 'payroll' && <>
      <Button title="Guardar planilla" icon="check" onPress={save} />
      <ConfirmAction visible={confirmSave} title="¿Guardar datos de planilla?"
        description={`Se guardará un sueldo bruto mensual de ${money(salaryCents ?? 0)} y ${money(travelCents ?? 0)} de viáticos. Los cálculos de ingreso neto y aguinaldo se actualizarán automáticamente.`}
        confirmTitle="Sí, guardar planilla" onCancel={() => setConfirmSave(false)} onConfirm={saveConfirmed} />
      {!!error && <AppText accessibilityRole="alert" style={{ color: colors.danger }}>{error}</AppText>}
      {saved && !dirty && <AppText accessibilityRole="alert" style={{ color: colors.success }}>Planilla guardada.</AppText>}
      {dirty && <AppText variant="muted" style={{ fontSize: 12 }}>Tienes cambios sin guardar.</AppText>}
    </>}
  </Card>;
}

function AmountRow({ label, amount, strong = false }: { label: string; amount: number; strong?: boolean }) {
  const { colors } = useTheme();
  return <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
    <AppText style={{ flex: 1, fontSize: 13, fontWeight: strong ? '600' : '400' }}>{label}</AppText>
    <AppText style={{ color: strong ? colors.primary : colors.text, fontSize: 13, fontWeight: strong ? '700' : '500' }}>
      {amount < 0 ? `−${money(-amount)}` : money(amount)}
    </AppText>
  </View>;
}
