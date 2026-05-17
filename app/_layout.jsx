import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { auth } from '../FirebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';

export default function RootLayout() {
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log('User is authenticated:', user.email);
            } else {
                console.log('User is not authenticated');
            }
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (Platform.OS === 'android') {
            NavigationBar.setVisibilityAsync('hidden');
            NavigationBar.setBehaviorAsync('overlay-swipe');
        }
    }, []);

    return (
        <>
            <StatusBar style="light" hidden={true} />
            <Stack
                screenOptions={{
                    headerShown: false,
                    animationEnabled: true,
                    contentStyle: { backgroundColor: '#040b1f' },
                }}
            >
                <Stack.Screen name="index" options={{ title: 'Sign In' }} />
                <Stack.Screen name="(clerk)" options={{ title: 'Clerk Module' }} />
                <Stack.Screen name="(sadmin)" options={{ title: 'Superadmin' }} />
            </Stack>
        </>
    );
}