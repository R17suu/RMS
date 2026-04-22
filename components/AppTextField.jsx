import { Ionicons } from '@expo/vector-icons';
import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

const AppTextField = forwardRef(
  (
    {
      label,
      leftIconName,
      leftIconColor = '#8ca0be',
      rightAccessory,
      containerStyle,
      inputStyle,
      ...textInputProps
    },
    ref
  ) => {
    return (
      <View style={[styles.container, containerStyle]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}

        <View style={styles.inputShell}>
          {leftIconName ? <Ionicons name={leftIconName} size={18} color={leftIconColor} /> : null}

          <TextInput ref={ref} style={[styles.input, inputStyle]} {...textInputProps} />

          {rightAccessory ? rightAccessory : null}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 8,
  },
  label: {
    color: '#a8bbd7',
    fontSize: 13,
    fontWeight: '700',
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
});

AppTextField.displayName = 'AppTextField';

export default AppTextField;
