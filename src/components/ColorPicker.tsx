import React, { useEffect, useId, useState } from 'react';
import { GestureResponderEvent, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '../theme/useTheme';
import { clampUnit, hexToHsv, HSVColor, hsvToHex, normalizeHexColor } from '../utils/colors';
import { AppText, Field } from './ui';

const AREA_HEIGHT = 110;

export function ColorPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  const { colors } = useTheme();
  const normalized = normalizeHexColor(value);
  const [hsv, setHsv] = useState(() => hexToHsv(normalized ?? '#C56839'));
  const [width, setWidth] = useState(0);
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const whiteId = `${id}-white`;
  const blackId = `${id}-black`;
  const hueId = `${id}-hue`;
  const selected = hsvToHex(hsv);
  const pureHue = hsvToHex({ h: hsv.h, s: 1, v: 1 });

  // Sincronizar muestras/código HEX sin perder el matiz al seleccionar blanco o negro.
  useEffect(() => {
    if (normalized && normalized !== hsvToHex(hsv)) setHsv(hexToHsv(normalized));
  }, [normalized, hsv]);

  function update(next: HSVColor) { setHsv(next); onChange(hsvToHex(next)); }
  function updateArea(event: GestureResponderEvent) {
    if (!width) return;
    update({ ...hsv, s: clampUnit(event.nativeEvent.locationX / width), v: 1 - clampUnit(event.nativeEvent.locationY / AREA_HEIGHT) });
  }
  function updateHue(event: GestureResponderEvent) {
    if (!width) return;
    update({ ...hsv, h: clampUnit(event.nativeEvent.locationX / width) * 360 });
  }

  return <View style={{ gap: 8 }}>
    <AppText style={{ fontWeight: '600', fontSize: 13 }}>Color personalizado</AppText>
    <View testID="color-picker-area" accessibilityLabel="Saturación y brillo del color"
      accessibilityHint="Arrastra para elegir el color o introduce su código HEX abajo."
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true} onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false} onResponderGrant={updateArea} onResponderMove={updateArea}
      style={[styles.area, { height: AREA_HEIGHT, backgroundColor: pureHue }]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id={whiteId} x1="0%" y1="0%" x2="100%" y2="0%"><Stop offset="0%" stopColor="#FFFFFF" /><Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} /></LinearGradient>
            <LinearGradient id={blackId} x1="0%" y1="0%" x2="0%" y2="100%"><Stop offset="0%" stopColor="#000000" stopOpacity={0} /><Stop offset="100%" stopColor="#000000" /></LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${whiteId})`} />
          <Rect width="100%" height="100%" fill={`url(#${blackId})`} />
        </Svg>
      </View>
      <View pointerEvents="none" style={[styles.marker, { left: hsv.s * width - 9, top: (1 - hsv.v) * AREA_HEIGHT - 9, backgroundColor: selected }]} />
    </View>
    <View testID="color-picker-hue" accessible accessibilityRole="adjustable" accessibilityLabel="Matiz del color"
      accessibilityValue={{ min: 0, max: 360, now: Math.round(hsv.h) }}
      accessibilityActions={[{ name: 'increment', label: 'Siguiente matiz' }, { name: 'decrement', label: 'Matiz anterior' }]}
      onAccessibilityAction={event => update({ ...hsv, h: (hsv.h + (event.nativeEvent.actionName === 'increment' ? 15 : -15) + 360) % 360 })}
      onStartShouldSetResponder={() => true} onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false} onResponderGrant={updateHue} onResponderMove={updateHue}
      style={[styles.area, { height: 44 }]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%">
          <Defs><LinearGradient id={hueId} x1="0%" y1="0%" x2="100%" y2="0%">
            {['#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FF0000'].map((color, index) => <Stop key={index} offset={`${index / 6 * 100}%`} stopColor={color} />)}
          </LinearGradient></Defs>
          <Rect width="100%" height="100%" fill={`url(#${hueId})`} />
        </Svg>
      </View>
      <View pointerEvents="none" style={[styles.marker, { left: hsv.h / 360 * width - 9, top: 13, backgroundColor: pureHue }]} />
    </View>
    <AppText variant="muted" style={{ fontSize: 11 }}>Desliza sobre la paleta y la barra de matiz, o introduce un código HEX.</AppText>
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
      <View accessibilityLabel={`Vista previa del color ${selected}`} style={{ width: 50, height: 50, marginTop: 28, borderRadius: 14, backgroundColor: selected, borderWidth: 1, borderColor: colors.border }} />
      <View style={{ flex: 1 }}><Field label="Código HEX del color" value={value.toLowerCase()} onChangeText={onChange}
        maxLength={7} autoCapitalize="none" autoCorrect={false} placeholder="#c56839" /></View>
    </View>
    {!normalized && <AppText accessibilityRole="alert" style={{ color: colors.danger, fontSize: 12 }}>Escribe seis dígitos hexadecimales. Ejemplo: #38A3F1.</AppText>}
  </View>;
}

const styles = StyleSheet.create({
  area: { borderRadius: 14, overflow: 'hidden' },
  marker: { position: 'absolute', width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#FFFFFF',
    shadowColor: '#000000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.5, shadowRadius: 2, elevation: 2 },
});
