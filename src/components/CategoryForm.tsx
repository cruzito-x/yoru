import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useBudget } from '../context/BudgetContext';
import { CATEGORY_COLORS } from '../data/defaults';
import { Category } from '../types/budget';
import { useTheme } from '../theme/useTheme';
import { makeId } from '../utils/budget';
import { AppText, Button, Field } from './ui';
import { ConfirmAction, ConfirmDelete, ModalSheet } from './ModalSheet';
import { Icon } from './Icon';
import { ColorPicker } from './ColorPicker';
import { normalizeHexColor } from '../utils/colors';

export function CategoryForm({ category, onClose }: { category?: Category; onClose: () => void }) {
  const { state, dispatch } = useBudget();
  const { colors } = useTheme();
  const [name, setName] = useState(category?.name ?? '');
  const [color, setColor] = useState(category?.color ?? CATEGORY_COLORS[state.categories.length % CATEGORY_COLORS.length]);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteBlocked, setDeleteBlocked] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);
  const used = !!category && state.expenses.some(e => e.categoryId === category.id);

  function save() {
    if (!name.trim()) return setError('Escribe un nombre para la categoría.');
    const normalizedColor = normalizeHexColor(color);
    if (!normalizedColor) return setError('Selecciona un color o escribe un código HEX válido de seis dígitos.');
    if (state.categories.some(c => c.id !== category?.id && c.name.toLocaleLowerCase() === name.trim().toLocaleLowerCase())) {
      return setError('Ya existe una categoría con ese nombre.');
    }
    setConfirmSave(true);
  }

  function requestDelete() {
    if (used) setDeleteBlocked(true);
    else setConfirmDelete(true);
  }

  function saveConfirmed() {
    const normalizedColor = normalizeHexColor(color);
    if (!normalizedColor) return;
    dispatch({ type: 'SAVE_CATEGORY', category: { id: category?.id ?? makeId(), name: name.trim(), color: normalizedColor } });
    onClose();
  }

  return <>
    <ModalSheet visible={!confirmDelete && !confirmSave && !deleteBlocked} title={category ? 'Editar categoría' : 'Nueva categoría'} onClose={onClose} contentGap={12}>
      <Field label="Nombre de la categoría" value={name} onChangeText={setName} placeholder="Ej. Cosplay" maxLength={40} autoCapitalize="sentences" />
      <View style={{ gap: 8 }}>
        <AppText style={{ fontWeight: '600', fontSize: 13 }}>Color</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORY_COLORS.map((option, index) => <Pressable key={option} accessibilityRole="button" accessibilityLabel={`Color ${index + 1}`}
            accessibilityState={{ selected: color === option }} aria-selected={color === option} onPress={() => setColor(option)}
            style={{ backgroundColor: option, borderRadius: 15, width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
            {color === option && <Icon name="check" color="#FFFFFF" />}
          </Pressable>)}
        </View>
      </View>
      <ColorPicker value={color} onChange={value => { setColor(value); setError(''); }} />
      {!!error && <AppText accessibilityRole="alert" style={{ color: colors.danger }}>{error}</AppText>}
      <Button title={category ? 'Guardar cambios' : 'Guardar categoría'} icon="check" onPress={save} />
      {category && <Button title="Eliminar categoría" icon="trash" variant="danger" onPress={requestDelete} />}
    </ModalSheet>
    <ModalSheet visible={deleteBlocked} title="No se puede eliminar" onClose={() => setDeleteBlocked(false)} contentGap={12}>
      <AppText>Esta categoría tiene gastos registrados. Puedes editarla; para eliminarla, primero elimina sus gastos.</AppText>
      <Button title="Entendido" variant="secondary" onPress={() => setDeleteBlocked(false)} />
    </ModalSheet>
    <ConfirmAction visible={confirmSave} title={category ? '¿Guardar cambios de categoría?' : '¿Guardar categoría?'}
      description={category ? `Se actualizará la categoría “${name.trim()}”.` : `Se agregará la categoría “${name.trim()}”.`}
      confirmTitle={category ? 'Sí, guardar cambios' : 'Sí, guardar categoría'}
      onCancel={() => setConfirmSave(false)} onConfirm={saveConfirmed} />
    <ConfirmDelete visible={confirmDelete} title="¿Eliminar categoría?" description={`Se eliminará “${category?.name ?? ''}”.`}
      onCancel={() => setConfirmDelete(false)} onConfirm={() => {
        if (category && state.expenses.some(e => e.categoryId === category.id)) {
          setConfirmDelete(false);
          setDeleteBlocked(true);
          return;
        }
        if (category) dispatch({ type: 'DELETE_CATEGORY', id: category.id });
        onClose();
      }} />
  </>;
}
