import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useBudget } from '../context/BudgetContext';
import { Expense } from '../types/budget';
import { useTheme } from '../theme/useTheme';
import { makeId } from '../utils/budget';
import { isValidDate, today } from '../utils/dates';
import { money, moneyInput, parseMoney, sanitizeMoneyInput } from '../utils/money';
import { AppText, Button, Field } from './ui';
import { ConfirmAction, ConfirmDelete, ModalSheet } from './ModalSheet';
import { ExpenseDatePicker } from './ExpenseDatePicker';

export interface ExpenseFormProps {
  expense?: Expense;
  categoryId?: string;
  defaultDate?: string;
  onClose: () => void;
}

export function ExpenseForm({ expense, categoryId: initialCategory, defaultDate, onClose }: ExpenseFormProps) {
  const { state, dispatch } = useBudget();
  const { colors } = useTheme();
  const [name, setName] = useState(expense?.name ?? '');
  const [amount, setAmount] = useState(expense ? moneyInput(expense.amountCents) : '');
  const [categoryId, setCategoryId] = useState(expense?.categoryId ?? initialCategory ?? state.categories[0]?.id ?? '');
  const [date, setDate] = useState(expense?.date ?? defaultDate ?? today());
  const [note, setNote] = useState(expense?.note ?? '');
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);

  function save() {
    const amountCents = parseMoney(amount);
    if (!name.trim()) return setError('Escribe el nombre del gasto.');
    if (amountCents === null || amountCents <= 0) return setError('Ingresa un monto mayor a cero, con máximo dos decimales.');
    if (!isValidDate(date)) return setError('Selecciona una fecha válida entre 1900 y 2100.');
    if (!state.categories.some(c => c.id === categoryId)) return setError('Selecciona una categoría.');
    setConfirmSave(true);
  }

  function saveConfirmed() {
    const amountCents = parseMoney(amount);
    if (amountCents === null) return;
    dispatch({ type: 'SAVE_EXPENSE', expense: {
      id: expense?.id ?? makeId(), name: name.trim(), amountCents, categoryId, date, note: note.trim(),
    } });
    onClose();
  }

  return <>
    <ModalSheet visible={!confirmDelete && !confirmSave} title={expense ? 'Editar gasto' : 'Nuevo gasto'} onClose={onClose}>
      <Field label="Nombre del gasto" value={name} onChangeText={setName} placeholder="Ej. Almuerzo del lunes" maxLength={70} />
      <Field label="Monto (USD)" value={amount} onChangeText={value => setAmount(sanitizeMoneyInput(value))} placeholder="0.00" keyboardType="decimal-pad" maxLength={9}
        hint="Puedes usar punto o coma para los decimales." />
      <View style={{ gap: 8 }}>
        <AppText style={{ fontWeight: '600', fontSize: 13 }}>Categoría</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {state.categories.map(category => <Pressable key={category.id} accessibilityRole="button" accessibilityLabel={category.name}
            accessibilityState={{ selected: categoryId === category.id }} aria-selected={categoryId === category.id} onPress={() => setCategoryId(category.id)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 7, minHeight: 44, paddingHorizontal: 12, paddingVertical: 8,
              borderWidth: 1, borderColor: categoryId === category.id ? colors.primary : colors.border,
              borderRadius: 12, backgroundColor: categoryId === category.id ? colors.primarySoft : colors.surface }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: category.color }} />
            <AppText style={{ fontSize: 12, fontWeight: '600' }}>{category.name}</AppText>
          </Pressable>)}
        </View>
      </View>
      <ExpenseDatePicker value={date} onChange={setDate} />
      <Field label="Nota (opcional)" value={note} onChangeText={setNote} placeholder="Un detalle para recordar" maxLength={200} multiline numberOfLines={2} />
      {!!error && <AppText accessibilityRole="alert" style={{ color: colors.danger }}>{error}</AppText>}
      <Button title={expense ? 'Guardar cambios' : 'Guardar gasto'} icon="check" onPress={save} />
      {expense && <Button title="Eliminar gasto" icon="trash" variant="danger" onPress={() => setConfirmDelete(true)} />}
    </ModalSheet>
    <ConfirmAction visible={confirmSave} title={expense ? '¿Guardar cambios del gasto?' : '¿Guardar gasto?'}
      description={expense ? `Se actualizará “${name.trim()}” por ${money(parseMoney(amount) ?? 0)}.` : `Se agregará “${name.trim()}” por ${money(parseMoney(amount) ?? 0)}.`}
      confirmTitle={expense ? 'Sí, guardar cambios' : 'Sí, guardar gasto'}
      onCancel={() => setConfirmSave(false)} onConfirm={saveConfirmed} />
    <ConfirmDelete visible={confirmDelete} title="¿Eliminar gasto?" description={`Se eliminará “${expense?.name ?? ''}” por ${money(expense?.amountCents ?? 0)}.`}
      onCancel={() => setConfirmDelete(false)} onConfirm={() => {
        if (expense) dispatch({ type: 'DELETE_EXPENSE', id: expense.id });
        onClose();
      }} />
  </>;
}
