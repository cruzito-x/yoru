import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useBudget } from '../context/BudgetContext';
import { FixedExpense } from '../types/budget';
import { useTheme } from '../theme/useTheme';
import { makeId } from '../utils/budget';
import { money, moneyInput, parseMoney, sanitizeMoneyInput } from '../utils/money';
import { AppText, Button, Card, Field, IconButton, Segmented } from './ui';
import { Icon } from './Icon';
import { ModalSheet, ConfirmAction, ConfirmDelete } from './ModalSheet';
import { CategoryForm } from './CategoryForm';

export function FixedExpensesCard() {
  const { state, dispatch } = useBudget();
  const { colors } = useTheme();
  const [editing, setEditing] = useState<FixedExpense | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<FixedExpense | null>(null);

  return <>
    <Card style={{ gap: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Icon name="wallet" color={colors.primary} />
        <View style={{ flex: 1 }}><AppText variant="heading">Gastos fijos</AppText></View>
      </View>
      {state.fixedExpenses.length === 0
        ? <AppText variant="muted">Aún no tienes gastos fijos configurados.</AppText>
        : <View>
          {state.fixedExpenses.map((expense, index) => {
            const category = state.categories.find(item => item.id === expense.categoryId);
            return <View key={expense.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 7,
              minHeight: 64, borderBottomWidth: index === state.fixedExpenses.length - 1 ? 0 : 1, borderColor: colors.border }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: category?.color ?? colors.muted }} />
              <Pressable accessibilityRole="button" accessibilityLabel={`Editar gasto fijo ${expense.name}`}
                onPress={() => setEditing(expense)} style={{ flex: 1, paddingVertical: 8 }}>
                <AppText style={{ fontSize: 13, fontWeight: '600' }}>{expense.name}</AppText>
                <AppText variant="muted" style={{ fontSize: 11 }}>{category?.name ?? 'Categoría'} · {expense.payFortnight === 1 ? '1.ª' : '2.ª'} quincena</AppText>
              </Pressable>
              <AppText style={{ fontSize: 12, fontWeight: '600' }}>{money(expense.amountCents)}</AppText>
              <IconButton compact name="edit" label={`Editar gasto fijo ${expense.name}`} onPress={() => setEditing(expense)} />
              <IconButton compact name="trash" label={`Eliminar gasto fijo ${expense.name}`} onPress={() => setDeleting(expense)} />
            </View>;
          })}
        </View>}
      <Button title="Agregar gasto fijo" icon="plus" onPress={() => setEditing(null)} />
    </Card>
    {editing !== undefined && <FixedExpenseForm key={editing?.id ?? 'new-fixed-expense'} expense={editing ?? undefined} onClose={() => setEditing(undefined)} />}
    <ConfirmDelete visible={!!deleting} title="¿Eliminar gasto fijo?"
      description={`Se eliminará “${deleting?.name ?? ''}” de tus gastos fijos.`}
      onCancel={() => setDeleting(null)} onConfirm={() => {
        if (deleting) dispatch({ type: 'DELETE_FIXED_EXPENSE', id: deleting.id });
        setDeleting(null);
      }} />
  </>;
}

function FixedExpenseForm({ expense, onClose }: { expense?: FixedExpense; onClose: () => void }) {
  const { state, dispatch } = useBudget();
  const { colors } = useTheme();
  const [name, setName] = useState(expense?.name ?? '');
  const [amount, setAmount] = useState(expense ? moneyInput(expense.amountCents) : '');
  const [categoryId, setCategoryId] = useState(expense?.categoryId ?? state.categories[0]?.id ?? '');
  const [payFortnight, setPayFortnight] = useState<1 | 2>(expense?.payFortnight ?? 1);
  const [error, setError] = useState('');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);

  useEffect(() => {
    if (!state.categories.some(category => category.id === categoryId) && state.categories.length > 0) {
      setCategoryId(state.categories[state.categories.length - 1].id);
    }
  }, [categoryId, state.categories]);

  function save() {
    const amountCents = parseMoney(amount);
    if (!name.trim()) return setError('Escribe el nombre del gasto fijo.');
    if (amountCents === null || amountCents <= 0) return setError('Ingresa un monto mayor a cero, con máximo dos decimales.');
    if (!state.categories.some(category => category.id === categoryId)) {
      return setError('Selecciona una categoría o crea una nueva.');
    }
    setError('');
    setConfirmSave(true);
  }

  function saveConfirmed() {
    const amountCents = parseMoney(amount);
    if (amountCents === null || !state.categories.some(category => category.id === categoryId)) {
      setConfirmSave(false);
      setError('Selecciona una categoría válida y un monto mayor a cero.');
      return;
    }
    dispatch({ type: 'SAVE_FIXED_EXPENSE', expense: {
      id: expense?.id ?? makeId(), name: name.trim(), amountCents, categoryId, payFortnight,
    } });
    onClose();
  }

  return <>
    <ModalSheet visible={!confirmSave && !showCategoryForm}
      title={expense ? 'Editar gasto fijo' : 'Nuevo gasto fijo'} onClose={onClose}>
      <Field label="Nombre del gasto fijo" value={name} onChangeText={setName} placeholder="Ej. Internet" maxLength={70} />
      <Field label="Monto mensual (USD)" value={amount} onChangeText={value => setAmount(sanitizeMoneyInput(value))}
        placeholder="0.00" keyboardType="decimal-pad" maxLength={9} />
      <View style={{ gap: 8 }}>
        <AppText style={{ fontWeight: '600', fontSize: 13 }}>¿En qué quincena se paga?</AppText>
        <Segmented options={[{ value: 'first', label: '1.ª quincena' }, { value: 'second', label: '2.ª quincena' }]}
          value={payFortnight === 1 ? 'first' : 'second'} onChange={value => setPayFortnight(value === 'first' ? 1 : 2)} />
      </View>
      <View style={{ gap: 8 }}>
        <AppText style={{ fontWeight: '600', fontSize: 13 }}>Categoría</AppText>
        {state.categories.length === 0
          ? <AppText variant="muted">Crea una categoría para asignarla a este gasto fijo.</AppText>
          : <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {state.categories.map(category => <Pressable key={category.id} accessibilityRole="button" accessibilityLabel={category.name}
              accessibilityState={{ selected: categoryId === category.id }} aria-selected={categoryId === category.id}
              onPress={() => setCategoryId(category.id)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 7, minHeight: 40, paddingHorizontal: 11, paddingVertical: 7,
                borderWidth: 1, borderColor: categoryId === category.id ? colors.primary : colors.border,
                borderRadius: 12, backgroundColor: categoryId === category.id ? colors.primarySoft : colors.surface }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: category.color }} />
              <AppText style={{ fontSize: 12, fontWeight: '600' }}>{category.name}</AppText>
            </Pressable>)}
          </View>}
        <Pressable accessibilityRole="button" onPress={() => setShowCategoryForm(true)} style={{ minHeight: 40, justifyContent: 'center', alignSelf: 'flex-start' }}>
          <AppText style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>+ Crear categoría</AppText>
        </Pressable>
      </View>
      {!!error && <AppText accessibilityRole="alert" style={{ color: colors.danger }}>{error}</AppText>}
      <Button title={expense ? 'Guardar cambios' : 'Guardar gasto fijo'} icon="check" onPress={save} />
    </ModalSheet>
    {showCategoryForm && <CategoryForm onClose={() => setShowCategoryForm(false)} />}
    <ConfirmAction visible={confirmSave} title={expense ? '¿Guardar cambios del gasto fijo?' : '¿Guardar gasto fijo?'}
      description={expense ? `Se actualizará “${name.trim()}” por ${money(parseMoney(amount) ?? 0)} al mes, en la ${payFortnight}.ª quincena.`
        : `Se agregará “${name.trim()}” por ${money(parseMoney(amount) ?? 0)} al mes, en la ${payFortnight}.ª quincena.`}
      confirmTitle={expense ? 'Sí, guardar cambios' : 'Sí, guardar gasto fijo'}
      onCancel={() => setConfirmSave(false)} onConfirm={saveConfirmed} />
  </>;
}
