import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, useColorScheme, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const RingProgress = ({ progress, size, strokeWidth, kcalLeft }) => {
  const theme = useColorScheme();
  const isDarkMode = theme === 'dark';
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress / kcalLeft, // Chỉnh để progress là tỉ lệ của kcalLeft
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress, kcalLeft]);

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isDarkMode ? '#444' : '#DDD'}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isDarkMode ? 'green' : '#4CAF50'}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={[styles.kcalLeft, { color: isDarkMode ? 'white' : 'black' }]}> 
          {kcalLeft}
        </Text>
      </View>
    </View>
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kcalLeft: {
    fontSize: 40,
    fontWeight: 'bold',
  },
});

export default RingProgress;