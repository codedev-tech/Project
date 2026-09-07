import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { getGpsReadingStatus } from '../../utils/gpsReading';

export function GpsReadingAge({ recordedAt, color = '#cbd5e1' }: {
  recordedAt?: string | null;
  color?: string;
}) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const { label, delayed } = getGpsReadingStatus(recordedAt, now);
  return <Text style={[styles.text, { color }, delayed && styles.delayed]}>{label}</Text>;
}

const styles = StyleSheet.create({
  text: { fontSize: 11, lineHeight: 17, fontWeight: '600' },
  delayed: { color: '#92400e', backgroundColor: '#fef3c7', borderRadius: 4, paddingHorizontal: 5 },
});
