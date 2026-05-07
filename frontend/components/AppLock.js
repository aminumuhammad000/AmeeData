import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const AppLock = ({ visible }) => {
    const { setIsLocked, logout } = useAuth();
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState(null);

    const authenticate = async () => {
        setIsAuthenticating(true);
        setError(null);
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Unlock AmeeData',
                fallbackLabel: 'Use Password',
            });

            if (result.success) {
                setIsLocked(false);
            } else {
                setError('Authentication failed');
            }
        } catch (err) {
            setError('An error occurred');
            console.error(err);
        } finally {
            setIsAuthenticating(false);
        }
    };

    useEffect(() => {
        if (visible) {
            authenticate();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="lock-closed" size={60} color="#3B82F6" />
                    </View>
                    <Text style={styles.title}>App Locked</Text>
                    <Text style={styles.subtitle}>Please authenticate to continue</Text>

                    {isAuthenticating ? (
                        <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
                    ) : (
                        <TouchableOpacity style={styles.unlockButton} onPress={authenticate}>
                            <Ionicons name="finger-print" size={24} color="#FFF" />
                            <Text style={styles.unlockButtonText}>Unlock App</Text>
                        </TouchableOpacity>
                    )}

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={() => {
                            setIsLocked(false);
                            logout();
                        }}
                    >
                        <Text style={styles.logoutButtonText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(17, 25, 33, 0.98)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        width: '100%',
        alignItems: 'center',
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#9CA3AF',
        marginBottom: 40,
    },
    loader: {
        marginVertical: 20,
    },
    unlockButton: {
        backgroundColor: '#3B82F6',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 12,
        marginBottom: 20,
    },
    unlockButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    errorText: {
        color: '#EF4444',
        marginBottom: 20,
    },
    logoutButton: {
        marginTop: 20,
        padding: 10,
    },
    logoutButtonText: {
        color: '#3B82F6',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AppLock;
