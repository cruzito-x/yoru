import { AnnualBonus, Category, DateRange, Expense, FixedExpense, PaymentSchedule, SalaryEntry } from '../types/budget';
import { dateKey, today } from './dates';
import { paymentsForMonth } from './payments';

export function expensesInRange(expenses: Expense[], range: DateRange): Expense[] {
  return expenses.filter(e => e.date >= range.start && e.date <= range.end)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

export function fixedExpensesInRange(fixedExpenses: FixedExpense[], range: DateRange, paymentSchedule: PaymentSchedule | null): Expense[] {
  const results: Expense[] = [];
  const [startYear, startMonth] = range.start.slice(0, 7).split('-').map(Number);
  const [endYear, endMonth] = range.end.slice(0, 7).split('-').map(Number);
  const firstMonth = startYear * 12 + startMonth - 1;
  const lastMonth = endYear * 12 + endMonth - 1;

  for (let monthKey = firstMonth; monthKey <= lastMonth; monthKey += 1) {
    const year = Math.floor(monthKey / 12);
    const month = monthKey % 12 + 1;
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
    const monthDate = `${monthPrefix}-01`;
    const lastDay = new Date(year, month, 0, 12).getDate();
    const schedule = paymentSchedule ?? { first: 15, second: 'last' as const };
    const scheduledPayments = paymentsForMonth(schedule, monthDate);
    for (const fixed of fixedExpenses) {
      const slot = fixed.payFortnight === 1 ? 'first' : 'second';
      const customDate = fixed.paymentDay == null ? null
        : dateKey(new Date(year, month - 1, Math.min(fixed.paymentDay, lastDay), 12));
      const date = customDate ?? scheduledPayments.find(payment => payment.slot === slot)?.paymentDate;
      if (!date) continue;
      if (date < (fixed.startsOn ?? today()) || date < range.start || date > range.end) continue;
      results.push({
        id: `fixed:${fixed.id}:${date}`, fixedExpenseId: fixed.id,
        name: fixed.name, amountCents: fixed.amountCents, categoryId: fixed.categoryId,
        date, note: `Gasto fijo · ${fixed.payFortnight}.ª quincena`,
      });
    }
  }
  return results.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

export function expensesAndFixedInRange(expenses: Expense[], fixedExpenses: FixedExpense[], range: DateRange,
  paymentSchedule: PaymentSchedule | null): Expense[] {
  return [...expensesInRange(expenses, range), ...fixedExpensesInRange(fixedExpenses, range, paymentSchedule)]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

export function totalExpenses(expenses: Expense[]): number {
  return expenses.reduce((total, expense) => total + expense.amountCents, 0);
}

export function salaryAt(history: SalaryEntry[], date: string): number {
  const matching = history.filter(entry => entry.from <= date).sort((a, b) => b.from.localeCompare(a.from));
  return matching[0]?.amountCents ?? 0;
}

export function bonusInRange(bonuses: AnnualBonus[], range: DateRange): number {
  return bonuses.filter(bonus => bonus.date >= range.start && bonus.date <= range.end)
    .reduce((total, bonus) => total + bonus.amountCents, 0);
}

export function categoryTotals(categories: Category[], expenses: Expense[]) {
  return categories.map(category => ({
    ...category, total: totalExpenses(expenses.filter(expense => expense.categoryId === category.id)),
  }));
}

export function groupByDay(expenses: Expense[]): { date: string; expenses: Expense[] }[] {
  const groups: Record<string, Expense[]> = {};
  for (const expense of expenses) (groups[expense.date] ??= []).push(expense);
  return Object.keys(groups).sort().reverse().map(date => ({ date, expenses: groups[date] }));
}

export function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
