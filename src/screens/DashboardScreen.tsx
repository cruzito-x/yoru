import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useBudget } from '../context/BudgetContext';
import { Category } from '../types/budget';
import { useTheme } from '../theme/useTheme';
import { categoryTotals, expensesInRange, totalExpenses } from '../utils/budget';
import { fortnight, moveFortnight, rangeLabel, today } from '../utils/dates';
import { money, percentage } from '../utils/money';
import { AppText, Card, EmptyState, Screen, ScreenHeader } from '../components/ui';
import { Icon } from '../components/Icon';
import { PeriodNavigator } from '../components/PeriodNavigator';
import { DonutChart } from '../components/DonutChart';
import { CategoryCarousel } from '../components/CategoryCarousel';
import { CategoryForm } from '../components/CategoryForm';
import { ExpenseForm, ExpenseFormProps } from '../components/ExpenseForm';
import { calculateFortnightPayroll } from '../utils/payroll';
import { SummaryCard } from '../components/SummaryCard';

export function DashboardScreen() {
  const { state, dispatch } = useBudget();
  const { colors } = useTheme();
  const [anchor, setAnchor] = useState(today);
  const [categoryForm, setCategoryForm] = useState<{ category?: Category } | null>(null);
  const [expenseForm, setExpenseForm] = useState<Omit<ExpenseFormProps, 'onClose'> | null>(null);
  const [chartLegendExpanded, setChartLegendExpanded] = useState(false);
  const [orderingCategories, setOrderingCategories] = useState(false);
  const range = fortnight(anchor);
  const expenses = expensesInRange(state.expenses, range);
  const payroll = calculateFortnightPayroll(state.payrollSettings.monthlySalaryCents);
  const income = payroll.netCents + Math.round(state.payrollSettings.travelAllowanceCents / 2);
  const incomeName = 'ingreso';
  const spent = totalExpenses(expenses);
  const balance = income - spent;
  const totals = categoryTotals(state.categories, expenses);
  const categoriesWithExpenses = totals.filter(category => category.total > 0);
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
    <ScreenHeader subtitle="Cada gasto cuenta. Cada saldo, también." />
    <PeriodNavigator label={rangeLabel(range)} onPrevious={() => setAnchor(moveFortnight(anchor, -1))} onNext={() => setAnchor(moveFortnight(anchor, 1))} />
    <SummaryCard variant="dashboard" balanceCents={balance} incomeCents={income} spentCents={spent} />
    <Card style={{ gap: 18 }}>
      <View><AppText variant="heading">Así va tu dinero</AppText><AppText variant="muted">{spent > income ? 'Distribución de los gastos · saldo agotado' : `Distribución de tu ${incomeName} quincenal`}</AppText></View>
      <DonutChart segments={segments} centerValue={income > 0 ? `${percentage(spent, income).toFixed(1)}%` : money(spent)} centerLabel={income > 0 ? `del ${incomeName} gastado` : 'sin sueldo configurado'} />
      <View style={{ borderTopWidth: 1, borderColor: colors.border }}>
        {chartLegendExpanded && categoriesWithExpenses.length > 0 && <View style={{ gap: 11, paddingTop: 4 }}>
          {categoriesWithExpenses.map(category => <View key={category.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: category.color }} />
            <AppText style={{ flex: 1, fontSize: 13 }}>{category.name}</AppText>
            <AppText style={{ fontSize: 12, fontWeight: '600' }}>{money(category.total)}</AppText>
            <AppText variant="muted" style={{ width: 47, textAlign: 'right', fontSize: 11 }}>{percentage(category.total, denominator).toFixed(1)}%</AppText>
          </View>)}
        </View>}
        <Pressable accessibilityRole="button" accessibilityLabel={`${chartLegendExpanded ? 'Ocultar' : 'Mostrar'} detalle del gráfico desde saldo restante`}
          accessibilityState={{ expanded: chartLegendExpanded }} aria-expanded={chartLegendExpanded}
          onPress={() => setChartLegendExpanded(value => !value)}
          style={({ pressed }) => ({ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 9,
            borderTopWidth: chartLegendExpanded && categoriesWithExpenses.length > 0 ? 1 : 0,
            borderColor: colors.border, opacity: pressed ? 0.7 : 1 })}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.balance }} />
            <AppText style={{ flex: 1, fontSize: 13 }}>Saldo restante</AppText>
            <AppText style={{ fontSize: 12, fontWeight: '600' }}>{money(Math.max(balance, 0))}</AppText>
            <AppText variant="muted" style={{ width: 47, textAlign: 'right', fontSize: 11 }}>{percentage(Math.max(balance, 0), denominator).toFixed(1)}%</AppText>
            <Icon name={chartLegendExpanded ? 'up' : 'down'} color={colors.muted} size={16} />
        </Pressable>
      </View>
      {balance < 0 && <View style={{ backgroundColor: colors.dangerSoft, borderRadius: 12, padding: 12 }}>
        <AppText style={{ color: colors.danger, fontSize: 12 }}>Excediste tu {incomeName} por {money(-balance)}. Los porcentajes de la dona representan los gastos totales.</AppText>
      </View>}
    </Card>
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <View style={{ flex: 1 }}><AppText variant="heading">Tus categorías</AppText><AppText variant="muted">Organiza cada movimiento.</AppText></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {!orderingCategories && <Pressable accessibilityRole="button" accessibilityLabel="Añadir categoría" onPress={() => setCategoryForm({})}
            style={({ pressed }) => ({ minHeight: 42, justifyContent: 'center', paddingHorizontal: 10, borderRadius: 12,
              backgroundColor: pressed ? colors.primarySoft : colors.surfaceAlt })}>
            <AppText style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>+ Categoría</AppText>
          </Pressable>}
          {state.categories.length > 1 && <Pressable accessibilityRole="button" accessibilityLabel={orderingCategories ? 'Terminar de ordenar categorías' : 'Ordenar categorías'}
            onPress={() => setOrderingCategories(value => !value)}
            style={({ pressed }) => ({ minHeight: 42, justifyContent: 'center', paddingHorizontal: 10, borderRadius: 12,
              backgroundColor: pressed ? colors.primarySoft : orderingCategories ? colors.primarySoft : 'transparent' })}>
            <AppText style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>{orderingCategories ? 'Listo' : 'Ordenar'}</AppText>
          </Pressable>}
        </View>
      </View>
      {state.categories.length === 0 && <EmptyState title="Empieza por una categoría" description="Crea una categoría para poder registrar tus gastos." />}
      <CategoryCarousel categories={state.categories} expenses={expenses} ordering={orderingCategories}
        onMove={(categoryId, index) => dispatch({ type: 'MOVE_CATEGORY_TO_INDEX', id: categoryId, index })} onAdd={addExpense}
        onEditCategory={category => setCategoryForm({ category })} onEditExpense={expense => setExpenseForm({ expense })} />
    </View>
    {categoryForm && <CategoryForm category={categoryForm.category} onClose={() => setCategoryForm(null)} />}
    {expenseForm && <ExpenseForm {...expenseForm} onClose={() => setExpenseForm(null)} />}
  </Screen>;
}
