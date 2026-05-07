import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const theme = {
  primary: '#0A2540',
  accent: '#FF9F43',
  success: '#00D4AA',
  error: '#FF5B5B',
  backgroundLight: '#F8F9FA',
  backgroundDark: '#111921',
  textHeadings: '#1E293B',
  textBody: '#475569',
};

export default function AboutScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgColor = isDark ? theme.backgroundDark : theme.backgroundLight;
  const cardBgColor = isDark ? '#1F2937' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : theme.textHeadings;
  const textBodyColor = isDark ? '#9CA3AF' : theme.textBody;
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  const appInfo = {
    version: '1.0.0',
    buildNumber: '100',
    releaseDate: 'November 2025',
    developer: 'AmeeTech'
  };

  const legalLinks = [
    {
      title: 'Terms of Service',
      description: 'Read our terms and conditions',
      icon: 'document-text',
      action: () => Linking.openURL('https://ameedata.com.ng/terms')
    },
    {
      title: 'Privacy Policy',
      description: 'How we protect your privacy',
      icon: 'shield-checkmark',
      action: () => Linking.openURL('https://ameedata.com.ng/privacy')
    },
    {
      title: 'License Agreement',
      description: 'Software license information',
      icon: 'document',
      action: () => Linking.openURL('https://ameedata.com.ng/license')
    }
  ];

  const socialLinks = [
    {
      title: 'Follow us on Twitter',
      icon: 'logo-twitter',
      action: () => Linking.openURL('https://twitter.com/vtuapp')
    },
    {
      title: 'Like us on Facebook',
      icon: 'logo-facebook',
      action: () => Linking.openURL('https://facebook.com/vtuapp')
    },
    {
      title: 'Follow us on Instagram',
      icon: 'logo-instagram',
      action: () => Linking.openURL('https://instagram.com/vtuapp')
    },
    {
      title: 'Connect on LinkedIn',
      icon: 'logo-linkedin',
      action: () => Linking.openURL('https://linkedin.com/company/vtuapp')
    }
  ];

  const features = [
    'Instant airtime and data purchases',
    'Multiple payment methods',
    'Secure transactions with bank-level encryption',
    'Real-time transaction history',
    'Bill payment services',
    '24/7 customer support',
    'Referral rewards program',
    'Multi-network support'
  ];

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: bgColor, borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>About</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* App Logo and Info */}
        <View style={[styles.section, { backgroundColor: cardBgColor }]}>
          <View style={styles.appInfoContainer}>
            <View style={styles.logoContainer}>
              <View style={[styles.logo, { backgroundColor: theme.primary }]}>
                <Text style={styles.logoText}>IB</Text>
              </View>
            </View>
            <Text style={[styles.appName, { color: textColor }]}>AmeeData</Text>
            <Text style={[styles.appTagline, { color: textBodyColor }]}>
              Your trusted partner for seamless mobile transactions
            </Text>
            <View style={styles.versionInfo}>
              <Text style={[styles.versionText, { color: textBodyColor }]}>
                Version {appInfo.version} (Build {appInfo.buildNumber})
              </Text>
              <Text style={[styles.versionText, { color: textBodyColor }]}>
                Released {appInfo.releaseDate}
              </Text>
            </View>
          </View>
        </View>

        {/* About Description */}
        <View style={[styles.section, { backgroundColor: cardBgColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>About AmeeData</Text>
          <Text style={[styles.descriptionText, { color: textBodyColor }]}>
            AmeeData is Nigeria's leading mobile application for quick and secure virtual top-up services.
            We provide instant airtime, data bundles, and bill payment services across all major networks
            in Nigeria. Our mission is to make mobile transactions simple, fast, and secure for everyone.
          </Text>
        </View>

        {/* Features */}
        <View style={[styles.section, { backgroundColor: cardBgColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Key Features</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.success} />
              <Text style={[styles.featureText, { color: textBodyColor }]}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Developer Info */}
        <View style={[styles.section, { backgroundColor: cardBgColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Developer Information</Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: textBodyColor }]}>Developed by:</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>{appInfo.developer}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: textBodyColor }]}>Contact:</Text>
            <TouchableOpacity onPress={() => Linking.openURL('mailto:aminuamee@yahoo.com')}>
              <Text style={[styles.infoValue, styles.linkText, { color: theme.primary }]}>
                aminuamee@yahoo.com
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: textBodyColor }]}>Website:</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://www.ameetech.org.ng')}>
              <Text style={[styles.infoValue, styles.linkText, { color: theme.primary }]}>
                www.ameetech.org.ng
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal Information */}
        <View style={[styles.section, { backgroundColor: cardBgColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Legal</Text>

          {legalLinks.map((link, index) => (
            <TouchableOpacity
              key={index}
              style={styles.legalItem}
              onPress={link.action}
            >
              <View style={styles.legalInfo}>
                <Ionicons name={link.icon as any} size={24} color={theme.primary} />
                <View style={styles.legalTextContainer}>
                  <Text style={[styles.legalTitle, { color: textColor }]}>{link.title}</Text>
                  <Text style={[styles.legalDescription, { color: textBodyColor }]}>
                    {link.description}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={textBodyColor} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Social Media */}
        <View style={[styles.section, { backgroundColor: cardBgColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Follow Us</Text>

          {socialLinks.map((social, index) => (
            <TouchableOpacity
              key={index}
              style={styles.socialItem}
              onPress={social.action}
            >
              <Ionicons name={social.icon as any} size={24} color={theme.primary} />
              <Text style={[styles.socialText, { color: textColor }]}>{social.title}</Text>
              <Ionicons name="chevron-forward" size={20} color={textBodyColor} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Copyright */}
        <View style={styles.copyrightContainer}>
          <Text style={[styles.copyrightText, { color: textBodyColor }]}>
            © 2024 AmeeData. All rights reserved.
          </Text>
          <Text style={[styles.copyrightText, { color: textBodyColor }]}>
            Made with ❤️ in Nigeria
          </Text>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  appInfoContainer: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  versionInfo: {
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
  },
  linkText: {
    textDecorationLine: 'underline',
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  legalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legalTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  legalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  legalDescription: {
    fontSize: 14,
  },
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  socialText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 16,
    flex: 1,
  },
  copyrightContainer: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  copyrightText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
});