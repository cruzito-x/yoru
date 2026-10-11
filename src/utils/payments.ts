import { PaymentDay, PaymentSchedule, ScheduledPayment } from '../types/budget';
import { addDays, dateKey, isValidDate, localDate, movePeriod } from './dates';

function isPaymentDay(value: unknown): value is PaymentDay {
  return value === 'last' || (Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 31);
}

function dayInMonth(day: PaymentDay, lastDay: number): number {
  return day === 'last' ? lastDay : Math.min(day, lastDay);
}

export function isValidPaymentSchedule(value: unknown): value is PaymentSchedule {
  if (!value || typeof value !== 'object') return false;
  const schedule = value as PaymentSchedule;
  if (!isPaymentDay(schedule.first) || !isPaymentDay(schedule.second)) return false;
  // Tres días de separación evitan dos pagos en el mismo viernes.
  // Comprobamos también el salto al mes siguiente y los meses cortos.
  return [28, 29, 30, 31].every(lastDay => {
    const first = dayInMonth(schedule.first, lastDay);
    const second = dayInMonth(schedule.second, lastDay);
    return second - first >= 3 && lastDay - second + first >= 3;
  });
}

export function paymentDayLabel(day: PaymentDay): string {
  return day === 'last' ? 'Último día del mes' : `Día ${day}`;
}

export function adjustPaymentDate(nominalDate: string): string {
  const weekday = localDate(nominalDate).getDay();
  return weekday === 6 ? addDays(nominalDate, -1) : weekday === 0 ? addDays(nominalDate, -2) : nominalDate;
}

export function paymentsForMonth(schedule: PaymentSchedule, month: string): ScheduledPayment[] {
  if (!isValidPaymentSchedule(schedule) || !isValidDate(month)) return [];
  const date = localDate(month);
  const year = date.getFullYear(), monthIndex = date.getMonth();
  const lastDay = new Date(year, monthIndex + 1, 0, 12).getDate();
  return (['first', 'second'] as const).map(slot => {
    const nominalDate = dateKey(new Date(year, monthIndex, dayInMonth(schedule[slot], lastDay), 12));
    return { slot, nominalDate, paymentDate: adjustPaymentDate(nominalDate) };
  });
}

export function upcomingPayments(schedule: PaymentSchedule | null, from: string, count = 6): ScheduledPayment[] {
  if (!schedule || !isValidPaymentSchedule(schedule) || !isValidDate(from) || !Number.isInteger(count) || count < 1 || count > 24) return [];
  let month = from.slice(0, 7) + '-01';
  const result: ScheduledPayment[] = [];
  while (result.length < count && month <= '2100-12-01') {
    result.push(...paymentsForMonth(schedule, month).filter(payment => payment.paymentDate >= from));
    month = movePeriod('month', month, 1);
  }
  return result.sort((a, b) => a.paymentDate.localeCompare(b.paymentDate)).slice(0, count);
}

export function calendarPayments(schedule: PaymentSchedule | null, month: string): ScheduledPayment[] {
  if (!schedule) return [];
  // Incluir meses vecinos muestra pagos que se adelantaron al mes anterior.
  return [-1, 0, 1].flatMap(offset => {
    const candidate = movePeriod('month', month, offset);
    return isValidDate(candidate) ? paymentsForMonth(schedule, candidate) : [];
  });
}
