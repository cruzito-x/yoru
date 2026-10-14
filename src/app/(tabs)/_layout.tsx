import React from 'react';
import { Tabs } from 'expo-router';
import { BottomTabs } from '../../components/BottomTabs';
import { useTheme } from '../../theme/useTheme';
import { Tab } from '../../types/budget';

export default function TabLayout() {
  const { colors } = useTheme();
  return <Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}
    tabBar={({ state, navigation }) => <BottomTabs
      active={state.routes[state.index].name === 'index' ? 'dashboard' : state.routes[state.index].name as Tab}
      onChange={tab => navigation.navigate(tab === 'dashboard' ? 'index' : tab)} />}>
    <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
    <Tabs.Screen name="history" options={{ title: 'Historial' }} />
    <Tabs.Screen name="settings" options={{ title: 'Ajustes' }} />
  </Tabs>;
}
