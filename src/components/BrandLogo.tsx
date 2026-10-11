import React from 'react';
import { Image, View } from 'react-native';
import { BRAND } from '../config/brand';
import { useTheme } from '../theme/useTheme';

// El fondo claro permite mantener el mismo logo azul marino en ambos temas.
export function BrandLogo({ size = 32 }: { size?: number }) {
  const { colors } = useTheme();
  return <View style={{ width: size, height: size, borderRadius: size * 0.28,
    backgroundColor: colors.logoBackground, padding: size * 0.08 }}>
    <Image source={require('../../assets/brand-mark.png')} resizeMode="contain"
      accessible accessibilityRole="image" accessibilityLabel={`Logo de ${BRAND.name}`}
      style={{ width: '100%', height: '100%' }} />
  </View>;
}
