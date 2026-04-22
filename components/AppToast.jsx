import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

const TOAST_VARIANTS = {
  error: {
    container: {
      backgroundColor: 'rgba(185, 28, 28, 0.94)',
      borderColor: 'rgba(254, 202, 202, 0.35)',
    },
    iconColor: '#fecaca',
    textColor: '#fee2e2',
    iconName: 'alert-circle',
  },
  success: {
    container: {
      backgroundColor: 'rgba(22, 101, 52, 0.94)',
      borderColor: 'rgba(187, 247, 208, 0.35)',
    },
    iconColor: '#bbf7d0',
    textColor: '#dcfce7',
    iconName: 'checkmark-circle',
  },
};

const AppToast = ({ message, type = 'error', duration = 3200, onHide }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) {
      return;
    }

    const variant = TOAST_VARIANTS[type] ? type : 'error';

    Animated.timing(opacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();

    const timeoutId = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start(() => {
        if (onHide) {
          onHide();
        }
      });
    }, duration);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [duration, message, onHide, opacity, type]);

  if (!message) {
    return null;
  }

  const variant = TOAST_VARIANTS[type] ? TOAST_VARIANTS[type] : TOAST_VARIANTS.error;

  return (
    <Animated.View
      style={[
        styles.toast,
        variant.container,
        {
          opacity,
        },
      ]}
    >
      <Ionicons name={variant.iconName} size={18} color={variant.iconColor} />
      <Text style={[styles.toastText, { color: variant.textColor }]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 18,
    left: 14,
    right: 14,
    zIndex: 20,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },
});

export default AppToast;
