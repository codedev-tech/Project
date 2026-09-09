import React, { useEffect, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useMobileTheme } from '../../context/ThemeContext';

export const toLocalReportTime = (value: string) => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
export const parseReportTime = (text: string) => {
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(text)) return '';
  const date = new Date(text.replace(' ', 'T') + ':00');
  return Number.isFinite(date.getTime()) && toLocalReportTime(date.toISOString()) === text ? date.toISOString() : '';
};
export function ReportDateTimeField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { colors } = useMobileTheme();
  const [text, setText] = useState(() => toLocalReportTime(value));
  const emitted = useRef(value);
  useEffect(() => {
    if (value !== emitted.current) { setText(toLocalReportTime(value)); emitted.current = value; }
  }, [value]);
  return <View>
    <TextInput accessibilityLabel="Incident or activity date and time" value={text}
      placeholder="YYYY-MM-DD HH:mm" placeholderTextColor={colors.textMuted}
      autoCorrect={false} maxLength={16}
      style={{ minHeight: 46, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }}
      onChangeText={(next) => { setText(next); emitted.current = parseReportTime(next); onChange(emitted.current); }} />
    <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 6 }}>
      When it happened, in local time. Format: YYYY-MM-DD HH:mm (24-hour).
    </Text>
    {text && !parseReportTime(text) ? <Text accessibilityRole="alert" style={{ color: colors.danger, fontSize: 11 }}>Enter a valid date and time.</Text> : null}
  </View>;
}
