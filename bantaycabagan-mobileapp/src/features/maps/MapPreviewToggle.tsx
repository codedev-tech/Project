import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export function MapPreviewToggle({ enabled, onPress }: { enabled: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={enabled ? 'Remove test markers' : 'Add test markers'}
      accessibilityState={{ selected: enabled }}
      onPress={onPress}
      style={[styles.button, enabled && styles.active]}
    >
      <Text style={[styles.label, enabled && styles.activeLabel]}>Test</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { width: 46, height: 46, borderRadius: 14, borderWidth: 1, borderColor: '#92400e', backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center' },
  active: { backgroundColor: '#92400e' },
  label: { color: '#78350f', fontSize: 11, fontWeight: '800' },
  activeLabel: { color: '#ffffff' },
});
