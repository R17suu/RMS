import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Image,
} from 'react-native';
import ThemedView from '../components/ThemedView';
import Spacer from '../components/Spacer';
import AppToast from '../components/AppToast';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import AppTextField from '../components/AppTextField';
import { auth } from '../FirebaseConfig';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { fetchUserRecord } from '../services/userService';
import { fetchRoleByName } from '../services/roleService';

export default function App() {
    const router = useRouter();
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
            const uid = userCredential.user.uid;
            
            // 1. Fetch User Record
            const userRecord = await fetchUserRecord(uid);
            if (!userRecord) {
                await signOut(auth);
                showErrorToast('User record not found in the database.');
                setIsSigningIn(false);
                return;
            }
            
            // 2. Check Status
            if (userRecord.status !== 'Active') {
                await signOut(auth);
                showErrorToast('Your account is inactive. Please contact an administrator.');
                setIsSigningIn(false);
                return;
            }

            // 3. Fetch Role & Permissions
            const roleRecord = await fetchRoleByName(userRecord.role);
            const permissions = roleRecord?.permissions || [];

            // 4. RBAC Routing
            if (permissions.includes('manage_tickets') || permissions.includes('view_logs')) {
                router.replace('/(sadmin)/dashboard');
            } else if (permissions.includes('view_users') || permissions.includes('create_users')) {
                router.replace('/(admin)/dashboard');
            } else {
                router.replace('/(clerk)/dashboard');
            }
            
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
            <BlurView intensity={65} tint="dark" style={[styles.glowBlur, styles.glowBlurTop]} />
            <BlurView intensity={70} tint="dark" style={[styles.glowBlur, styles.glowBlurBottom]} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.contentWrap}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <AppCard>
                    {/* <Image source={require('../assets/EEU logo.png')} style={{ width: 0, height: 0 }} /> */}
                    <View style={styles.logoBox}>
                        <Text style={styles.logoText}>EEU</Text>
                    </View>

                    <Text style={styles.title}>Records Management</Text>
                    {/* <Text style={styles.subtitle}>Clerk Module - Sign In</Text> */}
                    <Text style={styles.helperText}>Use your official account to continue.</Text>

                    <Spacer height={16}/>

                    <View style={styles.inputGroup}>
                        <AppTextField
                            label="Email Address"
                            leftIconName="mail"
                            leftIconColor="#f59e0b"
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

                        <AppTextField
                            ref={passwordInputRef}
                            label="Password"
                            leftIconName="lock-closed"
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
                            rightAccessory={(
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
                            )}
                        />
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

                    <Spacer height={16}/>

                    <AppButton
                        title={isSigningIn ? 'Signing In...' : 'Sign In'}
                        onPress={handleSignIn}
                        disabled={isSigningIn}
                    />

                    <Spacer height={16}/>
                    
                    <Text style={styles.footer}>Economic Enterprise Unit © 2026</Text>
                </AppCard>
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
    glowBlur: {
        position: 'absolute',
        width: 420,
        height: 420,
        borderRadius: 999,
        opacity: 0.8,
    },
    glowBlurTop: {
        top: -120,
        left: 0,
    },
    glowBlurBottom: {
        bottom: -180,
        right: -80,
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
    footer: {
        color: '#627593',
        fontSize: 12,
        textAlign: 'center',
    },
});