import { BudgetState, PayrollSettings } from '../types/budget';

// Referencia inicial del usuario; configurar la planilla no registra ingresos.
export const PAYROLL_DEFAULTS: PayrollSettings = { monthlySalaryCents: 50000, serviceMonths: 18, travelAllowanceCents: 15000 };

// Categorías iniciales, SIN gastos de ejemplo ni pagos ficticios.
export function initialBudget(): BudgetState {
  return {
    version: 6,
    categories: [
      { id: 'food', name: 'Alimentación', color: '#C56839' },
      { id: 'transport', name: 'Transporte', color: '#5472AE' },
      { id: 'services', name: 'Servicios', color: '#9270AE' },
      { id: 'personal', name: 'Personal', color: '#B38335' },
    ],
    expenses: [],
    salaryHistory: [{ from: '1900-01-01', amountCents: 29938 }],
    payrollSettings: { ...PAYROLL_DEFAULTS },
    themeMode: 'system',
    nextPaymentDate: null,
    paymentSchedule: null,
    annualBonuses: [],
    quincena25Entries: [],
  };
}

export const CATEGORY_COLORS = ['#C56839', '#5472AE', '#9270AE', '#B38335', '#BF5474', '#418C91', '#69743D', '#7767C7'];
