export interface HSVColor { h: number; s: number; v: number }

export function normalizeHexColor(value: string): string | null {
  const match = /^#?([\da-f]{6})$/i.exec(value.trim());
  return match ? `#${match[1].toUpperCase()}` : null;
}

export const clampUnit = (value: number) => Math.max(0, Math.min(1, value));

export function hexToHsv(value: string): HSVColor {
  const hex = normalizeHexColor(value);
  if (!hex) throw new Error('El color debe tener seis dígitos hexadecimales.');
  const [r, g, b] = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const h = delta === 0 ? 0 : max === r ? ((g - b) / delta + 6) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return { h: h * 60, s: max === 0 ? 0 : delta / max, v: max };
}

export function hsvToHex({ h, s, v }: HSVColor): string {
  const hue = ((h % 360) + 360) % 360 / 60;
  const chroma = clampUnit(v) * clampUnit(s);
  const x = chroma * (1 - Math.abs(hue % 2 - 1));
  const m = clampUnit(v) - chroma;
  const rgb = hue < 1 ? [chroma, x, 0] : hue < 2 ? [x, chroma, 0] : hue < 3 ? [0, chroma, x]
    : hue < 4 ? [0, x, chroma] : hue < 5 ? [x, 0, chroma] : [chroma, 0, x];
  return `#${rgb.map(channel => Math.round((channel + m) * 255).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}
