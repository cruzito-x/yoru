import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tab } from '../types/budget';
import { useTheme } from '../theme/useTheme';
import { Icon, IconName } from './Icon';
import { AppText } from './ui';

const tabs: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'history', label: 'Historial', icon: 'history' },
  { id: 'settings', label: 'Ajustes', icon: 'settings' },
];

export function BottomTabs({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return <View style={{ borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
    paddingTop: 8, paddingBottom: Math.max(insets.bottom, 12), paddingHorizontal: 12, alignItems: 'center' }}>
    <View style={{ flexDirection: 'row', width: '100%', maxWidth: 680, gap: 6 }}>
      {tabs.map(tab => {
        const selected = active === tab.id;
        return <Pressable key={tab.id} accessibilityRole="tab" accessibilityLabel={tab.label}
          accessibilityState={{ selected }} aria-selected={selected} onPress={() => onChange(tab.id)}
          android_ripple={{ color: colors.primarySoft, borderless: false }}
          style={({ pressed }) => ({ flex: 1, minWidth: 0, minHeight: 60, gap: 5,
            paddingVertical: 8, borderRadius: 18, overflow: 'hidden',
            backgroundColor: selected || pressed ? colors.primarySoft : 'transparent',
            alignItems: 'center', justifyContent: 'center' })}>
          <Icon name={tab.icon} color={selected ? colors.primary : colors.muted} size={21} />
          <AppText style={{ fontSize: 11, lineHeight: 15, fontWeight: selected ? '700' : '500', color: selected ? colors.primary : colors.muted }}>{tab.label}</AppText>
        </Pressable>;
      })}
    </View>
  </View>;
}
