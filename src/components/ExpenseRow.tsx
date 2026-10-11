import React from "react";
import { Pressable, View } from "react-native";
import { Category, Expense } from "../types/budget";
import { useTheme } from "../theme/useTheme";
import { money } from "../utils/money";
import { readableDate } from "../utils/dates";
import { AppText } from "./ui";
import { Icon } from "./Icon";

export function ExpenseRow({
  expense,
  category,
  onEdit,
  showDate = true,
}: {
  expense: Expense;
  category?: Category;
  onEdit: () => void;
  showDate?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Editar ${expense.name}, ${money(expense.amountCents)}`}
      onPress={onEdit}
      style={({ pressed }) => ({
        paddingVertical: 13,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderBottomWidth: 1,
        borderColor: colors.border,
        opacity: pressed ? 0.65 : 1,
      })}
    >
      <View
        style={{
          width: 7,
          height: 7,
          borderRadius: 4,
          backgroundColor: category?.color ?? colors.primary,
        }}
      />
      <View style={{ flex: 1, gap: 2 }}>
        <AppText style={{ fontSize: 14, fontWeight: "600" }}>
          {expense.name}
        </AppText>
        <AppText variant="muted" style={{ fontSize: 11 }}>
          {showDate ? readableDate(expense.date, true) : category?.name}
        </AppText>
        {!!expense.note && (
          <AppText variant="muted" numberOfLines={1} style={{ fontSize: 11 }}>
            {expense.note}
          </AppText>
        )}
      </View>
      <AppText style={{ fontWeight: "600", fontSize: 14 }}>
        {money(expense.amountCents)}
      </AppText>
      <Icon name="edit" color={colors.muted} size={14} />
    </Pressable>
  );
}
