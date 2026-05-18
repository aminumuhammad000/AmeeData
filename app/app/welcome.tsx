import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    SafeAreaView,
    Dimensions,
    ImageBackground
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
    const router = useRouter();

    const services = [
        {
            icon: 'heart-outline',
            title: 'I Care Ecosystem',
            description: 'Financial support with an emotional touch.',
            color: '#6C2BD9'
        },
        {
            icon: 'flash-outline',
            title: 'Utility Payments',
            description: 'Instant Data & Airtime recharges.',
            color: '#6C2BD9'
        },
        {
            icon: 'shield-checkmark-outline',
            title: 'Secure & Fast',
            description: 'Your transactions are always protected.',
            color: '#6C2BD9'
        }
    ];

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Image 
                      source={require('../assets/images/ameedatalogo.png')} 
                      style={styles.realLogo}
                      resizeMode="contain"
                    />
                    <Text style={styles.brandTitle}>AmeeData</Text>
                </View>

                <View style={styles.heroSection}>
                    <Text style={styles.heroText}>Smart Payments.{"\n"}<Text style={{color: '#6C2BD9'}}>Connected Hearts.</Text></Text>
                    <Text style={styles.heroSub}>The modern way to support loved ones and manage your digital bills in Nigeria.</Text>
                </View>

                <View style={styles.servicesGrid}>
                    {services.map((service, index) => (
                        <View key={index} style={styles.serviceRow}>
                            <View style={styles.iconBox}>
                                <Ionicons name={service.icon as any} size={22} color="#6C2BD9" />
                            </View>
                            <View>
                                <Text style={styles.serviceTitle}>{service.title}</Text>
                                <Text style={styles.serviceDesc}>{service.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={styles.primaryBtn}
                        onPress={() => router.push('/signup')}
                    >
                        <Text style={styles.primaryBtnText}>Get Started</Text>
                        <Ionicons name="arrow-forward" size={18} color="#FFF" style={{marginLeft: 8}} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.secondaryBtn}
                        onPress={() => router.push('/login')}
                    >
                        <Text style={styles.secondaryBtnText}>Sign In to Account</Text>
                    </TouchableOpacity>

                    <Text style={styles.versionText}>Version 4.0.0 • Secured by AmeeData</Text>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 40,
        gap: 12,
    },
    realLogo: {
        width: 44,
        height: 44,
    },
    brandTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1E293B',
        letterSpacing: -0.5,
    },
    heroSection: {
        marginTop: 60,
        marginBottom: 40,
    },
    heroText: {
        fontSize: 34,
        fontWeight: '900',
        color: '#1E293B',
        lineHeight: 42,
        letterSpacing: -1,
    },
    heroSub: {
        fontSize: 15,
        color: '#64748B',
        lineHeight: 24,
        marginTop: 12,
        fontWeight: '500',
    },
    servicesGrid: {
        flex: 1,
    },
    serviceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 28,
        gap: 16,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    serviceTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
    },
    serviceDesc: {
        fontSize: 13,
        color: '#94A3B8',
        marginTop: 2,
    },
    footer: {
        marginTop: 'auto',
        marginBottom: 20,
        gap: 12,
        alignItems: 'center',
    },
    primaryBtn: {
        width: '100%',
        height: 54,
        backgroundColor: '#6C2BD9',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    primaryBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryBtn: {
        width: '100%',
        height: 54,
        backgroundColor: '#FFF',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
    },
    secondaryBtnText: {
        color: '#1E293B',
        fontSize: 15,
        fontWeight: '700',
    },
    versionText: {
        fontSize: 11,
        color: '#CBD5E1',
        fontWeight: '600',
        marginTop: 8,
    }
});
