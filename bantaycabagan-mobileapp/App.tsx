import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';

import { COLORS } from './src/constants/theme';
import { usePersonnel } from './src/hooks/usePersonnel';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { MonitoringScreen } from './src/screens/MonitoringScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

type TabKey = 'dashboard' | 'monitoring' | 'settings';

export default function App() {
  const [tab, setTab] = useState<TabKey>('dashboard');
  const { counters, personnel, loading, error, reload } = usePersonnel();

  const content = useMemo(() => {
    if (tab === 'dashboard') {
      return (
        <DashboardScreen
          total={counters.total}
          inField={counters.inField}
          atBase={counters.atBase}
          offDuty={counters.offDuty}
        />
      );
    }

    if (tab === 'monitoring') {
      return (
        <MonitoringScreen
          personnel={personnel}
          refreshing={loading}
          onRefresh={() => {
            void reload();
          }}
        />
      );
    }

    return <SettingsScreen onReload={() => void reload()} />;
  }, [tab, counters, personnel, loading, reload]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.appName}>BantayCabagan Mobile</Text>
        <Text style={styles.appSub}>Development build for Expo Go testing</Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.content}>{content}</View>

      <View style={styles.tabBar}>
        <TabButton label="Dashboard" active={tab === 'dashboard'} onPress={() => setTab('dashboard')} />
        <TabButton label="Monitoring" active={tab === 'monitoring'} onPress={() => setTab('monitoring')} />
        <TabButton label="Settings" active={tab === 'settings'} onPress={() => setTab('settings')} />
      </View>
    </SafeAreaView>
  );
}

type TabButtonProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

const TabButton = ({ label, active, onPress }: TabButtonProps) => {
  return (
    <Pressable onPress={onPress} style={[styles.tabButton, active ? styles.tabButtonActive : null]}>
      <Text style={[styles.tabButtonText, active ? styles.tabButtonTextActive : null]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  appName: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  appSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  tabButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
  },
  tabButtonActive: {
    backgroundColor: COLORS.brandDark,
  },
  tabButtonText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
});
