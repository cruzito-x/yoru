import { AnnualBonus, BudgetState, Category, Expense, FixedExpense, PaymentSchedule, PayrollSettings, Quincena25Entry, SalaryEntry, ThemeMode } from '../types/budget';
import { isDecember, isJanuary, isQuincena25PaymentDate, isValidDate } from '../utils/dates';
import { isValidPaymentSchedule } from '../utils/payments';
import { isValidPayrollSettings } from '../utils/payroll';
import { salaryAt } from '../utils/budget';

export type BudgetAction =
  | { type: 'LOAD'; state: BudgetState }
  | { type: 'SAVE_CATEGORY'; category: Category }
  | { type: 'MOVE_CATEGORY'; id: string; direction: -1 | 1 }
  | { type: 'MOVE_CATEGORY_TO_INDEX'; id: string; index: number }
  | { type: 'DELETE_CATEGORY'; id: string }
  | { type: 'SAVE_EXPENSE'; expense: Expense }
  | { type: 'DELETE_EXPENSE'; id: string }
  | { type: 'SAVE_FIXED_EXPENSE'; expense: FixedExpense }
  | { type: 'DELETE_FIXED_EXPENSE'; id: string }
  | { type: 'SET_SALARY'; entry: SalaryEntry }
  | { type: 'SET_PAYROLL'; settings: PayrollSettings }
  | { type: 'SET_INCOME_SETTINGS'; salary: SalaryEntry; payroll: PayrollSettings }
  | { type: 'SET_THEME'; mode: ThemeMode }
  | { type: 'SET_PAYMENT_SCHEDULE'; schedule: PaymentSchedule | null }
  | { type: 'SET_ANNUAL_BONUS'; bonus: AnnualBonus }
  | { type: 'SET_QUINCENA_25'; entry: Quincena25Entry };

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
    case 'MOVE_CATEGORY': {
      const index = state.categories.findIndex(category => category.id === action.id);
      const target = index + action.direction;
      if (index < 0 || target < 0 || target >= state.categories.length) return state;
      const categories = [...state.categories];
      [categories[index], categories[target]] = [categories[target], categories[index]];
      return { ...state, categories };
    }
    case 'MOVE_CATEGORY_TO_INDEX': {
      const index = state.categories.findIndex(category => category.id === action.id);
      const target = Math.max(0, Math.min(action.index, state.categories.length - 1));
      if (index < 0 || target === index) return state;
      const categories = [...state.categories];
      const [category] = categories.splice(index, 1);
      categories.splice(target, 0, category);
      return { ...state, categories };
    }
    case 'DELETE_CATEGORY':
      // Eliminar una categoría utilizada rompería el historial.
      if (state.expenses.some(e => e.categoryId === action.id)
        || state.fixedExpenses.some(e => e.categoryId === action.id)) return state;
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
    case 'SAVE_FIXED_EXPENSE':
      if (!state.categories.some(category => category.id === action.expense.categoryId)
        || !action.expense.name.trim() || !Number.isSafeInteger(action.expense.amountCents)
        || action.expense.amountCents <= 0 || action.expense.amountCents > 99999999
        || (action.expense.payFortnight !== 1 && action.expense.payFortnight !== 2)) return state;
      return { ...state, fixedExpenses: state.fixedExpenses.some(expense => expense.id === action.expense.id)
        ? state.fixedExpenses.map(expense => expense.id === action.expense.id ? { ...action.expense } : expense)
        : [...state.fixedExpenses, { ...action.expense }] };
    case 'DELETE_FIXED_EXPENSE':
      return { ...state, fixedExpenses: state.fixedExpenses.filter(expense => expense.id !== action.id) };
    case 'SET_SALARY': return {
      ...state,
      salaryHistory: [...state.salaryHistory.filter(e => e.from !== action.entry.from), action.entry]
        .sort((a, b) => a.from.localeCompare(b.from)),
    };
    case 'SET_THEME': return { ...state, themeMode: action.mode };
    case 'SET_PAYROLL':
      if (!isValidPayrollSettings(action.settings)) return state;
      return { ...state, payrollSettings: { ...action.settings } };
    case 'SET_INCOME_SETTINGS':
      // Validar los dos campos antes de modificar cualquiera de ellos.
      if (!isValidDate(action.salary.from) || !Number.isSafeInteger(action.salary.amountCents)
        || action.salary.amountCents < 0 || action.salary.amountCents > 99999999
        || !isValidPayrollSettings(action.payroll)) return state;
      return { ...state, payrollSettings: { ...action.payroll },
        salaryHistory: salaryAt(state.salaryHistory, action.salary.from) === action.salary.amountCents
          ? state.salaryHistory
          : [...state.salaryHistory.filter(entry => entry.from !== action.salary.from), { ...action.salary }]
            .sort((a, b) => a.from.localeCompare(b.from)),
      };
    case 'SET_PAYMENT_SCHEDULE':
      if (action.schedule !== null && !isValidPaymentSchedule(action.schedule)) return state;
      return { ...state, paymentSchedule: action.schedule, nextPaymentDate: null };
    case 'SET_QUINCENA_25':
      if (!isJanuary(action.entry.date) || Number(action.entry.date.slice(0, 4)) !== action.entry.year
        || !Number.isSafeInteger(action.entry.amountCents) || action.entry.amountCents < 0 || action.entry.amountCents > 99999999) return state;
      // Mantener los registros antiguos sin alterar su saldo. Sólo se permite
      // ponerlos a cero en su fecha original; las nuevas fechas deben ser del 15 al 25.
      if (!isQuincena25PaymentDate(action.entry.date) && !(action.entry.amountCents === 0
        && state.quincena25Entries.some(entry => entry.year === action.entry.year && entry.date === action.entry.date))) return state;
      return { ...state, quincena25Entries: [
        ...state.quincena25Entries.filter(entry => entry.year !== action.entry.year), action.entry,
      ].sort((a, b) => a.year - b.year) };
    case 'SET_ANNUAL_BONUS':
      if (!isDecember(action.bonus.date) || Number(action.bonus.date.slice(0, 4)) !== action.bonus.year
        || !Number.isSafeInteger(action.bonus.amountCents) || action.bonus.amountCents < 0 || action.bonus.amountCents > 99999999) return state;
      return { ...state, annualBonuses: [
        ...state.annualBonuses.filter(bonus => bonus.year !== action.bonus.year), action.bonus,
      ].sort((a, b) => a.year - b.year) };
  }
}
