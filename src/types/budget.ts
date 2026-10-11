export type ThemeMode = 'light' | 'dark' | 'system';
export type HistoryPeriod = 'day' | 'week' | 'month' | 'year';
export type Tab = 'dashboard' | 'history' | 'settings';

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Expense {
  id: string;
  name: string;
  amountCents: number;
  categoryId: string;
  date: string; // Fecha local YYYY-MM-DD. No se convierte a UTC.
  note: string;
}

export interface SalaryEntry {
  from: string; // Primera quincena a la que aplica este sueldo.
  amountCents: number;
}

export interface AnnualBonus {
  year: number;
  date: string; // Fecha de diciembre a cuya quincena se suma el aguinaldo.
  amountCents: number;
}

export type PaymentDay = number | 'last';

export interface PaymentSchedule {
  first: PaymentDay;
  second: PaymentDay;
}

export interface ScheduledPayment {
  nominalDate: string; // Día habitual antes de ajustar el fin de semana.
  paymentDate: string; // Día real de cobro.
  slot: 'first' | 'second';
}

export interface BudgetState {
  version: 3;
  categories: Category[];
  expenses: Expense[];
  salaryHistory: SalaryEntry[];
  themeMode: ThemeMode;
  nextPaymentDate: string | null; // Fecha antigua, hasta confirmar los dos días habituales.
  paymentSchedule: PaymentSchedule | null;
  annualBonuses: AnnualBonus[];
}

export interface DateRange {
  start: string;
  end: string;
}
