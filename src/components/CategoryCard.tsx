import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Category, Expense } from '../types/budget';
import { useTheme } from '../theme/useTheme';
import { totalExpenses } from '../utils/budget';
import { money } from '../utils/money';
import { AppText, Card, IconButton } from './ui';
import { ExpenseRow } from './ExpenseRow';
import { Icon } from './Icon';

export function CategoryCard({ category, expenses, onAdd, onEditCategory, onEditExpense }: {
  category: Category; expenses: Expense[]; onAdd: () => void; onEditCategory: () => void; onEditExpense: (expense: Expense) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { colors } = useTheme();
  return <Card style={{ padding: 16, gap: 8 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Mostrar gastos de ${category.name}`}
        accessibilityState={{ expanded }} aria-expanded={expanded} onPress={() => setExpanded(v => !v)}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 4 }}>
        <View style={{ backgroundColor: category.color, width: 10, height: 34, borderRadius: 5 }} />
        <View style={{ flex: 1, gap: 2 }}>
          <AppText style={{ fontWeight: '600' }}>{category.name}</AppText>
          <AppText variant="muted" style={{ fontSize: 11 }}>{expenses.length} {expenses.length === 1 ? 'gasto' : 'gastos'} · {money(totalExpenses(expenses))}</AppText>
        </View>
        <View style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}><Icon name="down" color={colors.muted} size={16} /></View>
      </Pressable>
      <IconButton name="edit" label={`Editar categoría ${category.name}`} onPress={onEditCategory} />
    </View>
    {expanded && <View>
      {expenses.length === 0 ? <AppText variant="muted" style={{ paddingVertical: 12 }}>Sin gastos en esta quincena.</AppText>
        : expenses.map(expense => <ExpenseRow key={expense.id} expense={expense} category={category} onEdit={() => onEditExpense(expense)} />)}
    </View>}
    <Pressable accessibilityRole="button" accessibilityLabel={`Añadir gasto en ${category.name}`} onPress={onAdd}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, minHeight: 44,
        borderRadius: 12, backgroundColor: pressed ? colors.primarySoft : colors.surfaceAlt })}>
      <Icon name="plus" color={colors.primary} size={16} /><AppText style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>Añadir gasto</AppText>
    </Pressable>
  </Card>;
}
