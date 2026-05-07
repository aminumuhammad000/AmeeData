import { Image, StyleSheet, View } from 'react-native';

export const Logo = ({ size = 48 }) => (
  <View style={[styles.container, { width: size, height: size }]}>
    <Image
      source={require('../assets/images/ameedatalogo.png')}
      style={{ width: size, height: size }}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    backgroundColor: '#0a335c',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Logo;
