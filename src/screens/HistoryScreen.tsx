import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, View, type ViewStyle } from 'react-native';
import { useBudget } from '../context/BudgetContext';
import { Expense, HistoryPeriod } from '../types/budget';
import { useTheme } from '../theme/useTheme';
import { categoryTotals, expensesInRange, groupByDay, totalExpenses } from '../utils/budget';
import { historyRange, isValidDate, movePeriod, rangeLabel, readableDate, today } from '../utils/dates';
import { money } from '../utils/money';
import { AppText, Button, Card, EmptyState, Field, Screen, ScreenHeader, Segmented } from '../components/ui';
import { PeriodNavigator } from '../components/PeriodNavigator';
import { ExpenseRow } from '../components/ExpenseRow';
import { ExpenseForm } from '../components/ExpenseForm';

const options: { value: HistoryPeriod; label: string }[] = [
  { value: 'day', label: 'Día' }, { value: 'week', label: 'Semana' }, { value: 'month', label: 'Mes' }, { value: 'year', label: 'Año' },
];

export function HistoryScreen() {
  const { state } = useBudget();
  const { colors } = useTheme();
  const [period, setPeriod] = useState<HistoryPeriod>('month');
  const [anchor, setAnchor] = useState(today);
  const [dateInput, setDateInput] = useState(today);
  const [dateError, setDateError] = useState('');
  const [showDate, setShowDate] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const range = historyRange(period, anchor);
  const expenses = expensesInRange(state.expenses, range);
  const total = totalExpenses(expenses);
  const groups = groupByDay(expenses);
  const mainCategory = categoryTotals(state.categories, expenses).filter(c => c.total > 0).sort((a, b) => b.total - a.total)[0];

  function selectDate() {
    if (!isValidDate(dateInput)) return setDateError('Escribe una fecha válida con formato AAAA-MM-DD.');
    setAnchor(dateInput);
    setDateError('');
    setShowDate(false);
  }

  return <Screen>
    <ScreenHeader title="Tu historial." subtitle="Encuentra tus gastos y reconoce tus hábitos." />
    <Segmented options={options} value={period} onChange={setPeriod} />
    <View style={{ gap: 4 }}>
      <PeriodNavigator label={rangeLabel(range)} onPrevious={() => setAnchor(movePeriod(period, anchor, -1))} onNext={() => setAnchor(movePeriod(period, anchor, 1))} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver al período actual" onPress={() => setAnchor(today())} style={{ minHeight: 44, justifyContent: 'center' }}>
          <AppText style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>Ir a hoy</AppText>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Elegir fecha" onPress={() => { setShowDate(v => !v); setDateInput(anchor); }} style={{ minHeight: 44, justifyContent: 'center' }}>
          <AppText style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>Elegir fecha</AppText>
        </Pressable>
      </View>
      {showDate && <Card style={{ gap: 12 }}>
        <Field label="Fecha de referencia (AAAA-MM-DD)" value={dateInput} onChangeText={setDateInput} maxLength={10} />
        {!!dateError && <AppText style={{ color: colors.danger }}>{dateError}</AppText>}
        <Button title="Ver período" onPress={selectDate} />
      </Card>}
    </View>
    <Card style={{ gap: 20 }}>
      <View style={{ gap: 4 }}><AppText variant="label">GASTOS DEL PERÍODO</AppText><AppText style={{ fontSize: 35, lineHeight: 42, fontWeight: '700', letterSpacing: -1 }}>{money(total)}</AppText></View>
      <View style={{ flexDirection: 'row', gap: 16, borderTopWidth: 1, borderColor: colors.border, paddingTop: 15 }}>
        <View style={{ flex: 1, gap: 4 }}><AppText variant="muted">Movimientos</AppText><AppText style={{ fontWeight: '600' }}>{expenses.length}</AppText></View>
        <View style={{ flex: 1, gap: 4 }}><AppText variant="muted">Mayor categoría</AppText><AppText style={{ fontWeight: '600', fontSize: 13 }}>{mainCategory?.name ?? 'Sin gastos'}</AppText></View>
      </View>
    </Card>
    <View style={{ gap: 14 }}>
      <AppText variant="heading">Movimientos</AppText>
      {groups.length === 0 && <Card><EmptyState title="Todo en orden" description="No hay gastos registrados en este período. Puedes cambiar la fecha para consultar otros movimientos." /></Card>}
      {groups.map(group => <HistoryExpenseGroup key={group.date} group={group} categories={state.categories}
        onEdit={expense => setEditing(expense)} />)}
    </View>
    {editing && <ExpenseForm expense={editing} onClose={() => setEditing(null)} />}
  </Screen>;
}

const MAX_VISIBLE_HISTORY_ROWS = 4;

function HistoryExpenseGroup({ group, categories, onEdit }: {
  group: ReturnType<typeof groupByDay>[number];
  categories: ReturnType<typeof useBudget>['state']['categories'];
  onEdit: (expense: Expense) => void;
}) {
  const { colors } = useTheme();
  const [rowHeights, setRowHeights] = useState<Record<string, number>>({});
  const hasOverflow = group.expenses.length > MAX_VISIBLE_HISTORY_ROWS;
  const rowHeight = Math.max(72, ...group.expenses.map(expense => rowHeights[expense.id] ?? 0));
  const visibleHeight = rowHeight * MAX_VISIBLE_HISTORY_ROWS;
  const webScrollbarStyle = Platform.OS === 'web' ? { scrollbarWidth: 'thin' } as ViewStyle : undefined;
  const rows = group.expenses.map(expense => <ExpenseRow key={expense.id} expense={expense}
    category={categories.find(category => category.id === expense.categoryId)} showDate={false}
    minHeight={hasOverflow ? rowHeight : undefined}
    onHeightMeasured={height => setRowHeights(previous => previous[expense.id] === height
      ? previous : { ...previous, [expense.id]: height })}
    onEdit={() => onEdit(expense)} />);

  return <Card style={{ padding: 16 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingBottom: 9 }}>
      <AppText variant="muted" style={{ fontSize: 11, flex: 1 }}>{readableDate(group.date)}</AppText>
      <AppText style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>{money(totalExpenses(group.expenses))}</AppText>
    </View>
    {hasOverflow
      ? <ScrollView nestedScrollEnabled showsVerticalScrollIndicator keyboardShouldPersistTaps="handled"
        directionalLockEnabled style={[{ height: visibleHeight, flexGrow: 0 }, webScrollbarStyle]}>
        {rows}
      </ScrollView>
      : <View>{rows}</View>}
  </Card>;
}
