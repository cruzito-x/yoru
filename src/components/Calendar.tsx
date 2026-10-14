import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { PaymentSchedule } from '../types/budget';
import { calendarDays, localDate, movePeriod, readableDate } from '../utils/dates';
import { calendarPayments } from '../utils/payments';
import { AppText, IconButton } from './ui';

interface CalendarProps {
  currentDay: string;
  schedule: PaymentSchedule | null;
  onSelect: (date: string) => void;
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function Calendar({ currentDay, schedule, onSelect }: CalendarProps) {
  const { colors } = useTheme();
  const currentMonth = currentDay.slice(0, 7) + '-01';
  const [month, setMonth] = useState(currentMonth);
  useEffect(() => { setMonth(value => value < currentMonth ? currentMonth : value); }, [currentMonth]);
  const monthLabel = localDate(month).toLocaleDateString('es-SV', { month: 'long', year: 'numeric' });
  const payments = calendarPayments(schedule, month);
  const days = calendarDays(month);
  const weeks = Array.from({ length: days.length / 7 }, (_, index) => days.slice(index * 7, index * 7 + 7));

  return <View style={{ gap: 12 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <IconButton name="left" label="Mes anterior del calendario" disabled={month <= currentMonth} onPress={() => setMonth(movePeriod('month', month, -1))} />
      <AppText style={{ flex: 1, textAlign: 'center', fontWeight: '600' }}>{monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}</AppText>
      <IconButton name="right" label="Mes siguiente del calendario" disabled={month >= '2100-12-01'} onPress={() => setMonth(movePeriod('month', month, 1))} />
    </View>
    <View style={styles.week}>
      {WEEKDAYS.map(name => <View key={name} style={styles.dayHeading}>
        <AppText variant="label" maxFontSizeMultiplier={1.2} style={{ fontSize: 10, letterSpacing: 0 }}>{name}</AppText>
      </View>)}
    </View>
    {/* Cada semana tiene siete celdas con el mismo espacio. Así el domingo
        nunca salta de fila por el redondeo de anchos porcentuales. */}
    <View>
      {weeks.map(week => <View key={week[0]} style={styles.week}>
      {week.map(date => {
        const selected = payments.some(payment => payment.paymentDate === date);
        const nominal = payments.some(payment => payment.nominalDate === date);
        const disabled = date < '1900-01-01' || date > '2100-12-31';
        const belongsToMonth = date.slice(0, 7) === month.slice(0, 7);
        return <View key={date} style={styles.dayCell}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Seleccionar ${readableDate(date)}`}
            accessibilityHint={selected ? 'Fecha real de cobro' : nominal ? 'Día habitual de pago' : 'Configurar este día del mes'}
            accessibilityState={{ selected, disabled }} aria-selected={selected} aria-disabled={disabled} disabled={disabled}
            onPress={() => { onSelect(date); setMonth(date.slice(0, 7) + '-01'); }}
            style={({ pressed }) => ({ minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 12,
              backgroundColor: selected ? colors.brand : nominal || date === currentDay || pressed ? colors.primarySoft : 'transparent',
              borderWidth: nominal && !selected ? 2 : 0,
              borderColor: nominal && !selected ? colors.primary : 'transparent',
              opacity: disabled ? 0.3 : belongsToMonth ? 1 : 0.55 })}>
            <AppText style={{ fontSize: 13, fontWeight: selected ? '700' : '500', color: selected ? colors.onPrimary : colors.text }}>{Number(date.slice(8, 10))}</AppText>
          </Pressable>
        </View>;
      })}
      </View>)}
    </View>
    <View accessible accessibilityLabel="Fecha de cobro marcada en azul. Día habitual marcado con borde; si cae en fin de semana se adelanta al viernes."
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View accessibilityElementsHidden style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: colors.brand }} />
        <AppText variant="muted" style={{ fontSize: 11 }}>Fecha de cobro</AppText>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View accessibilityElementsHidden style={{ width: 12, height: 12, borderRadius: 4, borderWidth: 2, borderColor: colors.primary }} />
        <AppText variant="muted" style={{ fontSize: 11 }}>Día habitual</AppText>
      </View>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  week: { flexDirection: 'row' },
  dayHeading: { flex: 1, minWidth: 0, alignItems: 'center' },
  dayCell: { flex: 1, minWidth: 0, padding: 2 },
});
