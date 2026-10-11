import { BudgetState } from '../types/budget';
import { isDecember, isValidDate } from './dates';
import { isValidPaymentSchedule } from './payments';

const isMoney = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0 && Number(value) <= 99999999;

export function isBudgetState(value: unknown): value is BudgetState {
  if (!value || typeof value !== 'object') return false;
  const s = value as BudgetState;
  if (s.version !== 3 || !['light', 'dark', 'system'].includes(s.themeMode)) return false;
  if (!Array.isArray(s.categories) || !Array.isArray(s.expenses) || !Array.isArray(s.salaryHistory)) return false;
  if (!s.categories.every(c => c && typeof c.id === 'string' && c.id.length > 0 && typeof c.name === 'string'
    && c.name.trim().length > 0 && /^#[0-9A-Fa-f]{6}$/.test(c.color))) return false;
  const ids = new Set(s.categories.map(c => c.id));
  if (ids.size !== s.categories.length) return false;
  if (!s.expenses.every(e => e && typeof e.id === 'string' && typeof e.name === 'string' && e.name.trim().length > 0
    && isMoney(e.amountCents) && e.amountCents > 0 && ids.has(e.categoryId)
    && typeof e.date === 'string' && isValidDate(e.date) && typeof e.note === 'string')) return false;
  if (new Set(s.expenses.map(e => e.id)).size !== s.expenses.length) return false;
  if (!s.salaryHistory.length || !s.salaryHistory.every(e => e && typeof e.from === 'string'
    && isValidDate(e.from) && isMoney(e.amountCents))) return false;
  if (s.nextPaymentDate !== null && (typeof s.nextPaymentDate !== 'string' || !isValidDate(s.nextPaymentDate))) return false;
  if (s.paymentSchedule !== null && !isValidPaymentSchedule(s.paymentSchedule)) return false;
  if (!Array.isArray(s.annualBonuses)) return false;
  if (!s.annualBonuses.every(bonus => bonus && Number.isInteger(bonus.year) && typeof bonus.date === 'string'
    && isDecember(bonus.date) && Number(bonus.date.slice(0, 4)) === bonus.year && isMoney(bonus.amountCents))) return false;
  return new Set(s.annualBonuses.map(b => b.year)).size === s.annualBonuses.length;
}

// Se conserva la fecha única anterior sin inventar un segundo día de pago.
export function migrateBudget(value: unknown): BudgetState {
  let candidate = value;
  if (value && typeof value === 'object' && 'version' in value && value.version === 1) {
    candidate = { ...value, version: 3, nextPaymentDate: null, paymentSchedule: null, annualBonuses: [] };
  } else if (value && typeof value === 'object' && 'version' in value && value.version === 2) {
    candidate = { ...value, version: 3, paymentSchedule: null };
  }
  if (!isBudgetState(candidate)) throw new Error('Los datos guardados no tienen el formato esperado.');
  return candidate;
}
