import { useAlert } from '@/components/AlertContext';
import { userService } from '@/services/user.service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

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

export default function ChangePasswordScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { showSuccess, showError } = useAlert();

    const bgColor = isDark ? theme.backgroundDark : theme.backgroundLight;
    const cardBgColor = isDark ? '#1F2937' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : theme.textHeadings;
    const textBodyColor = isDark ? '#9CA3AF' : theme.textBody;
    const borderColor = isDark ? '#374151' : '#E5E7EB';
    const inputBgColor = isDark ? '#374151' : '#F9FAFB';

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            showError('Please fill in all password fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            showError('New passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            showError('Password must be at least 8 characters long');
            return;
        }

        setIsChangingPassword(true);

        try {
            const res = await userService.updatePassword(currentPassword, newPassword);
            if (res?.success) {
                showSuccess('Password changed successfully!');
                router.back();
            } else {
                showError(res?.message || 'Failed to change password');
            }
        } catch (error) {
            const message = (error as any)?.message || 'Failed to change password. Please try again.';
            showError(message);
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <View style={[styles.header, { backgroundColor: bgColor, borderBottomColor: borderColor }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>Change Password</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={[styles.section, { backgroundColor: cardBgColor }]}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>Login Password</Text>
                    <Text style={[styles.sectionDescription, { color: textBodyColor }]}>Update your account login password</Text>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.inputLabel, { color: textBodyColor }]}>Current Password</Text>
                        <TextInput
                            style={[styles.textInput, {
                                backgroundColor: inputBgColor,
                                borderColor: borderColor,
                                color: textColor
                            }]}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder="Enter current password"
                            placeholderTextColor={textBodyColor}
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.inputLabel, { color: textBodyColor }]}>New Password</Text>
                        <TextInput
                            style={[styles.textInput, {
                                backgroundColor: inputBgColor,
                                borderColor: borderColor,
                                color: textColor
                            }]}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="Enter new password"
                            placeholderTextColor={textBodyColor}
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.inputLabel, { color: textBodyColor }]}>Confirm New Password</Text>
                        <TextInput
                            style={[styles.textInput, {
                                backgroundColor: inputBgColor,
                                borderColor: borderColor,
                                color: textColor
                            }]}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm new password"
                            placeholderTextColor={textBodyColor}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, {
                            backgroundColor: theme.primary,
                            opacity: isChangingPassword ? 0.7 : 1
                        }]}
                        onPress={handleChangePassword}
                        disabled={isChangingPassword}
                    >
                        <Text style={styles.submitButtonText}>
                            {isChangingPassword ? 'Changing...' : 'Change Password'}
                        </Text>
                    </TouchableOpacity>
                </View>
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
        marginBottom: 8,
    },
    sectionDescription: {
        fontSize: 14,
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
    submitButton: {
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
