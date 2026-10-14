import { AnnualBonus, Category, DateRange, Expense, SalaryEntry } from '../types/budget';

export function expensesInRange(expenses: Expense[], range: DateRange): Expense[] {
  return expenses.filter(e => e.date >= range.start && e.date <= range.end)
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
