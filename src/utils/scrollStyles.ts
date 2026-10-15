import { Platform, type ViewStyle } from 'react-native';

// Estilo compartido para las barras de desplazamiento de listas internas en web.
export const webScrollbarStyle = Platform.OS === 'web'
  ? { scrollbarWidth: 'thin' } as ViewStyle
  : undefined;
