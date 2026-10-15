import React from 'react';
import { Pressable, View } from 'react-native';
import { Category, Expense } from '../types/budget';
import { useTheme } from '../theme/useTheme';
import { money } from '../utils/money';
import { readableDate } from '../utils/dates';
import { truncateWithEllipsis } from '../utils/text';
import { AppText } from './ui';
import { Icon } from './Icon';

export function ExpenseRow({ expense, category, onEdit, showDate = true, minHeight, onHeightMeasured, compact = false, showDivider = true }: {
  expense: Expense; category?: Category; onEdit: () => void; showDate?: boolean;
  minHeight?: number; onHeightMeasured?: (height: number) => void; compact?: boolean; showDivider?: boolean;
}) {
  const { colors } = useTheme();
  const displayName = truncateWithEllipsis(expense.name);
  const fixedBadge = expense.fixedExpenseId
    ? expense.note.replace(/^Gasto fijo\s*·\s*/, 'Fijo · ') || 'Gasto fijo' : null;
  return <Pressable accessibilityRole="button" accessibilityLabel={`Editar ${expense.name}${fixedBadge ? `, ${fixedBadge}` : ''}, ${money(expense.amountCents)}`}
    onPress={onEdit} style={({ pressed }) => ({ minHeight, paddingVertical: compact ? 9 : 13, flexDirection: 'row', alignItems: 'center', gap: 10,
      borderBottomWidth: showDivider ? 1 : 0, borderColor: colors.border, opacity: pressed ? 0.65 : 1 })}>
    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: category?.color ?? colors.primary }} />
    <View style={{ flex: 1, gap: 2 }} onLayout={onHeightMeasured ? event => {
      // Medir el texto natural, más 26 px de padding y 1 px del separador.
      // La medida no depende del minHeight asignado a la fila.
      onHeightMeasured(Math.ceil(event.nativeEvent.layout.height) + 27);
    } : undefined}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <AppText numberOfLines={1} ellipsizeMode="tail" style={{ flexShrink: 1, minWidth: 0,
          fontSize: compact ? 13 : 14, lineHeight: compact ? 18 : 22, fontWeight: '600' }}>{displayName}</AppText>
        {fixedBadge && <View style={{ flexShrink: 0, backgroundColor: `${colors.success}22`, borderRadius: 7, paddingHorizontal: 6, paddingVertical: 2 }}>
          <AppText numberOfLines={1} style={{ color: colors.success, fontSize: 9, lineHeight: 13, fontWeight: '600' }}>{fixedBadge}</AppText>
        </View>}
      </View>
      <AppText variant="muted" style={{ fontSize: 11, lineHeight: compact ? 15 : 19 }}>{showDate ? readableDate(expense.date, true) : category?.name}</AppText>
      {!!expense.note && !expense.fixedExpenseId && <AppText variant="muted" numberOfLines={1} style={{ fontSize: 11, lineHeight: compact ? 15 : 19 }}>{expense.note}</AppText>}
    </View>
    <AppText style={{ fontWeight: '600', fontSize: compact ? 13 : 14, lineHeight: compact ? 18 : 22 }}>{money(expense.amountCents)}</AppText>
    <Icon name="edit" color={colors.muted} size={14} />
  </Pressable>;
}
