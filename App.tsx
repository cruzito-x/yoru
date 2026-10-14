import React from 'react';
import { Slot } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { BudgetProvider, useBudget } from './src/context/BudgetContext';
import { useTheme } from './src/theme/useTheme';
import { AppText, Button } from './src/components/ui';
import { BRAND } from './src/config/brand';
import { BrandLogo } from './src/components/BrandLogo';

// Proveedores globales y errores. Expo Router dibuja las vistas desde src/app/.
export default function App() {
  return <SafeAreaProvider><BudgetProvider><AppContent /></BudgetProvider></SafeAreaProvider>;
}

function AppContent() {
  const { ready, loadError, saveError, retryLoad, retrySave } = useBudget();
  const { colors, isDark } = useTheme();
  return <View style={{ flex: 1, backgroundColor: colors.background }}>
    <StatusBar style={isDark ? 'light' : 'dark'} />
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
      {!ready ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, gap: 16 }}>
        <BrandLogo size={68} />
        {loadError ? <>
          <AppText variant="heading">No pudimos cargar tus datos</AppText>
          <AppText variant="muted" style={{ textAlign: 'center' }}>Tus datos guardados se han conservado. Intenta cargarlos otra vez.</AppText>
          <Button title="Reintentar" onPress={retryLoad} />
        </> : <><ActivityIndicator size="large" color={colors.primary} /><AppText variant="muted">Abriendo {BRAND.name}…</AppText></>}
      </View> : <>
        {saveError && <View style={{ backgroundColor: colors.dangerSoft, padding: 12, gap: 8 }}>
          <AppText style={{ color: colors.danger, fontSize: 12 }}>No se guardaron los últimos cambios. Reintenta antes de cerrar la app.</AppText>
          <Button title="Reintentar guardado" onPress={retrySave} variant="danger" />
        </View>}
        <Slot />
      </>}
    </SafeAreaView>
  </View>;
}
