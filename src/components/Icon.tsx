import React from 'react';
import { Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const paths = {
  wallet: 'M3 5h15v4H5a2 2 0 0 1-2-2V5Zm0 2v12h18V9H5m12 4h4m-4 3h4',
  dashboard: 'M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z',
  history: 'M3 11a9 9 0 1 1 2.4 7M3 4v7h7m2-4v5l3 2',
  settings: 'M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6m-5 0v6',
  plus: 'M12 5v14M5 12h14',
  list: 'M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01',
  left: 'm14 6-6 6 6 6',
  right: 'm10 6 6 6-6 6',
  down: 'm6 9 6 6 6-6',
  up: 'm6 15 6-6 6 6',
  edit: 'm14 4 6 6M4 20l1-5L16 4l4 4L9 19l-5 1Z',
  moreVertical: 'M12 5.5v.01m0 6.49v.01m0 6.49v.01',
  trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
  close: 'm6 6 12 12M6 18 18 6',
  check: 'm5 12 4 4L19 6',
  sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  moon: 'M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10Z',
  calendar: 'M4 5h16v16H4V5Zm0 5h16M8 3v4m8-4v4M8 14h2m4 0h2m-8 3h2',
};

export type IconName = keyof typeof paths;

export function Icon({ name, color, size = 22 }: { name: IconName; color: string; size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24"
    {...(Platform.OS === 'web' ? { 'aria-hidden': true } : { accessibilityElementsHidden: true })}>
    <Path d={paths[name]} fill="none" stroke={color} strokeWidth={name === 'moreVertical' ? 3 : 1.7} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}
