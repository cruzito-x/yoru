import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { BottomTabs } from '../../components/BottomTabs';
import { ModalSheet } from '../../components/ModalSheet';
import { AppText, Button } from '../../components/ui';
import { useTheme } from '../../theme/useTheme';
import { Tab } from '../../types/budget';
import { CategoryOrderingProvider, useCategoryOrdering } from '../../context/CategoryOrderingContext';

export default function TabLayout() {
  return <CategoryOrderingProvider><TabNavigator /></CategoryOrderingProvider>;
}

function TabNavigator() {
  const { colors } = useTheme();
  const { orderingCategories, setOrderingCategories } = useCategoryOrdering();
  const [pendingTab, setPendingTab] = useState<Tab | null>(null);
  return <Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}
    tabBar={({ state, navigation }) => {
      const active = state.routes[state.index].name === 'index' ? 'dashboard' : state.routes[state.index].name as Tab;
      return <>
        <BottomTabs active={active} onChange={tab => {
          if (orderingCategories && active === 'dashboard' && tab !== active) {
            setPendingTab(tab);
            return;
          }
          navigation.navigate(tab === 'dashboard' ? 'index' : tab);
        }} />
        <ModalSheet visible={pendingTab !== null} title="¿Ya terminaste de ordenar?" onClose={() => setPendingTab(null)} contentGap={14}>
          <AppText>Si sigues a otra vista, el orden actual se guardará.</AppText>
          <Button title="Sí, terminar y salir" onPress={() => {
            const tab = pendingTab;
            setPendingTab(null);
            setOrderingCategories(false);
            if (tab) navigation.navigate(tab === 'dashboard' ? 'index' : tab);
          }} />
          <Button title="No, seguir ordenando" variant="secondary" onPress={() => setPendingTab(null)} />
        </ModalSheet>
      </>;
    }}>
    <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
    <Tabs.Screen name="history" options={{ title: 'Historial' }} />
    <Tabs.Screen name="settings" options={{ title: 'Ajustes' }} />
  </Tabs>;
}
