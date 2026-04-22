import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import ThemedView from '../components/ThemedView';
import Spacer from '../components/Spacer';
import AppToast from '../components/AppToast';
import { auth } from '../FirebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function App() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'error' });
    const [isSigningIn, setIsSigningIn] = useState(false);
    const passwordInputRef = useRef(null);

    const showToast = (message, type = 'error') => {
        setToast({ message, type });
    };

    const showErrorToast = (message) => {
        showToast(message, 'error');
    };

    const showSuccessToast = (message) => {
        showToast(message, 'success');
    };

    const getSignInErrorMessage = (error) => {
        const code = error?.code;
        switch (code) {
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/missing-password':
                return 'Please enter your password.';
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
            case 'auth/user-not-found':
                return 'Incorrect email or password.';
            case 'auth/too-many-requests':
                return 'Too many attempts. Try again in a moment.';
            case 'auth/network-request-failed':
                return 'Network error. Check your internet connection.';
            default:
                return 'Sign in failed. Please try again.';
        }
    };

    const handleSignIn = async () => {
        Keyboard.dismiss();

        if (!username.trim() || !password) {
            showErrorToast('Email and password are required.');
            return;
        }

        setIsSigningIn(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, username, password);
            console.log('User signed in:', userCredential.user);
            showSuccessToast('Signed in successfully. Welcome back!');
        } catch (error) {
            console.error('Error signing in:', error);
            showErrorToast(getSignInErrorMessage(error));
        } finally {
            setIsSigningIn(false);
        }
    };

    return (
        <ThemedView style={styles.container} safe>
            <AppToast
                message={toast.message}
                type={toast.type}
                onHide={() => setToast((prev) => ({ ...prev, message: '' }))}
            />

            <View style={[styles.glow, styles.glowTop]} />
            <View style={[styles.glow, styles.glowBottom]} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.contentWrap}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.card}>
                    <View style={styles.logoBox}>
                        <Text style={styles.logoText}>EEU</Text>
                    </View>

                    <Text style={styles.title}>Records Management</Text>
                    {/* <Text style={styles.subtitle}>Clerk Module - Sign In</Text> */}
                    <Text style={styles.helperText}>Use your official account to continue.</Text>

                    <Spacer height={20}/>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email Address</Text>
                        <View style={styles.inputShell}>
                            <Ionicons name="mail" size={18} color="#f59e0b" />
                            <TextInput
                                style={styles.input}
                                value={username}
                                onChangeText={setUsername}
                                placeholder="you@company.com"
                                placeholderTextColor="#667693"
                                autoCapitalize="none"
                                autoCorrect={false}
                                keyboardType="email-address"
                                textContentType="emailAddress"
                                returnKeyType="next"
                                onSubmitEditing={() => passwordInputRef.current?.focus()}
                            />
                        </View>

                        <Text style={styles.inputLabel}>Password</Text>
                        <View style={styles.inputShell}>
                            <Ionicons name="lock-closed" size={18} color="#8ca0be" />
                            <TextInput
                                ref={passwordInputRef}
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Password"
                                placeholderTextColor="#667693"
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                                textContentType="password"
                                returnKeyType="go"
                                onSubmitEditing={handleSignIn}
                            />
                            <Pressable
                                onPress={() => setShowPassword((prev) => !prev)}
                                hitSlop={10}
                                accessibilityRole="button"
                                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off' : 'eye'}
                                    size={18}
                                    color="#7f91af"
                                />
                            </Pressable>
                        </View>
                    </View>

                        <View style={styles.optionsRow}>
                            <Pressable
                                style={styles.rememberRow}
                                onPress={() => setRememberMe((prev) => !prev)}
                            >
                                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                                    {rememberMe ? <Ionicons name="checkmark" size={12} color="#0d111f" /> : null}
                                </View>
                                <Text style={styles.rememberText}>Remember me</Text>
                            </Pressable>

                            <Pressable onPress={() => showErrorToast('Reset password flow will be added next.')}>
                                <Text style={styles.linkText}>Forgot password?</Text>
                            </Pressable>
                        </View>

                    <Spacer height={20}/>

                    <Pressable
                        style={[styles.button, isSigningIn && styles.buttonDisabled]}
                        onPress={handleSignIn}
                        disabled={isSigningIn}
                    >
                        <Text style={styles.buttonText}>{isSigningIn ? 'Signing In...' : 'Sign In'}</Text>
                        <Ionicons name="arrow-forward" size={20} color="#111827" />
                    </Pressable>

                    <Spacer height={20}/>
                    
                    <Text style={styles.footer}>Economic Enterprise Unit © 2026</Text>
                </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#040b1f',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 18,
        overflow: 'hidden',
    },
    glow: {
        position: 'absolute',
        width: 360,
        height: 360,
        borderRadius: 999,
        opacity: 0.35,
    },
    glowTop: {
        top: -80,
        left: 28,
        backgroundColor: '#f59e0b',
    },
    glowBottom: {
        bottom: -140,
        right: -40,
        backgroundColor: '#18358a',
    },
    contentWrap: {
        width: '100%',
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
    },
    card: {
        width: '100%',
        maxWidth: 390,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.09)',
        backgroundColor: 'rgba(13,19,38,0.72)',
        paddingHorizontal: 28,
        paddingVertical: 24,
        alignItems: 'stretch',
    },
    logoBox: {
        width: 66,
        height: 66,
        borderRadius: 16,
        backgroundColor: '#f59e0b',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        alignSelf: 'center',
    },
    logoText: {
        color: '#0f172a',
        fontWeight: '900',
        fontSize: 30,
        letterSpacing: 0.5,
    },
    title: {
        color: '#f7f9ff',
        fontSize: 25,
        lineHeight: 40,
        fontWeight: '800',
        textAlign: 'center',
    },
    subtitle: {
        marginTop: 8,
        color: '#6f86a8',
        fontSize: 16,
        marginBottom: 6,
        textAlign: 'center',
    },
    helperText: {
        color: '#8da2c0',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 18,
    },
    inputGroup: {
        width: '100%',
        gap: 12,
    },
    inputLabel: {
        color: '#a8bbd7',
        fontSize: 13,
        fontWeight: '700',
        marginBottom: -4,
    },
    inputShell: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(28,37,58,0.95)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 14,
        height: 58,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        color: '#d6e0f2',
        fontSize: 17,
    },
    optionsRow: {
        marginTop: 14,
        marginBottom: 16,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rememberRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#aebed8',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
        marginRight: 10,
    },
    checkboxChecked: {
        backgroundColor: '#f59e0b',
        borderColor: '#f59e0b',
    },
    rememberText: {
        color: '#98abc7',
        fontSize: 14,
    },
    linkText: {
        color: '#f7c35d',
        fontSize: 14,
        fontWeight: '700',
    },
    button: {
        width: '100%',
        backgroundColor: '#f59e0b',
        borderRadius: 14,
        height: 62,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#111827',
        fontWeight: '800',
        fontSize: 18,
    },
    footer: {
        color: '#627593',
        fontSize: 12,
        textAlign: 'center',
    },
});