import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/theme';
import { Personnel } from '../types/personnel';
import { PersonnelListItem } from '../components/PersonnelListItem';

type MonitoringScreenProps = {
  personnel: Personnel[];
  refreshing: boolean;
  onRefresh: () => void;
};

export const MonitoringScreen = ({ personnel, refreshing, onRefresh }: MonitoringScreenProps) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Personnel Monitoring</Text>
      <Text style={styles.subtitle}>Pull down to simulate a refresh from backend API</Text>

      <FlatList
        data={personnel}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PersonnelListItem item={item} />}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.brand} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
});
