import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const RingProgress = ({ progress, size, strokeWidth, kcalLeft }) => {
  const theme = useColorScheme(); // Get the current color scheme (light or dark)
  const isDarkMode = theme === 'dark'; // Check if the current theme is dark mode

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isDarkMode ? '#444' : '#DDD'} // Dark mode background circle color
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isDarkMode ? 'green' : '#4CAF50'} // Dark mode progress color
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      {/* Calories Left Text */}
      <View style={styles.textContainer}>
        <Text style={[styles.kcalLeft, { color: isDarkMode ? 'white' : 'black' }]}>
          {kcalLeft}
        </Text>
      </View>
    </View>
  );
};

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
