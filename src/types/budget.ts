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
  /** Identificador de la regla recurrente; solo se usa en ocurrencias calculadas. */
  fixedExpenseId?: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  amountCents: number;
  categoryId: string;
  payFortnight: 1 | 2;
  startsOn?: string;
  /** Día mensual opcional; null o ausente sigue la fecha del pago configurado. */
  paymentDay?: number | null;
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
  version: 9;
  categories: Category[];
  expenses: Expense[];
  fixedExpenses: FixedExpense[];
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
