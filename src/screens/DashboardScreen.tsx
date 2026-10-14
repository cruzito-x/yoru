import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useBudget } from '../context/BudgetContext';
import { Category } from '../types/budget';
import { useTheme } from '../theme/useTheme';
import { categoryTotals, expensesInRange, totalExpenses } from '../utils/budget';
import { fortnight, moveFortnight, rangeLabel, today } from '../utils/dates';
import { money, percentage } from '../utils/money';
import { AppText, Card, EmptyState, Screen, ScreenHeader } from '../components/ui';
import { PeriodNavigator } from '../components/PeriodNavigator';
import { DonutChart } from '../components/DonutChart';
import { CategoryCarousel } from '../components/CategoryCarousel';
import { CategoryForm } from '../components/CategoryForm';
import { ExpenseForm, ExpenseFormProps } from '../components/ExpenseForm';
import { calculateFortnightPayroll } from '../utils/payroll';
import { FortnightSummaryCard } from '../components/FortnightSummaryCard';

export function DashboardScreen() {
  const { state } = useBudget();
  const { colors } = useTheme();
  const [anchor, setAnchor] = useState(today);
  const [categoryForm, setCategoryForm] = useState<{ category?: Category } | null>(null);
  const [expenseForm, setExpenseForm] = useState<Omit<ExpenseFormProps, 'onClose'> | null>(null);
  const range = fortnight(anchor);
  const expenses = expensesInRange(state.expenses, range);
  const payroll = calculateFortnightPayroll(state.payrollSettings.monthlySalaryCents);
  const income = payroll.netCents + Math.round(state.payrollSettings.travelAllowanceCents / 2);
  const incomeName = 'ingreso';
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
    <FortnightSummaryCard balanceCents={balance} incomeCents={income} spentCents={spent} />
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
    </Card>
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <View style={{ flex: 1 }}><AppText variant="heading">Tus categorías</AppText><AppText variant="muted">Organiza cada movimiento.</AppText></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Añadir categoría" onPress={() => setCategoryForm({})} style={{ minHeight: 44, justifyContent: 'center' }}>
          <AppText style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>+ Categoría</AppText>
        </Pressable>
      </View>
      {state.categories.length === 0 && <EmptyState title="Empieza por una categoría" description="Crea una categoría para poder registrar tus gastos." />}
      <CategoryCarousel categories={state.categories} expenses={expenses} onAdd={addExpense}
        onEditCategory={category => setCategoryForm({ category })} onEditExpense={expense => setExpenseForm({ expense })} />
    </View>
    {categoryForm && <CategoryForm category={categoryForm.category} onClose={() => setCategoryForm(null)} />}
    {expenseForm && <ExpenseForm {...expenseForm} onClose={() => setExpenseForm(null)} />}
  </Screen>;
}
