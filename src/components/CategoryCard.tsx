import React, { useMemo, useRef } from 'react';
import { PanResponder, Pressable, View } from 'react-native';
import { Category, Expense } from '../types/budget';
import { useTheme } from '../theme/useTheme';
import { totalExpenses } from '../utils/budget';
import { money } from '../utils/money';
import { AppText, Card, IconButton } from './ui';
import { Icon } from './Icon';
import { CategoryExpenseList } from './CategoryExpenseList';

export function CategoryCard({ category, expenses, expanded, onToggleExpenses, onAdd, onEditCategory, onEditExpense,
  ordering, onDragStart, onDragMove, onDragEnd }: {
  onAdd: () => void; onEditCategory: () => void; onEditExpense: (expense: Expense) => void;
  expanded: boolean; onToggleExpenses: () => void;
  ordering: boolean; onDragStart: () => void; onDragMove: (offsetX: number, offsetY: number) => void;
  onDragEnd: (offsetX: number, offsetY: number) => void;
  category: Category; expenses: Expense[];
}) {
  const { colors } = useTheme();
  const dragCallbacks = useRef({ ordering, onDragStart, onDragMove, onDragEnd });
  dragCallbacks.current = { ordering, onDragStart, onDragMove, onDragEnd };
  const dragResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => dragCallbacks.current.ordering,
    onStartShouldSetPanResponderCapture: () => dragCallbacks.current.ordering,
    onMoveShouldSetPanResponder: () => dragCallbacks.current.ordering,
    onMoveShouldSetPanResponderCapture: () => dragCallbacks.current.ordering,
    onPanResponderTerminationRequest: () => false,
    onShouldBlockNativeResponder: () => true,
    onPanResponderGrant: () => dragCallbacks.current.onDragStart(),
    onPanResponderMove: (_, gesture) => dragCallbacks.current.onDragMove(gesture.dx, gesture.dy),
    onPanResponderRelease: (_, gesture) => dragCallbacks.current.onDragEnd(gesture.dx, gesture.dy),
    onPanResponderTerminate: (_, gesture) => dragCallbacks.current.onDragEnd(gesture.dx, gesture.dy),
  }), [dragCallbacks]);
  return <Card style={{ padding: 16, gap: 8, flexDirection: 'column' }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 0 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${expanded ? 'Ocultar' : 'Mostrar'} gastos de ${category.name}`}
        accessibilityState={{ expanded }} aria-expanded={expanded} onPress={onToggleExpenses}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 4 }}>
        <View style={{ backgroundColor: category.color, width: 10, height: 34, borderRadius: 5 }} />
        <View style={{ flex: 1, gap: 2 }}>
          <AppText style={{ fontWeight: '600' }}>{category.name}</AppText>
          <AppText variant="muted" style={{ fontSize: 11 }}>{expenses.length} {expenses.length === 1 ? 'gasto' : 'gastos'} · {money(totalExpenses(expenses))}</AppText>
        </View>
      </Pressable>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 0 }}>
        {ordering
          ? <View {...dragResponder.panHandlers} accessibilityRole="button" accessibilityLabel={`Arrastrar para ordenar ${category.name}`}
            accessibilityHint="Mantén presionado y arrastra la tarjeta para cambiar su posición."
            style={{ width: 40, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12 }}>
            <Icon name="gripVertical" color={colors.muted} size={20} />
          </View>
          : <IconButton compact name={expanded ? 'up' : 'down'} label={`${expanded ? 'Ocultar' : 'Mostrar'} gastos de ${category.name}`} onPress={onToggleExpenses} />}
        {!ordering && <IconButton compact name="moreVertical" label={`Editar categoría ${category.name}`} onPress={onEditCategory} />}
      </View>
    </View>
    {expanded && (expenses.length > 0
      ? <CategoryExpenseList category={category} expenses={expenses} onEdit={onEditExpense} />
      : <View style={{ paddingVertical: 20 }}>
        <AppText variant="muted" style={{ textAlign: 'center' }}>Sin gastos en esta quincena.</AppText>
      </View>)}
    <Pressable accessibilityRole="button" accessibilityLabel={`Añadir gasto en ${category.name}`} onPress={onAdd}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, minHeight: 44,
        borderRadius: 12, backgroundColor: pressed ? colors.primarySoft : colors.surfaceAlt })}>
      <Icon name="plus" color={colors.primary} size={17} /><AppText style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>Añadir gasto</AppText>
    </Pressable>
  </Card>;
}
