import React from 'react';
import { View } from 'react-native';
import { AppText, IconButton } from './ui';

export function PeriodNavigator({ label, onPrevious, onNext }: { label: string; onPrevious: () => void; onNext: () => void }) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
    <IconButton name="left" label="Período anterior" onPress={onPrevious} />
    <AppText style={{ flex: 1, textAlign: 'center', fontSize: 12, lineHeight: 18, fontWeight: '600' }}>{label}</AppText>
    <IconButton name="right" label="Período siguiente" onPress={onNext} />
  </View>;
}
