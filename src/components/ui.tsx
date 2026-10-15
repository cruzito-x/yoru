import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet,
  Text, TextInput, TextInputProps, TextProps, View, ViewProps,
} from 'react-native';
import { useTheme } from '../theme/useTheme';
import { Icon, IconName } from './Icon';
import { BRAND } from '../config/brand';
import { BrandLogo } from './BrandLogo';

type TextVariant = 'body' | 'muted' | 'title' | 'heading' | 'label';
export function AppText({ variant = 'body', style, ...props }: TextProps & { variant?: TextVariant }) {
  const { colors } = useTheme();
  return <Text {...props} style={[
    { color: variant === 'muted' || variant === 'label' ? colors.muted : colors.text },
    textStyles[variant], style,
  ]} />;
}

const textStyles = StyleSheet.create({
  body: { fontSize: 15, lineHeight: 22 },
  muted: { fontSize: 13, lineHeight: 19 },
  title: { fontSize: 32, lineHeight: 39, fontWeight: '700', letterSpacing: -1.1 },
  heading: { fontSize: 18, lineHeight: 25, fontWeight: '600', letterSpacing: -0.4 },
  label: { fontSize: 10, lineHeight: 16, fontWeight: '700', letterSpacing: 1.6 },
});

export function Card({ style, ...props }: ViewProps) {
  const { colors } = useTheme();
  return <View {...props} style={[{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 22, padding: 20 }, style]} />;
}

export function Button({ title, onPress, icon, variant = 'primary', disabled = false }: {
  title: string; onPress: () => void; icon?: IconName; variant?: 'primary' | 'secondary' | 'danger'; disabled?: boolean;
}) {
  const { colors } = useTheme();
  const foreground = variant === 'primary' ? colors.onPrimary : variant === 'danger' ? colors.danger : colors.primary;
  const background = variant === 'primary' ? colors.brand : variant === 'danger' ? colors.dangerSoft : colors.primarySoft;
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled }} aria-disabled={disabled} disabled={disabled}
    onPress={onPress} style={({ pressed }) => ({ minHeight: 52, borderRadius: 14, paddingHorizontal: 16,
      paddingVertical: 11, backgroundColor: background, opacity: disabled ? 0.5 : pressed ? 0.75 : 1,
      alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 })}>
    {icon && <Icon name={icon} color={foreground} size={18} />}
    <AppText style={{ color: foreground, fontWeight: '600', fontSize: 14, lineHeight: 20, textAlign: 'center' }}>{title}</AppText>
  </Pressable>;
}

export function IconButton({ name, label, onPress, disabled = false, compact = false, tone = 'default' }: {
  name: IconName; label: string; onPress: () => void; disabled?: boolean; compact?: boolean; tone?: 'default' | 'danger';
}) {
  const { colors } = useTheme();
  const iconColor = tone === 'danger' ? colors.danger : colors.text;
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} aria-disabled={disabled} disabled={disabled}
    hitSlop={compact ? 4 : 0} onPress={onPress} style={({ pressed }) => ({ width: compact ? 36 : 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
      backgroundColor: pressed ? colors.surfaceAlt : 'transparent', opacity: disabled ? 0.35 : 1 })}>
    <Icon name={name} color={iconColor} size={compact ? 18 : 20} />
  </Pressable>;
}

export function Field({ label, hint, style, ...props }: TextInputProps & { label: string; hint?: string }) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return <View style={{ gap: 6 }}>
    <AppText style={{ fontWeight: '600', fontSize: 13 }}>{label}</AppText>
    <TextInput {...props} accessibilityLabel={label} placeholderTextColor={colors.muted}
      onFocus={event => { setFocused(true); props.onFocus?.(event); }}
      onBlur={event => { setFocused(false); props.onBlur?.(event); }}
      accessibilityState={{ ...props.accessibilityState, disabled: props.editable === false }} aria-disabled={props.editable === false}
      style={[{ color: props.editable === false ? colors.muted : colors.text, backgroundColor: colors.surfaceAlt, borderWidth: focused ? 2 : 1,
        borderColor: focused ? colors.primary : colors.border,
        borderRadius: 14, padding: 14, fontSize: 16, minHeight: 50 }, style]} />
    {hint && <AppText variant="muted">{hint}</AppText>}
  </View>;
}

export function Screen({ children }: { children: React.ReactNode }) {
  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 22, paddingBottom: 34, alignItems: 'center' }}>
      <View style={{ width: '100%', maxWidth: 680, gap: 22 }}>
        {children}
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}

export function ScreenHeader({ title, subtitle }: { title?: string; subtitle: string }) {
  const { colors } = useTheme();
  return <View style={{ gap: 10, paddingTop: 8 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
        <BrandLogo size={30} />
        <AppText variant="label" style={{ color: colors.primary, fontSize: 12, letterSpacing: 3 }}>{BRAND.wordmark}</AppText>
      </View>
    </View>
    <View style={{ gap: 4 }}>{title ? <AppText variant="title">{title}</AppText> : null}<AppText variant="muted">{subtitle}</AppText></View>
  </View>;
}

export function Segmented<T extends string>({ options, value, onChange }: {
  options: { value: T; label: string }[]; value: T; onChange: (value: T) => void;
}) {
  const { colors } = useTheme();
  return <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceAlt, padding: 4, borderRadius: 16, gap: 4 }}>
    {options.map(option => <Pressable key={option.value} accessibilityRole="button" accessibilityLabel={option.label}
      accessibilityState={{ selected: value === option.value }} aria-selected={value === option.value} onPress={() => onChange(option.value)}
      style={({ pressed }) => ({ flex: 1, minHeight: 44, paddingHorizontal: 3, paddingVertical: 10, justifyContent: 'center', alignItems: 'center',
        borderRadius: 12, backgroundColor: value === option.value ? colors.surface : 'transparent', opacity: pressed ? 0.72 : 1 })}>
      <AppText style={{ fontSize: 13, fontWeight: '600', color: value === option.value ? colors.primary : colors.muted }}>{option.label}</AppText>
    </Pressable>)}
  </View>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  const { colors } = useTheme();
  return <View style={{ alignItems: 'center', gap: 10, paddingVertical: 30, paddingHorizontal: 15 }}>
    <View style={{ backgroundColor: colors.primarySoft, padding: 14, borderRadius: 20 }}><Icon name="wallet" color={colors.primary} size={26} /></View>
    <AppText variant="heading" style={{ textAlign: 'center' }}>{title}</AppText>
    <AppText variant="muted" style={{ textAlign: 'center', maxWidth: 290 }}>{description}</AppText>
  </View>;
}
