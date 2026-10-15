import React, { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useBudget } from '../context/BudgetContext';
import { Expense, FixedExpense, HistoryPeriod } from '../types/budget';
import { useTheme } from '../theme/useTheme';
import { categoryTotals, expensesAndFixedInRange, groupByDay, totalExpenses } from '../utils/budget';
import { historyRange, movePeriod, rangeLabel, readableDate, today } from '../utils/dates';
import { money } from '../utils/money';
import { AppText, Card, EmptyState, Screen, ScreenHeader, Segmented } from '../components/ui';
import { PeriodNavigator } from '../components/PeriodNavigator';
import { ExpenseRow } from '../components/ExpenseRow';
import { webScrollbarStyle } from '../utils/scrollStyles';
import { ExpenseForm } from '../components/ExpenseForm';
import { ExpenseDatePicker } from '../components/ExpenseDatePicker';
import { Icon } from '../components/Icon';
import { SummaryCard } from '../components/SummaryCard';
import { FixedExpenseForm } from '../components/FixedExpensesCard';

const options: { value: HistoryPeriod; label: string }[] = [
  { value: 'day', label: 'Día' }, { value: 'week', label: 'Semana' }, { value: 'month', label: 'Mes' }, { value: 'year', label: 'Año' },
];

export function HistoryScreen() {
  const { state } = useBudget();
  const { colors } = useTheme();
  const [period, setPeriod] = useState<HistoryPeriod>('month');
  const [anchor, setAnchor] = useState(today);
  const [showDate, setShowDate] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [editingFixed, setEditingFixed] = useState<FixedExpense | null>(null);
  const [search, setSearch] = useState('');
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.textContent = `
      [id^="history-expense-scroll-"] { scrollbar-width: thin; scrollbar-color: ${colors.muted}33 transparent; }
      [id^="history-expense-scroll-"]::-webkit-scrollbar { width: 6px; }
      [id^="history-expense-scroll-"]::-webkit-scrollbar-track { background: transparent; }
      [id^="history-expense-scroll-"]::-webkit-scrollbar-thumb { background: ${colors.muted}33; border-radius: 999px; }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, [colors.muted]);
  const range = historyRange(period, anchor);
  const previousRange = historyRange(period, movePeriod(period, anchor, -1));
  const expenses = expensesAndFixedInRange(state.expenses, state.fixedExpenses, range, state.paymentSchedule);
  const total = totalExpenses(expenses);
  const previousTotal = totalExpenses(expensesAndFixedInRange(state.expenses, state.fixedExpenses, previousRange, state.paymentSchedule));
  const normalizedSearch = normalizeSearch(search.trim());
  const filteredExpenses = normalizedSearch ? expenses.filter(expense => {
    const category = state.categories.find(item => item.id === expense.categoryId)?.name ?? '';
    return normalizeSearch(`${expense.name} ${expense.note ?? ''} ${category}`).includes(normalizedSearch);
  }) : expenses;
  const groups = groupByDay(filteredExpenses);
  const mainCategory = categoryTotals(state.categories, expenses).filter(c => c.total > 0).sort((a, b) => b.total - a.total)[0];
  const comparisonName: Record<HistoryPeriod, string> = {
    day: 'el día anterior', week: 'la semana anterior', month: 'el mes anterior', year: 'el año anterior',
  };

  return <Screen>
    <ScreenHeader subtitle="Encuentra tus gastos y reconoce tus hábitos." />
    <View style={{ gap: 10 }}>
      <Segmented options={options} value={period} onChange={setPeriod} />
      <Card style={{ padding: 10, gap: 6 }}>
        <PeriodNavigator label={rangeLabel(range)} onPrevious={() => setAnchor(movePeriod(period, anchor, -1))} onNext={() => setAnchor(movePeriod(period, anchor, 1))} />
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Volver al período actual" onPress={() => setAnchor(today())}
            style={({ pressed }) => ({ minHeight: 38, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 12,
              backgroundColor: pressed ? colors.primarySoft : colors.surfaceAlt })}>
            <AppText style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>Hoy</AppText>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={showDate ? 'Cerrar selector de fecha' : 'Elegir fecha'}
            accessibilityState={{ expanded: showDate }} aria-expanded={showDate} onPress={() => setShowDate(value => !value)}
            style={({ pressed }) => ({ minHeight: 38, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 12,
              backgroundColor: pressed || showDate ? colors.primarySoft : colors.surfaceAlt })}>
            <AppText style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>Elegir fecha</AppText>
          </Pressable>
        </View>
        {showDate && <View style={{ borderTopWidth: 1, borderColor: colors.border, paddingTop: 12 }}>
          <ExpenseDatePicker value={anchor} onChange={date => { setAnchor(date); setShowDate(false); }} label="Fecha de referencia" />
        </View>}
      </Card>
    </View>
    <SummaryCard variant="history" totalCents={total} movementCount={expenses.length} mainCategory={mainCategory}
      previousTotalCents={previousTotal} comparisonLabel={`vs. ${comparisonName[period]}`} />
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <AppText variant="heading">Movimientos</AppText>
        <View accessibilityLabel={`${filteredExpenses.length} resultados`} style={{ backgroundColor: colors.surfaceAlt, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 }}>
          <AppText style={{ color: colors.muted, fontSize: 11, fontWeight: '600' }}>{filteredExpenses.length}</AppText>
        </View>
      </View>
      <HistorySearch value={search} onChange={setSearch} />
      {groups.length === 0 && <Card><EmptyState
        title={normalizedSearch ? 'No encontramos movimientos' : 'Sin movimientos en este período'}
        description={normalizedSearch ? 'Prueba con otro nombre, categoría o nota.' : 'Cambia el período o la fecha para consultar otros movimientos.'} /></Card>}
      {groups.map(group => <HistoryExpenseGroup key={group.date} group={group} categories={state.categories}
        onEdit={expense => {
          if (expense.fixedExpenseId) {
            const fixedExpense = state.fixedExpenses.find(item => item.id === expense.fixedExpenseId);
            if (fixedExpense) setEditingFixed(fixedExpense);
          } else setEditing(expense);
        }} />)}
    </View>
    {editing && <ExpenseForm expense={editing} onClose={() => setEditing(null)} />}
    {editingFixed && <FixedExpenseForm expense={editingFixed} onClose={() => setEditingFixed(null)} />}
  </Screen>;
}

function HistorySearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { colors } = useTheme();
  return <View style={{ minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14,
    backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 14 }}>
    <Icon name="search" color={colors.muted} size={19} />
    <TextInput value={value} onChangeText={onChange} accessibilityLabel="Buscar movimientos por nombre, categoría o nota"
      placeholder="Buscar movimiento..." placeholderTextColor={colors.muted} returnKeyType="search" underlineColorAndroid="transparent"
      style={{ flex: 1, minHeight: 48, paddingVertical: 0, color: colors.text, fontSize: 14 }} />
    {!!value && <Pressable accessibilityRole="button" accessibilityLabel="Limpiar búsqueda" onPress={() => onChange('')}
      hitSlop={8} style={{ width: 32, height: 36, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="close" color={colors.muted} size={17} />
    </Pressable>}
  </View>;
}

function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

const MAX_VISIBLE_HISTORY_ROWS = 4;

function HistoryExpenseGroup({ group, categories, onEdit }: {
  group: ReturnType<typeof groupByDay>[number];
  categories: ReturnType<typeof useBudget>['state']['categories'];
  onEdit: (expense: Expense) => void;
}) {
  const [rowHeights, setRowHeights] = useState<Record<string, number>>({});
  const hasOverflow = group.expenses.length > MAX_VISIBLE_HISTORY_ROWS;
  const rowHeight = Math.max(72, ...group.expenses.map(expense => rowHeights[expense.id] ?? 0));
  const visibleHeight = rowHeight * MAX_VISIBLE_HISTORY_ROWS;
  const rows = group.expenses.map(expense => <ExpenseRow key={expense.id} expense={expense}
    category={categories.find(category => category.id === expense.categoryId)} showDate={false}
    minHeight={hasOverflow ? rowHeight : undefined}
    onHeightMeasured={height => setRowHeights(previous => previous[expense.id] === height
      ? previous : { ...previous, [expense.id]: height })}
    onEdit={() => onEdit(expense)} />);

  return <Card style={{ padding: 16 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingBottom: 9 }}>
      <AppText style={{ fontSize: 12, flex: 1, fontWeight: '600' }}>{readableDate(group.date)}</AppText>
      {group.expenses.length > 1 && <AppText variant="muted" style={{ fontSize: 11 }}>
        {group.expenses.length} movimientos · {money(totalExpenses(group.expenses))}
      </AppText>}
    </View>
    {hasOverflow
      ? <ScrollView nativeID={`history-expense-scroll-${group.date}`} nestedScrollEnabled showsVerticalScrollIndicator keyboardShouldPersistTaps="handled"
        directionalLockEnabled style={[{ height: visibleHeight, flexGrow: 0 }, webScrollbarStyle]}>
        {rows}
      </ScrollView>
      : <View>{rows}</View>}
  </Card>;
}
