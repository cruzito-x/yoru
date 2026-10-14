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

export interface PayrollSettings {
  monthlySalaryCents: number; // Sueldo mensual en planilla, antes de descuentos.
  serviceMonths: number; // Antigüedad introducida por el usuario, en meses completos.
  travelAllowanceCents: number; // Viáticos mensuales, excluidos de las deducciones de ley.
}

export interface AnnualBonus {
  year: number;
  date: string; // Fecha de diciembre a cuya quincena se suma el aguinaldo.
  amountCents: number;
}

export interface Quincena25Entry {
  year: number;
  date: string; // Nuevos pagos: del 15 al 25 de enero. Se conservan fechas históricas anteriores.
  amountCents: number;
}

export type PaymentDay = number | 'last';

export interface PaymentSchedule {
  /** Día fijo del primer pago; no admite 'last'. */
  first: number;
  /** Día fijo o último día del mes para el segundo pago. */
  second: PaymentDay;
}

export interface ScheduledPayment {
  nominalDate: string; // Día habitual antes de ajustar el fin de semana.
  paymentDate: string; // Día real de cobro.
  slot: 'first' | 'second';
}

export interface BudgetState {
  version: 6;
  categories: Category[];
  expenses: Expense[];
  salaryHistory: SalaryEntry[];
  payrollSettings: PayrollSettings;
  themeMode: ThemeMode;
  nextPaymentDate: string | null; // Fecha antigua, hasta confirmar los dos días habituales.
  paymentSchedule: PaymentSchedule | null;
  annualBonuses: AnnualBonus[];
  quincena25Entries: Quincena25Entry[];
}

export interface DateRange {
  start: string;
  end: string;
}
