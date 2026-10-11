import React, { useState } from 'react';
import { View } from 'react-native';
import { useBudget } from '../context/BudgetContext';
import { useTheme } from '../theme/useTheme';
import { PaymentDay, PaymentSchedule } from '../types/budget';
import { readableDate } from '../utils/dates';
import { isValidPaymentSchedule, paymentDayLabel, upcomingPayments } from '../utils/payments';
import { Calendar } from './Calendar';
import { Icon } from './Icon';
import { AppText, Button, Card, Field, Segmented } from './ui';

const dayInput = (day: PaymentDay) => day === 'last' ? '' : String(day);

export function PaymentScheduleCard({ currentDay }: { currentDay: string }) {
  const { state, dispatch } = useBudget();
  const { colors } = useTheme();
  const [first, setFirst] = useState(dayInput(state.paymentSchedule?.first ?? 15));
  const [second, setSecond] = useState(dayInput(state.paymentSchedule?.second ?? 'last'));
  const [lastDay, setLastDay] = useState(state.paymentSchedule?.second === 'last' || !state.paymentSchedule);
  const [activeSlot, setActiveSlot] = useState<'first' | 'second'>('first');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const candidate: PaymentSchedule = { first: /^\d{1,2}$/.test(first) ? Number(first) : 0,
    second: lastDay ? 'last' : /^\d{1,2}$/.test(second) ? Number(second) : 0 };
  const draft = isValidPaymentSchedule(candidate) ? candidate : null;
  const upcoming = upcomingPayments(state.paymentSchedule, currentDay);
  const dirty = !!state.paymentSchedule && (candidate.first !== state.paymentSchedule.first || candidate.second !== state.paymentSchedule.second);

  function changed() { setSaved(false); setError(''); }
  function save() {
    if (!draft) return setError('Elige dos días del 1 al 31, en orden y separados por al menos 3 días, también entre meses. Así evitamos que ambos pagos caigan en el mismo viernes.');
    dispatch({ type: 'SET_PAYMENT_SCHEDULE', schedule: draft });
    setSaved(true); setError('');
  }

  return <Card style={{ gap: 17 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Icon name="calendar" color={colors.primary} /><AppText variant="heading">Dos pagos al mes</AppText></View>
    <AppText variant="muted">Elige tus dos días habituales. Se repetirán cada mes; sábado y domingo se adelantan al viernes.</AppText>
    {!!state.nextPaymentDate && <AppText variant="muted">Antes marcaste {readableDate(state.nextPaymentDate)}. Confirma ambos días para activar la repetición.</AppText>}
    <Field label="Día del primer pago" value={first} keyboardType="number-pad" maxLength={2} placeholder="15"
      onChangeText={value => { setFirst(value); changed(); }} />
    <Field label="Día del segundo pago" value={lastDay ? '' : second} keyboardType="number-pad" maxLength={2}
      placeholder={lastDay ? 'Último día del mes' : '30'} editable={!lastDay}
      onChangeText={value => { setSecond(value); changed(); }} />
    <Segmented options={[{ value: 'number', label: 'Día fijo' }, { value: 'last', label: 'Último día' }]}
      value={lastDay ? 'last' : 'number'} onChange={value => { setLastDay(value === 'last'); if (value === 'number' && !second) setSecond('30'); changed(); }} />
    <AppText variant="muted" style={{ fontSize: 12 }}>También puedes tocar un día del calendario para cambiar el pago elegido:</AppText>
    <Segmented options={[{ value: 'first', label: 'Primer pago' }, { value: 'second', label: 'Segundo pago' }]}
      value={activeSlot} onChange={setActiveSlot} />
    <Calendar currentDay={currentDay} schedule={draft} onSelect={date => {
      if (activeSlot === 'first') setFirst(String(Number(date.slice(8))));
      else { setSecond(String(Number(date.slice(8)))); setLastDay(false); }
      changed();
    }} />
    <AppText variant="muted" style={{ fontSize: 11 }}>Vista previa de tus días. Si eliges 29, 30 o 31, en meses más cortos se usará el último día.</AppText>
    <Button title="Guardar calendario de pagos" icon="check" onPress={save} />
    {!!error && <AppText accessibilityRole="alert" style={{ color: colors.danger }}>{error}</AppText>}
    {saved && <AppText accessibilityRole="alert" style={{ color: colors.success, fontSize: 13 }}>Calendario guardado. Los próximos pagos se actualizan automáticamente.</AppText>}
    {dirty && <AppText variant="muted" style={{ fontSize: 12 }}>Tienes cambios sin guardar. La lista siguiente usa tu calendario guardado.</AppText>}
    {!!state.paymentSchedule && <View style={{ backgroundColor: colors.primarySoft, borderRadius: 13, padding: 13, gap: 8 }}>
      <AppText variant="label">PRÓXIMOS PAGOS</AppText>
      <AppText style={{ color: colors.primary, fontSize: 12 }}>{paymentDayLabel(state.paymentSchedule.first)} y {paymentDayLabel(state.paymentSchedule.second).toLowerCase()}</AppText>
      {upcoming.map((payment, index) => <View key={payment.nominalDate} style={{ gap: 1 }}>
        <AppText style={{ color: colors.primary, fontSize: 13, fontWeight: index === 0 ? '700' : '500' }}>{index === 0 ? 'Próximo: ' : ''}{readableDate(payment.paymentDate)}</AppText>
        {payment.paymentDate !== payment.nominalDate && <AppText variant="muted" style={{ fontSize: 11 }}>Adelantado del {readableDate(payment.nominalDate, true)} al viernes.</AppText>}
      </View>)}
    </View>}
    {!!state.paymentSchedule && <Button title="Desactivar calendario de pagos" variant="secondary" onPress={() => {
      dispatch({ type: 'SET_PAYMENT_SCHEDULE', schedule: null }); changed();
    }} />}
    <AppText variant="muted" style={{ fontSize: 11 }}>El calendario calcula las fechas de cobro. El presupuesto mantiene sus quincenas del 1 al 14 y del 15 al fin de mes.</AppText>
  </Card>;
}
