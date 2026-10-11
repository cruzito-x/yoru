import { DateRange, HistoryPeriod } from "../types/budget";

export function dateKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function today(): string {
  return dateKey(new Date());
}

export function isDecember(value: string): boolean {
  return isValidDate(value) && value.slice(5, 7) === "12";
}

// Una cuadrícula completa de semanas, empezando por lunes.
export function calendarDays(month: string): string[] {
  const date = localDate(month);
  const first = dateKey(new Date(date.getFullYear(), date.getMonth(), 1, 12));
  const offset = (localDate(first).getDay() + 6) % 7;
  const days = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    12,
  ).getDate();
  const start = addDays(first, -offset);
  return Array.from(
    { length: Math.ceil((offset + days) / 7) * 7 },
    (_, index) => addDays(start, index),
  );
}

// Mediodía local evita desplazar el día por la zona horaria o el horario de verano.
export function localDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const year = Number(value.slice(0, 4));
  return year >= 1900 && year <= 2100 && dateKey(localDate(value)) === value;
}

export function addDays(value: string, amount: number): string {
  const date = localDate(value);
  date.setDate(date.getDate() + amount);
  return dateKey(date);
}

export function fortnight(value: string): DateRange {
  const date = localDate(value);
  const y = date.getFullYear(),
    m = date.getMonth();
  const first = date.getDate() < 15;
  return {
    start: dateKey(new Date(y, m, first ? 1 : 15, 12)),
    end: dateKey(new Date(y, first ? m : m + 1, first ? 14 : 0, 12)),
  };
}

export function moveFortnight(value: string, direction: number): string {
  const range = fortnight(value);
  return direction < 0
    ? fortnight(addDays(range.start, -1)).start
    : addDays(range.end, 1);
}

export function historyRange(period: HistoryPeriod, anchor: string): DateRange {
  const date = localDate(anchor);
  const y = date.getFullYear(),
    m = date.getMonth();
  if (period === "day") return { start: anchor, end: anchor };
  if (period === "week") {
    const start = addDays(anchor, -((date.getDay() + 6) % 7));
    return { start, end: addDays(start, 6) };
  }
  if (period === "month")
    return {
      start: dateKey(new Date(y, m, 1, 12)),
      end: dateKey(new Date(y, m + 1, 0, 12)),
    };
  return { start: `${y}-01-01`, end: `${y}-12-31` };
}

export function movePeriod(
  period: HistoryPeriod,
  anchor: string,
  direction: number,
): string {
  if (period === "day" || period === "week")
    return addDays(anchor, direction * (period === "day" ? 1 : 7));
  // Saltar meses/años desde su primer día evita que el 31 salte un mes accidentalmente.
  const date = localDate(anchor);
  if (period === "month")
    return dateKey(
      new Date(date.getFullYear(), date.getMonth() + direction, 1, 12),
    );
  return `${date.getFullYear() + direction}-01-01`;
}

export function readableDate(value: string, short = false): string {
  return localDate(value).toLocaleDateString("es-SV", {
    day: "numeric",
    month: short ? "short" : "long",
    year: "numeric",
  });
}

export function rangeLabel(range: DateRange): string {
  return range.start === range.end
    ? readableDate(range.start)
    : `${readableDate(range.start, true)} — ${readableDate(range.end, true)}`;
}
