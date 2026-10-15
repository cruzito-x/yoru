import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, View } from 'react-native';
import { useBudget } from '../context/BudgetContext';
import { useTheme } from '../theme/useTheme';
import { PaymentDay, PaymentSchedule } from '../types/budget';
import { readableDate } from '../utils/dates';
import { isValidPaymentSchedule, paymentDayLabel, upcomingPayments } from '../utils/payments';
import { Calendar } from './Calendar';
import { Icon } from './Icon';
import { AppText, Button, Card, Field, Segmented } from './ui';
import { ConfirmAction } from './ModalSheet';

const dayInput = (day: PaymentDay) => day === 'last' ? '' : String(day);

export function PaymentScheduleCard({ currentDay }: { currentDay: string }) {
  const { state, dispatch } = useBudget();
  const { colors } = useTheme();
  const [first, setFirst] = useState(dayInput(state.paymentSchedule?.first ?? 15));
  const [second, setSecond] = useState(dayInput(state.paymentSchedule?.second ?? 'last'));
  const [secondUsesLastDay, setSecondUsesLastDay] = useState(state.paymentSchedule?.second === 'last' || !state.paymentSchedule);
  const [activeSlot, setActiveSlot] = useState<'first' | 'second'>('first');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const savedOpacity = useRef(new Animated.Value(0)).current;
  const [upcomingExpanded, setUpcomingExpanded] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const candidate: PaymentSchedule = { first: /^\d{1,2}$/.test(first) ? Number(first) : 0,
    second: secondUsesLastDay ? 'last' : /^\d{1,2}$/.test(second) ? Number(second) : 0 };
  const draft = isValidPaymentSchedule(candidate) ? candidate : null;
  const upcoming = upcomingPayments(state.paymentSchedule, currentDay);
  const dirty = !!state.paymentSchedule && (candidate.first !== state.paymentSchedule.first || candidate.second !== state.paymentSchedule.second);

  useEffect(() => {
    if (!saved) {
      savedOpacity.setValue(0);
      return;
    }
    savedOpacity.setValue(1);
    let fadeOut: Animated.CompositeAnimation | undefined;
    const timeout = setTimeout(() => {
      fadeOut = Animated.timing(savedOpacity, { toValue: 0, duration: 500, useNativeDriver: Platform.OS !== 'web' });
      fadeOut.start(({ finished }) => { if (finished) setSaved(false); });
    }, 10_000);
    return () => {
      clearTimeout(timeout);
      fadeOut?.stop();
    };
  }, [saved, savedOpacity]);

  function changed() { setSaved(false); setError(''); }
  function save() {
    if (!draft) return setError('Elige dos días del 1 al 31, en orden y separados por al menos 3 días, también entre meses. Así evitamos que ambos pagos caigan en el mismo viernes.');
    setConfirmSave(true);
  }
  function saveConfirmed() {
    if (!draft) return;
    dispatch({ type: 'SET_PAYMENT_SCHEDULE', schedule: draft });
    setSaved(true); setError(''); setConfirmSave(false);
  }
  function deactivateConfirmed() {
    dispatch({ type: 'SET_PAYMENT_SCHEDULE', schedule: null });
    setConfirmDeactivate(false); changed();
  }

  return <Card style={{ gap: 17 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Icon name="calendar" color={colors.primary} /><AppText variant="heading">Dos pagos al mes</AppText></View>
    <AppText variant="muted">Elige tus dos días habituales. Se repetirán cada mes; sábado y domingo se adelantan al viernes.</AppText>
    {!!state.nextPaymentDate && <AppText variant="muted">Antes marcaste {readableDate(state.nextPaymentDate)}. Confirma ambos días para activar la repetición.</AppText>}
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <View style={{ flex: 1 }}><Field label="Día del primer pago" value={first} keyboardType="number-pad" maxLength={2} placeholder="15"
        style={activeSlot === 'first' ? { borderColor: colors.primary, borderWidth: 2 } : undefined}
        onFocus={() => setActiveSlot('first')} onChangeText={value => { setFirst(value); changed(); }} /></View>
      <View style={{ flex: 1 }}><Field label="Día del segundo pago" value={secondUsesLastDay ? '' : second} keyboardType="number-pad" maxLength={2}
        placeholder={secondUsesLastDay ? 'Último día' : '30'} editable={!secondUsesLastDay}
        style={activeSlot === 'second' ? { borderColor: colors.primary, borderWidth: 2 } : undefined}
        onFocus={() => setActiveSlot('second')} onChangeText={value => { setSecond(value); changed(); }} /></View>
    </View>
    <AppText style={{ fontSize: 13, fontWeight: '600' }}>¿Qué pago quieres ajustar en el calendario?</AppText>
    <Segmented options={[{ value: 'first', label: 'Primer pago' }, { value: 'second', label: 'Segundo pago' }]}
      value={activeSlot} onChange={setActiveSlot} />
    {activeSlot === 'second' && <>
      <AppText style={{ fontSize: 13, fontWeight: '600' }}>¿Cómo quieres definir el segundo pago?</AppText>
      <Segmented options={[{ value: 'number', label: 'Día fijo' }, { value: 'last', label: 'Fin de mes' }]}
        value={secondUsesLastDay ? 'last' : 'number'} onChange={value => { setSecondUsesLastDay(value === 'last'); if (value === 'number' && !second) setSecond('30'); changed(); }} />
      <AppText variant="muted" style={{ fontSize: 12 }}>
        {secondUsesLastDay ? 'El segundo pago se ajustará al último día de cada mes.' : `El segundo pago se repetirá el día ${second || 'que elijas'} de cada mes.`}
      </AppText>
    </>}
    <AppText variant="muted" style={{ fontSize: 12 }}>Toca una fecha para cambiar el {activeSlot === 'first' ? 'primer' : 'segundo'} pago. Esta selección se repetirá cada mes.</AppText>
    <Calendar currentDay={currentDay} schedule={draft} onSelect={date => {
      if (activeSlot === 'first') setFirst(String(Number(date.slice(8))));
      else { setSecond(String(Number(date.slice(8)))); setSecondUsesLastDay(false); }
      changed();
    }} />
    <AppText variant="muted" style={{ fontSize: 11 }}>Vista previa de tus días. Si eliges 29, 30 o 31, en meses más cortos se usará el último día.</AppText>
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Button title="Guardar calendario" icon="check" onPress={save} />
      </View>
      {!!state.paymentSchedule && <View style={{ flex: 1, minWidth: 0 }}>
        <Button title="Desactivar calendario" icon="close" variant="danger" onPress={() => setConfirmDeactivate(true)} />
      </View>}
    </View>
    {!!error && <AppText accessibilityRole="alert" style={{ color: colors.danger }}>{error}</AppText>}
    {saved && <Animated.View style={{ opacity: savedOpacity }}>
      <AppText accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ color: colors.success, fontSize: 13 }}>
        Calendario guardado. Los próximos pagos se actualizan automáticamente.
      </AppText>
    </Animated.View>}
    {dirty && <AppText variant="muted" style={{ fontSize: 12 }}>Tienes cambios sin guardar. La lista siguiente usa tu calendario guardado.</AppText>}
    {!!state.paymentSchedule && <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden' }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${upcomingExpanded ? 'Ocultar' : 'Mostrar'} próximos pagos`}
        accessibilityState={{ expanded: upcomingExpanded }} aria-expanded={upcomingExpanded}
        onPress={() => setUpcomingExpanded(value => !value)}
        style={{ minHeight: 62, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <AppText style={{ fontWeight: '600', fontSize: 13 }}>Próximos pagos</AppText>
          <AppText variant="muted" style={{ fontSize: 12 }}>{upcoming[0] ? `Próximo: ${readableDate(upcoming[0].paymentDate)}` : 'Consulta tus siguientes fechas de pago'}</AppText>
        </View>
        <View style={{ transform: [{ rotate: upcomingExpanded ? '180deg' : '0deg' }] }}>
          <Icon name="down" color={colors.muted} size={17} />
        </View>
      </Pressable>
      {upcomingExpanded && <View style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 8 }}>
        <AppText style={{ color: colors.primary, fontSize: 12 }}>{paymentDayLabel(state.paymentSchedule.first)} y {paymentDayLabel(state.paymentSchedule.second).toLowerCase()}</AppText>
        {upcoming.map((payment, index) => <View key={payment.nominalDate} style={{ gap: 1 }}>
          <AppText style={{ color: colors.primary, fontSize: 13, fontWeight: index === 0 ? '700' : '500' }}>{readableDate(payment.paymentDate)}</AppText>
          {payment.paymentDate !== payment.nominalDate && <AppText variant="muted" style={{ fontSize: 11 }}>Se adelanta del {readableDate(payment.nominalDate, true)} al viernes.</AppText>}
        </View>)}
      </View>}
    </View>}
    <ConfirmAction visible={confirmSave} title="¿Guardar calendario de pagos?"
      description={`Se repetirán el día ${draft?.first ?? candidate.first} y ${secondUsesLastDay ? 'el último día del mes' : `el día ${second}`} cada mes. Si un pago cae en fin de semana, se adelantará al viernes.`}
      confirmTitle="Sí, guardar calendario" onCancel={() => setConfirmSave(false)} onConfirm={saveConfirmed} />
    <ConfirmAction visible={confirmDeactivate} title="¿Desactivar calendario de pagos?"
      description="Dejarás de ver las próximas fechas calculadas. Tus gastos y quincenas presupuestadas no cambiarán."
      confirmTitle="Sí, desactivar" confirmVariant="primary" cancelVariant="danger"
      onCancel={() => setConfirmDeactivate(false)} onConfirm={deactivateConfirmed} />
    <AppText variant="muted" style={{ fontSize: 11 }}>El calendario calcula las fechas de cobro. El presupuesto mantiene sus quincenas del 1 al 14 y del 15 al fin de mes.</AppText>
  </Card>;
}
