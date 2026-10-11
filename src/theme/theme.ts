// ARCHIVO GLOBAL DEL TEMA. Cambia aquí los colores de toda la aplicación.
export const themes = {
  light: {
    background: '#F4F6FA', surface: '#FFFFFF', surfaceAlt: '#EAF0F7',
    text: '#17253C', muted: '#64728A', border: '#DCE3ED',
    brand: '#142B4C', primary: '#142B4C', primarySoft: '#E4ECF7', onPrimary: '#FFFFFF',
    logoBackground: '#FFFDF7',
    balance: '#3F638D',
    success: '#367553', danger: '#B3473F', dangerSoft: '#F9E8E4',
    track: '#DFE6F0', overlay: 'rgba(10,20,38,0.48)',
  },
  dark: {
    background: '#0C1422', surface: '#142035', surfaceAlt: '#1D2B43',
    text: '#EDF2FA', muted: '#A5B3C9', border: '#2E3E57',
    brand: '#142B4C', primary: '#A7C4EB', primarySoft: '#203552', onPrimary: '#FFFFFF',
    logoBackground: '#FFFDF7',
    balance: '#89A8D5',
    success: '#98CCA7', danger: '#F0988B', dangerSoft: '#402824',
    track: '#2E405D', overlay: 'rgba(0,0,0,0.65)',
  },
};

export type ThemeColors = typeof themes.light;
