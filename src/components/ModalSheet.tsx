import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';
import { AppText, Button, IconButton } from './ui';

export function ModalSheet({ visible, title, onClose, children }: {
  visible: boolean; title: string; onClose: () => void; children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.overlay }}>
      <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable accessibilityLabel="Cerrar formulario" onPress={onClose} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} />
        <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 480, maxHeight: '95%', backgroundColor: colors.surface,
          borderRadius: 24, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12 }}>
            <AppText variant="heading">{title}</AppText><IconButton name="close" label="Cerrar" onPress={onClose} />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingTop: 12, gap: 18 }}>{children}</ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </Modal>;
}

export function ConfirmDelete({ visible, title, description, onCancel, onConfirm }: {
  visible: boolean; title: string; description: string; onCancel: () => void; onConfirm: () => void;
}) {
  return <ModalSheet visible={visible} title={title} onClose={onCancel}>
    <AppText>{description}</AppText>
    <Button title="Sí, eliminar" variant="danger" onPress={onConfirm} />
    <Button title="Cancelar" variant="secondary" onPress={onCancel} />
  </ModalSheet>;
}

export function ConfirmAction({ visible, title, description, confirmTitle, confirmVariant = 'primary', onCancel, onConfirm }: {
  visible: boolean; title: string; description: string; confirmTitle: string;
  confirmVariant?: 'primary' | 'secondary' | 'danger'; onCancel: () => void; onConfirm: () => void;
}) {
  return <ModalSheet visible={visible} title={title} onClose={onCancel}>
    <AppText>{description}</AppText>
    <Button title={confirmTitle} variant={confirmVariant} onPress={onConfirm} />
    <Button title="Cancelar" variant="secondary" onPress={onCancel} />
  </ModalSheet>;
}
