import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AppCard from '../AppCard';
import { auth } from '../../FirebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { fetchUserRecord } from '../../services/userService';

export default function SharedWelcomeBanner({ 
    themeColor = '#3b82f6', 
    iconName = 'document-text', 
    iconFamily = 'Ionicons',
    iconColor = '#f7f9ff'
}) {
    const [userName, setUserName] = useState('User');

    useEffect(() => {
        let isMounted = true;
        const loadName = async () => {
            try {
                let name = await AsyncStorage.getItem('user_first_name');
                if (name && isMounted) {
                    setUserName(name);
                }
            } catch (e) {
                console.error("Failed to load user name", e);
            }
        };
        
        loadName();

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user?.uid && isMounted) {
                try {
                    // Always try to update with the freshest data in the background
                    let name = await AsyncStorage.getItem('user_first_name');
                    if (!name && auth.currentUser?.uid) {
                        const record = await fetchUserRecord(auth.currentUser.uid);
                        const fetchedName = record?.firstName || record?.fullName;
                        if (fetchedName) {
                            name = fetchedName;
                            setUserName(name);
                            await AsyncStorage.setItem('user_first_name', name);
                        }
                    }
                } catch (error) {
                    console.error("Failed to load user name for banner", error);
                }
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, []);

    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const IconComponent = iconFamily === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Ionicons;

    return (
        <AppCard style={[styles.welcomeCard, { borderColor: `${themeColor}59` }]}>
            <View style={styles.welcomeTextWrap}>
                <Text style={styles.welcomeText}>
                    Welcome back, <Text style={[styles.highlight, { color: themeColor }]}>{userName}</Text>
                </Text>
                <Text style={styles.dateText}>{dateString}</Text>
            </View>
            <View style={[styles.welcomeIconWrap, { backgroundColor: themeColor }]}>
                <IconComponent name={iconName} size={24} color={iconColor} />
            </View>
        </AppCard>
    );
}

const styles = StyleSheet.create({
    welcomeCard: {
        width: '100%',
        maxWidth: '100%',
        alignSelf: 'stretch',
        paddingHorizontal: 18,
        paddingVertical: 18,
        borderRadius: 20,
        borderWidth: 1,
        backgroundColor: 'rgba(20,28,60,0.95)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeTextWrap: {
        flexShrink: 1,
    },
    welcomeText: {
        color: '#f3f6ff',
        fontWeight: '800',
        fontSize: 18,
    },
    highlight: {
        // dynamic color applied in inline style
    },
    dateText: {
        marginTop: 4,
        color: '#8da2c0',
        fontSize: 14,
    },
    welcomeIconWrap: {
        width: 60,
        height: 60,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
