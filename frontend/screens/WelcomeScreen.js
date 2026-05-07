import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    icon: 'phone-iphone',
    title: 'Instant Airtime Top-Up',
    description: 'Easily and quickly recharge any mobile network.',
  },
  {
    id: '2',
    icon: 'signal-cellular-alt',
    title: 'Affordable Data Bundles',
    description: 'Get the best prices on a wide range of data plans.',
  },
  {
    id: '3',
    icon: 'receipt',
    title: 'Pay Bills Seamlessly',
    description: 'Conveniently pay your electricity, TV, and other bills in one place.',
  },
];

const WelcomeScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef();
  const router = useRouter();

  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    setCurrentIndex(index);
  };

  const scrollToNext = () => {
    if (currentIndex < slides.length - 1) {
      scrollViewRef.current.scrollTo({ x: width * (currentIndex + 1), animated: true });
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/ameedatalogo.png')}
            style={{ width: 64, height: 64, marginBottom: 10 }}
          />
          <Text style={styles.logoText}>ameedata</Text>
        </View>
      </View>

      {/* Slider */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.slider}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <MaterialIcons name={slide.icon} size={80} color="#34d399" />
              </View>
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Pagination */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex ? styles.paginationDotActive : {},
            ]}
          />
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.trustText}>Trusted & Secure with Minimal Fees.</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/signup')}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.secondaryButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    color: '#111418',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    fontFamily: 'Inter-Bold',
  },
  slider: {
    flex: 1,
  },
  slide: {
    width: width - 40,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconBackground: {
    width: 150,
    height: 150,
    borderRadius: 100,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  description: {
    color: '#9dabb8',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
    fontFamily: 'Inter',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3c4753',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 32,
    backgroundColor: '#34d399',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  trustText: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14,
    fontFamily: 'Inter',
  },
  primaryButton: {
    backgroundColor: '#34d399',
    borderRadius: 8,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#0a335c',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
});

export default WelcomeScreen;
