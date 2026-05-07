import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, useColorScheme, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { adminService } from '@/services/admin.service';
import { useAlert } from '@/components/AlertContext';

const theme = {
    primary: '#0A2540',
    accent: '#FF9F43',
    success: '#00D4AA',
    error: '#FF5B5B',
};

export default function AdminNotificationsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { showSuccess, showError } = useAlert();

    const bgColor = isDark ? '#000000' : '#F9FAFB';
    const cardBgColor = isDark ? '#1C1C1E' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#1F2937';
    const textBodyColor = isDark ? '#D1D5DB' : '#6B7280';
    const borderColor = isDark ? '#374151' : '#E5E7EB';
    const inputBg = isDark ? '#2C2C2E' : '#F3F4F6';

    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('system'); // system, promotion, alert, app_update
    const [actionUrl, setActionUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSend = async () => {
        if (!title.trim() || !message.trim()) {
            showError('Please fill in title and message');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await adminService.sendBroadcastNotification({
                title,
                message,
                type,
                action_url: actionUrl,
                priority: type === 'app_update' || type === 'alert' ? 'high' : 'medium',
            });

            if (res?.success) {
                showSuccess('Notification sent successfully');
                setTitle('');
                setMessage('');
                setActionUrl('');
                setType('system');
            } else {
                showError(res?.message || 'Failed to send notification');
            }
        } catch (error: any) {
            showError(error?.message || 'Failed to send notification');
        } finally {
            setIsSubmitting(false);
        }
    };

    const predefinedTypes = [
        { id: 'system', label: 'System Info', icon: 'information-circle' },
        { id: 'promotion', label: 'Promotion', icon: 'pricetag' },
        { id: 'alert', label: 'Alert', icon: 'warning' },
        { id: 'app_update', label: 'App Update', icon: 'cloud-download' },
    ];

    const handleTypeSelect = (selectedType: string) => {
        setType(selectedType);
        if (selectedType === 'app_update') {
            setTitle('New App Update Available!');
            setMessage('A new version of the app is available. Please update now for the latest features and improvements.');
            // You could pre-fill the store URL here if known, or leave it for admin to input
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={[styles.header, { backgroundColor: cardBgColor }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>Push Notification</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.card, { backgroundColor: cardBgColor, borderColor }]}>
                    <Text style={[styles.label, { color: textColor }]}>Notification Type</Text>
                    <View style={styles.typeContainer}>
                        {predefinedTypes.map((t) => (
                            <TouchableOpacity
                                key={t.id}
                                style={[
                                    styles.typeButton,
                                    {
                                        backgroundColor: type === t.id ? theme.accent : inputBg,
                                        borderColor: type === t.id ? theme.accent : borderColor
                                    }
                                ]}
                                onPress={() => handleTypeSelect(t.id)}
                            >
                                <Ionicons
                                    name={t.icon as any}
                                    size={20}
                                    color={type === t.id ? '#FFF' : textBodyColor}
                                />
                                <Text style={[
                                    styles.typeText,
                                    { color: type === t.id ? '#FFF' : textBodyColor }
                                ]}>
                                    {t.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.label, { color: textColor }]}>Title</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                        placeholder="Enter notification title"
                        placeholderTextColor={textBodyColor}
                        value={title}
                        onChangeText={setTitle}
                    />

                    <Text style={[styles.label, { color: textColor }]}>Message</Text>
                    <TextInput
                        style={[styles.input, styles.textArea, { backgroundColor: inputBg, color: textColor, borderColor }]}
                        placeholder="Enter notification message"
                        placeholderTextColor={textBodyColor}
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />

                    <Text style={[styles.label, { color: textColor }]}>Action URL (Optional)</Text>
                    <Text style={[styles.helperText, { color: textBodyColor }]}>
                        Link to open when user taps the notification (e.g., Play Store link)
                    </Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                        placeholder="https://..."
                        placeholderTextColor={textBodyColor}
                        value={actionUrl}
                        onChangeText={setActionUrl}
                        autoCapitalize="none"
                        keyboardType="url"
                    />

                    <TouchableOpacity
                        style={[styles.sendButton, { backgroundColor: theme.primary, opacity: isSubmitting ? 0.7 : 1 }]}
                        onPress={handleSend}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Ionicons name="send" size={20} color="#FFF" style={{ marginRight: 8 }} />
                                <Text style={styles.sendButtonText}>Send Broadcast</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 20, fontWeight: '600' },
    placeholder: { width: 40 },
    content: { padding: 16 },
    card: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 16,
    },
    helperText: {
        fontSize: 12,
        marginBottom: 8,
        marginTop: -4,
    },
    input: {
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
    },
    textArea: {
        height: 120,
        paddingTop: 12,
    },
    typeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 8,
    },
    typeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
    },
    typeText: {
        fontSize: 14,
        fontWeight: '500',
    },
    sendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 12,
        marginTop: 32,
    },
    sendButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
