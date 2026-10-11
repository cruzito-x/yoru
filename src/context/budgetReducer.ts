import { AnnualBonus, BudgetState, Category, Expense, PaymentSchedule, SalaryEntry, ThemeMode } from '../types/budget';
import { isDecember } from '../utils/dates';
import { isValidPaymentSchedule } from '../utils/payments';

export type BudgetAction =
  | { type: 'LOAD'; state: BudgetState }
  | { type: 'SAVE_CATEGORY'; category: Category }
  | { type: 'DELETE_CATEGORY'; id: string }
  | { type: 'SAVE_EXPENSE'; expense: Expense }
  | { type: 'DELETE_EXPENSE'; id: string }
  | { type: 'SET_SALARY'; entry: SalaryEntry }
  | { type: 'SET_THEME'; mode: ThemeMode }
  | { type: 'SET_PAYMENT_SCHEDULE'; schedule: PaymentSchedule | null }
  | { type: 'SET_ANNUAL_BONUS'; bonus: AnnualBonus };

// El reducer solo cambia datos. No dibuja UI ni accede al almacenamiento.
export function budgetReducer(state: BudgetState, action: BudgetAction): BudgetState {
  switch (action.type) {
    case 'LOAD': return action.state;
    case 'SAVE_CATEGORY': return {
      ...state,
      categories: state.categories.some(c => c.id === action.category.id)
        ? state.categories.map(c => c.id === action.category.id ? action.category : c)
        : [...state.categories, action.category],
    };
    case 'DELETE_CATEGORY':
      // Eliminar una categoría utilizada rompería el historial.
      if (state.expenses.some(e => e.categoryId === action.id)) return state;
      return { ...state, categories: state.categories.filter(c => c.id !== action.id) };
    case 'SAVE_EXPENSE':
      if (!state.categories.some(c => c.id === action.expense.categoryId)) return state;
      return {
        ...state,
        expenses: state.expenses.some(e => e.id === action.expense.id)
          ? state.expenses.map(e => e.id === action.expense.id ? action.expense : e)
          : [...state.expenses, action.expense],
      };
    case 'DELETE_EXPENSE': return { ...state, expenses: state.expenses.filter(e => e.id !== action.id) };
    case 'SET_SALARY': return {
      ...state,
      salaryHistory: [...state.salaryHistory.filter(e => e.from !== action.entry.from), action.entry]
        .sort((a, b) => a.from.localeCompare(b.from)),
    };
    case 'SET_THEME': return { ...state, themeMode: action.mode };
    case 'SET_PAYMENT_SCHEDULE':
      if (action.schedule !== null && !isValidPaymentSchedule(action.schedule)) return state;
      return { ...state, paymentSchedule: action.schedule, nextPaymentDate: null };
    case 'SET_ANNUAL_BONUS':
      if (!isDecember(action.bonus.date) || Number(action.bonus.date.slice(0, 4)) !== action.bonus.year
        || !Number.isSafeInteger(action.bonus.amountCents) || action.bonus.amountCents < 0 || action.bonus.amountCents > 99999999) return state;
      return { ...state, annualBonuses: [
        ...state.annualBonuses.filter(bonus => bonus.year !== action.bonus.year), action.bonus,
      ].sort((a, b) => a.year - b.year) };
  }
}
