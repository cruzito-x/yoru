import React, { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import DateTimePicker from '@amjed-bouhouch/react-native-ui-datepicker';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { useTheme } from '../theme/useTheme';
import { isValidDate, localDate, readableDate } from '../utils/dates';
import { Icon } from './Icon';
import { AppText } from './ui';

// El formulario trabaja con una fecha local AAAA-MM-DD, nunca con UTC.
// Elegir una fecha solo cambia el formulario; el gasto se guarda al confirmar.
export function ExpenseDatePicker({ value, onChange, label = 'Fecha del gasto', minDate = '1900-01-01', maxDate = '2100-12-31', disabled = false }: {
  value: string; onChange: (value: string) => void; label?: string; minDate?: string; maxDate?: string; disabled?: boolean;
}) {
  const { colors, isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const isOpen = open && !disabled;

  return <View style={styles.field}>
    <AppText style={styles.label}>{label}</AppText>
    <Pressable accessibilityRole="button" accessibilityLabel={`Seleccionar ${label.toLowerCase()}`}
      accessibilityHint={`Fecha actual: ${readableDate(value)}. Abre el calendario.`}
      accessibilityState={{ expanded: isOpen, disabled }} aria-expanded={isOpen} aria-disabled={disabled} disabled={disabled}
      onPress={() => { Keyboard.dismiss(); setOpen(current => !current); }}
      style={({ pressed }) => [styles.trigger, { backgroundColor: colors.surfaceAlt,
        borderColor: isOpen ? colors.primary : colors.border, opacity: disabled ? 0.65 : pressed ? 0.8 : 1 }]}>
      <Icon name="calendar" color={disabled ? colors.muted : colors.primary} size={20} />
      <AppText style={[styles.date, disabled && { color: colors.muted }]}>{readableDate(value)}</AppText>
      <Icon name={isOpen ? 'close' : 'down'} color={colors.muted} size={18} />
    </Pressable>
    {isOpen && <View testID="expense-date-picker" style={[styles.calendar, {
      backgroundColor: colors.surface, borderColor: colors.border,
    }]}>
      <DateTimePicker mode="single" date={localDate(value)} locale="es"
        firstDayOfWeek={0} displayFullDays timePicker={false} height={315}
        // La librería compara instantes: incluir el día completo evita excluir
        // el primer día permitido por la hora de mediodía de localDate().
        minDate={dayjs(localDate(minDate)).startOf('day').toDate()}
        maxDate={dayjs(localDate(maxDate)).endOf('day').toDate()}
        onChange={({ date }) => {
          if (date == null) return;
          // Day.js devuelve el día elegido en la zona local, incluso al cambiar de mes.
          const nextDate = dayjs(date).format('YYYY-MM-DD');
          if (isValidDate(nextDate) && nextDate >= minDate && nextDate <= maxDate) { onChange(nextDate); setOpen(false); }
        }}
        selectedItemColor={colors.primary}
        selectedTextStyle={{ color: isDark ? colors.brand : colors.onPrimary, fontWeight: '700' }}
        calendarTextStyle={{ color: colors.text, fontSize: 12 }}
        headerButtonsPosition="right"
        headerContainerStyle={{ paddingHorizontal: 0, paddingVertical: 0 }}
        headerTextContainerStyle={{ paddingHorizontal: 3, borderRadius: 8 }}
        headerTextStyle={{ color: colors.text, fontSize: 15, fontWeight: '600' }}
        headerButtonStyle={{ width: 36, height: 44, borderRadius: 10, backgroundColor: colors.surfaceAlt,
          alignItems: 'center', justifyContent: 'center' }}
        buttonPrevIcon={<Icon name="left" color={colors.primary} size={18} />}
        buttonNextIcon={<Icon name="right" color={colors.primary} size={18} />}
        weekDaysContainerStyle={{ borderColor: colors.border, marginBottom: 4, paddingBottom: 8 }}
        weekDaysTextStyle={{ color: colors.muted, fontSize: 10 }}
        dayContainerStyle={{ borderRadius: 8 }}
        todayContainerStyle={{ borderRadius: 8, borderWidth: 1, borderColor: colors.primary }}
        todayTextStyle={{ color: colors.primary, fontWeight: '600' }}
        monthContainerStyle={{ borderRadius: 10, backgroundColor: colors.surfaceAlt, borderColor: colors.border }}
        yearContainerStyle={{ borderRadius: 10, backgroundColor: colors.surfaceAlt, borderColor: colors.border }}
      />
      <AppText variant="muted" style={styles.hint}>Toca un día para elegir la fecha.</AppText>
    </View>}
  </View>;
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontWeight: '600', fontSize: 13 },
  trigger: { flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 14, padding: 14, minHeight: 50 },
  date: { flex: 1, fontSize: 14 },
  calendar: { borderWidth: 1, borderRadius: 18, padding: 10 },
  hint: { fontSize: 11, textAlign: 'center', paddingTop: 6 },
});
