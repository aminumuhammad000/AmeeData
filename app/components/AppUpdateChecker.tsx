import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notificationsService } from '@/services/notifications.service';
import { useTheme } from './ThemeContext';

export function AppUpdateChecker() {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [updateInfo, setUpdateInfo] = useState<{ title: string; message: string; url: string } | null>(null);
    const { isDark } = useTheme();

    useEffect(() => {
        checkForUpdates();
    }, []);

    const checkForUpdates = async () => {
        try {
            // Fetch latest notifications to check for app updates
            // In a real app, you might have a dedicated endpoint for version checking
            // For now, we'll look for a high-priority 'app_update' notification
            const res = await notificationsService.getNotifications(1, 10);
            if (res.success && res.data) {
                const updateNotif = res.data.find(
                    (n) => (n.type as string) === 'app_update'
                );

                if (updateNotif) {
                    setUpdateInfo({
                        title: updateNotif.title,
                        message: updateNotif.message,
                        url: updateNotif.action_url || '',
                    });
                    setUpdateAvailable(true);
                }
            }
        } catch (error) {
            console.log('Failed to check for updates', error);
        }
    };

    const handleUpdate = () => {
        if (updateInfo?.url) {
            Linking.openURL(updateInfo.url);
        }
    };

    const handleDismiss = () => {
        // Optional: Allow dismissing if it's not a forced update
        setUpdateAvailable(false);
    };

    if (!updateAvailable || !updateInfo) return null;

    const bgColor = isDark ? '#1C1C1E' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#1F2937';
    const bodyColor = isDark ? '#D1D5DB' : '#6B7280';

    return (
        <Modal
            transparent
            visible={updateAvailable}
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={[styles.card, { backgroundColor: bgColor }]}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="rocket" size={32} color="#FFFFFF" />
                    </View>

                    <Text style={[styles.title, { color: textColor }]}>{updateInfo.title}</Text>
                    <Text style={[styles.message, { color: bodyColor }]}>{updateInfo.message}</Text>

                    <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
                        <Text style={styles.updateButtonText}>Update Now</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
                        <Text style={[styles.dismissText, { color: bodyColor }]}>Remind Me Later</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#0A2540',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    updateButton: {
        backgroundColor: '#0A2540',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        marginBottom: 12,
    },
    updateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    dismissButton: {
        paddingVertical: 8,
    },
    dismissText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
