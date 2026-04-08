import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/theme';
import { StatCard } from '../components/StatCard';

type DashboardScreenProps = {
  total: number;
  inField: number;
  atBase: number;
  offDuty: number;
};

export const DashboardScreen = ({ total, inField, atBase, offDuty }: DashboardScreenProps) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Cabagan Operations Overview</Text>
      <Text style={styles.subtitle}>Real-time visibility of active personnel status</Text>

      <View style={styles.gridRow}>
        <StatCard label="Total Personnel" value={total} accent={COLORS.brand} />
        <StatCard label="In Field" value={inField} accent={COLORS.online} />
      </View>

      <View style={styles.gridRow}>
        <StatCard label="At Base" value={atBase} accent={COLORS.idle} />
        <StatCard label="Off Duty" value={offDuty} accent={COLORS.offline} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
