import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const BMICircle = ({ bmi, size = 150 }) => {
  const colorScheme = useColorScheme(); // Get the current color scheme (light or dark)
  
  // Define colors for light and dark modes
  const circleColor = colorScheme === 'dark' ? 'lightgreen' : 'green';
  const backgroundColor = colorScheme === 'dark' ? 'black' : 'white';
  const textColor = colorScheme === 'dark' ? 'lightgreen' : 'green';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Circle matches profile background */}
        <Circle cx="50" cy="50" r="45" stroke={circleColor} strokeWidth="8" fill={backgroundColor} />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={[styles.bmiText, { fontSize: size * 0.2, color: textColor }]}>{bmi}</Text>
        <Text style={[styles.bmiLabel, { fontSize: size * 0.12, color: textColor }]}>BMI</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  bmiText: {
    fontWeight: 'bold',
  },
  bmiLabel: {
    fontWeight: 'bold',
  },
});

export default BMICircle;
