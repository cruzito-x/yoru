import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useBudget } from '../context/BudgetContext';
import { Category } from '../types/budget';
import { useTheme } from '../theme/useTheme';
import { bonusInRange, categoryTotals, expensesInRange, salaryAt, totalExpenses } from '../utils/budget';
import { fortnight, moveFortnight, rangeLabel, today } from '../utils/dates';
import { money, percentage } from '../utils/money';
import { AppText, Button, Card, EmptyState, Screen, ScreenHeader } from '../components/ui';
import { PeriodNavigator } from '../components/PeriodNavigator';
import { DonutChart } from '../components/DonutChart';
import { CategoryCard } from '../components/CategoryCard';
import { CategoryForm } from '../components/CategoryForm';
import { ExpenseForm, ExpenseFormProps } from '../components/ExpenseForm';

export function DashboardScreen() {
  const { state } = useBudget();
  const { colors } = useTheme();
  const [anchor, setAnchor] = useState(today);
  const [categoryForm, setCategoryForm] = useState<{ category?: Category } | null>(null);
  const [expenseForm, setExpenseForm] = useState<Omit<ExpenseFormProps, 'onClose'> | null>(null);
  const range = fortnight(anchor);
  const expenses = expensesInRange(state.expenses, range);
  const salary = salaryAt(state.salaryHistory, range.start);
  const bonus = bonusInRange(state.annualBonuses, range);
  const income = salary + bonus;
  const incomeName = bonus > 0 ? 'ingreso' : 'sueldo';
  const spent = totalExpenses(expenses);
  const balance = income - spent;
  const totals = categoryTotals(state.categories, expenses);
  const denominator = Math.max(income, spent);
  const segments = [
    ...totals.filter(c => c.total > 0).map(c => ({ id: c.id, value: c.total, color: c.color })),
    { id: 'remaining', value: Math.max(balance, 0), color: colors.balance },
  ];

  function addExpense(categoryId: string) {
    const current = today();
    setExpenseForm({ categoryId, defaultDate: current >= range.start && current <= range.end ? current : range.start });
  }

  return <Screen>
    <ScreenHeader title="Tu quincena." subtitle="Cada gasto cuenta. Cada saldo, también." />
    <PeriodNavigator label={rangeLabel(range)} onPrevious={() => setAnchor(moveFortnight(anchor, -1))} onNext={() => setAnchor(moveFortnight(anchor, 1))} />
    <Card style={{ backgroundColor: colors.brand, borderColor: colors.brand, padding: 24, gap: 20 }}>
      <View style={{ gap: 6 }}>
        <AppText variant="label" style={{ color: colors.onPrimary, opacity: 0.75 }}>{balance < 0 ? 'DÉFICIT DE LA QUINCENA' : 'SALDO DISPONIBLE'}</AppText>
        <AppText style={{ color: colors.onPrimary, fontSize: 38, lineHeight: 45, fontWeight: '700', letterSpacing: -1.2 }}>{money(balance)}</AppText>
        <AppText style={{ color: colors.onPrimary, opacity: 0.8, fontSize: 12 }}>{balance < 0 ? `Los gastos superan el ${incomeName} configurado.` : 'Después de tus gastos registrados.'}</AppText>
      </View>
      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: colors.onPrimary + '33', paddingTop: 16 }}>
        <View style={{ flex: 1, gap: 3 }}><AppText style={{ color: colors.onPrimary, opacity: 0.75, fontSize: 11 }}>{bonus > 0 ? 'Ingresos de la quincena' : 'Sueldo quincenal'}</AppText><AppText style={{ color: colors.onPrimary, fontWeight: '600' }}>{money(income)}</AppText></View>
        <View style={{ flex: 1, gap: 3 }}><AppText style={{ color: colors.onPrimary, opacity: 0.75, fontSize: 11 }}>Gastos registrados</AppText><AppText style={{ color: colors.onPrimary, fontWeight: '600' }}>{money(spent)}</AppText></View>
      </View>
      {bonus > 0 && <AppText style={{ color: colors.onPrimary, fontSize: 12 }}>Sueldo {money(salary)} + aguinaldo {money(bonus)}</AppText>}
    </Card>
    <Card style={{ gap: 18 }}>
      <View><AppText variant="heading">Así va tu dinero</AppText><AppText variant="muted">{spent > income ? 'Distribución de los gastos · saldo agotado' : `Distribución de tu ${incomeName} quincenal`}</AppText></View>
      <DonutChart segments={segments} centerValue={income > 0 ? `${percentage(spent, income).toFixed(1)}%` : money(spent)} centerLabel={income > 0 ? `del ${incomeName} gastado` : 'sin sueldo configurado'} />
      <View style={{ gap: 11 }}>
        {totals.filter(c => c.total > 0).map(category => <View key={category.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: category.color }} />
          <AppText style={{ flex: 1, fontSize: 13 }}>{category.name}</AppText>
          <AppText style={{ fontSize: 12, fontWeight: '600' }}>{money(category.total)}</AppText>
          <AppText variant="muted" style={{ width: 47, textAlign: 'right', fontSize: 11 }}>{percentage(category.total, denominator).toFixed(1)}%</AppText>
        </View>)}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, paddingTop: 12, borderTopWidth: 1, borderColor: colors.border }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.balance }} />
          <AppText style={{ flex: 1, fontSize: 13 }}>Saldo restante</AppText>
          <AppText style={{ fontSize: 12, fontWeight: '600' }}>{money(Math.max(balance, 0))}</AppText>
          <AppText variant="muted" style={{ width: 47, textAlign: 'right', fontSize: 11 }}>{percentage(Math.max(balance, 0), denominator).toFixed(1)}%</AppText>
        </View>
      </View>
      {balance < 0 && <View style={{ backgroundColor: colors.dangerSoft, borderRadius: 12, padding: 12 }}>
        <AppText style={{ color: colors.danger, fontSize: 12 }}>Excediste tu {incomeName} por {money(-balance)}. Los porcentajes de la dona representan los gastos totales.</AppText>
      </View>}
      {spent === 0 && <AppText variant="muted" style={{ textAlign: 'center' }}>Tu primer gasto dará forma a esta quincena.</AppText>}
    </Card>
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <View style={{ flex: 1 }}><AppText variant="heading">Tus categorías</AppText><AppText variant="muted">Organiza cada movimiento.</AppText></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Añadir categoría" onPress={() => setCategoryForm({})} style={{ minHeight: 44, justifyContent: 'center' }}>
          <AppText style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>+ Categoría</AppText>
        </Pressable>
      </View>
      {state.categories.length === 0 && <EmptyState title="Empieza por una categoría" description="Crea una categoría para poder registrar tus gastos." />}
      {state.categories.map(category => <CategoryCard key={category.id} category={category} expenses={expenses.filter(e => e.categoryId === category.id)}
        onAdd={() => addExpense(category.id)} onEditCategory={() => setCategoryForm({ category })}
        onEditExpense={expense => setExpenseForm({ expense })} />)}
      <Button title="Añadir categoría" icon="plus" variant="secondary" onPress={() => setCategoryForm({})} />
    </View>
    {categoryForm && <CategoryForm category={categoryForm.category} onClose={() => setCategoryForm(null)} />}
    {expenseForm && <ExpenseForm {...expenseForm} onClose={() => setExpenseForm(null)} />}
  </Screen>;
}
