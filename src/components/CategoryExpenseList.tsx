import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Category, Expense } from '../types/budget';
import { webScrollbarStyle } from '../utils/scrollStyles';
import { ExpenseRow } from './ExpenseRow';

const MAX_VISIBLE_EXPENSES = 4;

// Las filas toman la altura del contenido más alto de esta categoría. Así
// se mantienen como máximo cuatro filas completas visibles al deslizar.
export function CategoryExpenseList({ category, expenses, onEdit }: {
  category: Category; expenses: Expense[]; onEdit: (expense: Expense) => void;
}) {
  const [rowHeights, setRowHeights] = useState<Record<string, number>>({});
  const hasOverflow = expenses.length > MAX_VISIBLE_EXPENSES;
  const rowHeight = Math.max(80, ...expenses.map(expense => rowHeights[expense.id] ?? 0));
  const visibleHeight = rowHeight * MAX_VISIBLE_EXPENSES;
  const rows = expenses.map(expense => <ExpenseRow key={expense.id}
    expense={expense} category={category} onEdit={() => onEdit(expense)}
    showDivider={expenses.length > 1}
    minHeight={hasOverflow ? rowHeight : undefined}
    onHeightMeasured={height => {
      setRowHeights(previous => previous[expense.id] === height ? previous : { ...previous, [expense.id]: height });
    }} />);

  if (!hasOverflow) return <View testID={`category-expenses-${category.id}`}>{rows}</View>;

  return <ScrollView testID={`category-expenses-${category.id}`} nestedScrollEnabled
    showsVerticalScrollIndicator keyboardShouldPersistTaps="handled" directionalLockEnabled
    style={[{ height: visibleHeight, flexGrow: 0 }, webScrollbarStyle]}>
    {rows}
  </ScrollView>;
}
