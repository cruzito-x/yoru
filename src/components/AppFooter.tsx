import React from 'react';
import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { AppText } from './ui';

const INSTAGRAM_URL = 'https://www.instagram.com/cruzito.x_';

export function AppFooter() {
  const { colors } = useTheme();
  const year = new Date().getFullYear();
  const footerColor = colors.muted;
  const textStyle = { color: footerColor, fontSize: 11, lineHeight: 15, fontWeight: '500', textAlign: 'center' } as const;

  return <View style={{ alignItems: 'center', justifyContent: 'center', gap: 1 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      <AppText style={textStyle}>Made with </AppText>
      <AppText accessibilityLabel="corazón" style={textStyle}>♡</AppText>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      <AppText style={textStyle}>© </AppText>
      <Link href={INSTAGRAM_URL} asChild>
        <Pressable accessibilityRole="link" accessibilityLabel="Instagram de cruzito" style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}>
          <AppText style={textStyle}>cruzito</AppText>
        </Pressable>
      </Link>
      <AppText style={textStyle}>{` ${year}`}</AppText>
    </View>
  </View>;
}
