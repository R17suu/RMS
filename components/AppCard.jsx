import { StyleSheet, View } from 'react-native';

const AppCard = ({ style, children, ...props }) => {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default AppCard;
