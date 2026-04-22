import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

const AppButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  iconName = 'arrow-forward',
  style,
  textStyle,
}) => {
  const buttonTitle = loading ? 'Please wait...' : title;

  return (
    <Pressable
      style={[styles.button, disabled && styles.buttonDisabled, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, textStyle]}>{buttonTitle}</Text>
      {iconName ? <Ionicons name={iconName} size={20} color="#111827" /> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
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
});

export default AppButton;
