import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Dimensions, SafeAreaView, Image} from 'react-native';
import { Shield, MapPin, Bell, UserCheck } from 'lucide-react-native';
      
const { width } = Dimensions.get('window');

export default function LandingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.iconCircleLarge}>
            <Image source={require('../assets/images/android-icon-foreground.png')} style={styles.logoImage} resizeMode='contain' />
        </View>
        <Text style={styles.title}>BANTAY <Text style={styles.boldTitle}>CABAGAN</Text></Text>
        <Text style={styles.subtitle}>Personnel Tracking & Safety System</Text>
      </View>

      {/* Features Section */}
      <View style={styles.featuresContainer}>
        <View style={styles.featureRow}>
          <FeatureIcon icon={<MapPin size={24} color="#60a5fa" />} label="Real-time GPS" />
          <FeatureIcon icon={<Bell size={24} color="#60a5fa" />} label="Geo-alerts" />
          <FeatureIcon icon={<UserCheck size={24} color="#60a5fa" />} label="Team Sync" />
        </View>
      </View>

      {/* Buttons Section */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginButton} activeOpacity={0.8}>
          <Text style={styles.loginText}>LULU MUNA BAGO LOGIN</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.adminLink}>
          <Text style={styles.adminText}>Are you an Admin? <Text style={styles.linkText}>Login here</Text></Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>© 2026 PNP CABAGAN IOT DIVISION_CREATED BY LEO</Text>
    </SafeAreaView>
  );
}

// Helper Component para sa Icons
interface FeatureProps {
  icon: React.ReactNode;
  label: string;
}

const FeatureIcon = ({ icon, label }: FeatureProps) => (
  <View style={styles.iconBox}>
    <View style={styles.iconCircleSmall}>{icon}</View>
    <Text style={styles.iconLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
    logoImage: {
        width: 100,
        height: 100,
    },
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Dark Navy
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  iconCircleLarge: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 20,
  },
  title: {
    fontSize: 28,
    color: '#f8fafc',
    letterSpacing: 2,
    marginTop: 25,
  },
  boldTitle: {
    fontWeight: '900',
    color: '#3b82f6',
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  featuresContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  iconBox: {
    alignItems: 'center',
  },
  iconCircleSmall: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '1e293b#',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#305591',
    shadowColor: '#305591',
    shadowOffset: { width: 0, height: 6},
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
  },
  iconLabel: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 35,
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#3b82f6',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#2172f5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,

  },
  loginText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  adminLink: {
    marginTop: 20,
  },
  adminText: {
    color: '#64748b',
    fontSize: 13,
  },
  linkText: {
    color: '#5494fb',
    fontWeight: '600',
  },
  footer: {
    color: '#334155',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});