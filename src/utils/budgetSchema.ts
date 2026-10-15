import { BudgetState, PayrollSettings } from '../types/budget';
import { isDecember, isJanuary, isValidDate } from './dates';
import { isValidPaymentSchedule } from './payments';
import { isValidPayrollSettings } from './payroll';
import { PAYROLL_DEFAULTS } from '../data/defaults';

const isMoney = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0 && Number(value) <= 99999999;

export function isBudgetState(value: unknown): value is BudgetState {
  if (!value || typeof value !== 'object') return false;
  const s = value as BudgetState;
  if (s.version !== 8 || !['light', 'dark', 'system'].includes(s.themeMode)) return false;
  if (!isValidPayrollSettings(s.payrollSettings)) return false;
  if (!Array.isArray(s.categories) || !Array.isArray(s.expenses) || !Array.isArray(s.salaryHistory)) return false;
  if (!s.categories.every(c => c && typeof c.id === 'string' && c.id.length > 0 && typeof c.name === 'string'
    && c.name.trim().length > 0 && /^#[0-9A-Fa-f]{6}$/.test(c.color))) return false;
  const ids = new Set(s.categories.map(c => c.id));
  if (ids.size !== s.categories.length) return false;
  if (!s.expenses.every(e => e && typeof e.id === 'string' && typeof e.name === 'string' && e.name.trim().length > 0
    && isMoney(e.amountCents) && e.amountCents > 0 && ids.has(e.categoryId)
    && typeof e.date === 'string' && isValidDate(e.date) && typeof e.note === 'string')) return false;
  if (new Set(s.expenses.map(e => e.id)).size !== s.expenses.length) return false;
  if (!Array.isArray(s.fixedExpenses) || !s.fixedExpenses.every(expense => expense && typeof expense.id === 'string'
    && expense.id.length > 0 && typeof expense.name === 'string' && expense.name.trim().length > 0
    && isMoney(expense.amountCents) && expense.amountCents > 0 && ids.has(expense.categoryId)
    && (expense.payFortnight === 1 || expense.payFortnight === 2))) return false;
  if (new Set(s.fixedExpenses.map(expense => expense.id)).size !== s.fixedExpenses.length) return false;
  if (!s.salaryHistory.length || !s.salaryHistory.every(e => e && typeof e.from === 'string'
    && isValidDate(e.from) && isMoney(e.amountCents))) return false;
  if (s.nextPaymentDate !== null && (typeof s.nextPaymentDate !== 'string' || !isValidDate(s.nextPaymentDate))) return false;
  if (s.paymentSchedule !== null && !isValidPaymentSchedule(s.paymentSchedule)) return false;
  if (!Array.isArray(s.annualBonuses)) return false;
  if (!s.annualBonuses.every(bonus => bonus && Number.isInteger(bonus.year) && typeof bonus.date === 'string'
    && isDecember(bonus.date) && Number(bonus.date.slice(0, 4)) === bonus.year && isMoney(bonus.amountCents))) return false;
  if (new Set(s.annualBonuses.map(b => b.year)).size !== s.annualBonuses.length) return false;
  if (!Array.isArray(s.quincena25Entries)) return false;
  // Lectura compatible con enero completo en versiones anteriores. El reducer
  // y el formulario restringen los pagos nuevos al intervalo del 15 al 25.
  if (!s.quincena25Entries.every(entry => entry && Number.isInteger(entry.year) && typeof entry.date === 'string'
    && isJanuary(entry.date) && Number(entry.date.slice(0, 4)) === entry.year && isMoney(entry.amountCents))) return false;
  return new Set(s.quincena25Entries.map(entry => entry.year)).size === s.quincena25Entries.length;
}

// Se conserva la fecha única anterior sin inventar un segundo día de pago.
export function migrateBudget(value: unknown): BudgetState {
  let candidate = value;
  if (value && typeof value === 'object' && 'version' in value && value.version === 1) {
    candidate = { ...value, version: 4, nextPaymentDate: null, paymentSchedule: null, annualBonuses: [], quincena25Entries: [] };
  } else if (value && typeof value === 'object' && 'version' in value && value.version === 2) {
    candidate = { ...value, version: 4, paymentSchedule: null, quincena25Entries: [] };
  } else if (value && typeof value === 'object' && 'version' in value && value.version === 3) {
    candidate = { ...value, version: 4, quincena25Entries: [] };
  }
  if (candidate && typeof candidate === 'object' && 'version' in candidate && candidate.version === 4) {
    candidate = { ...candidate, version: 5, payrollSettings: { ...PAYROLL_DEFAULTS } };
  }
  if (candidate && typeof candidate === 'object' && 'version' in candidate && candidate.version === 5) {
    const existingSettings = 'payrollSettings' in candidate && candidate.payrollSettings && typeof candidate.payrollSettings === 'object'
      ? candidate.payrollSettings as Partial<PayrollSettings> : {};
    candidate = { ...candidate, version: 6, payrollSettings: { ...PAYROLL_DEFAULTS, ...existingSettings } };
  }
  if (candidate && typeof candidate === 'object' && 'version' in candidate && candidate.version === 6) {
    candidate = { ...candidate, version: 7, fixedExpenses: [] };
  }
  if (candidate && typeof candidate === 'object' && 'version' in candidate && candidate.version === 7) {
    const previousState = candidate as Record<string, unknown>;
    const fixedExpenses = Array.isArray(previousState.fixedExpenses)
      ? previousState.fixedExpenses.map(expense => ({ ...(expense as Record<string, unknown>), payFortnight: 1 })) : [];
    candidate = { ...candidate, version: 8, fixedExpenses };
  }
  if (!isBudgetState(candidate)) throw new Error('Los datos guardados no tienen el formato esperado.');
  return candidate;
}
