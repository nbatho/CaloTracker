import React from 'react';
import { View, Text as RNText, StyleSheet } from 'react-native';
import Svg, { Circle, Path, G, Text as SvgText } from 'react-native-svg';

const BMIGauge = ({ bmi, size = 200 }) => {
  // Set default value if bmi is undefined
  const bmiValue = typeof bmi === 'number' ? bmi : 22.9;

  // Calculate angle for needle based on BMI value
  const getBMIAngle = (bmi) => {
    // Map BMI range (approximately 14-45) to angle range (-150 to 150 degrees)
    if (bmi < 16) return -150;
    if (bmi < 17) return -120;
    if (bmi < 18.5) return -90;
    if (bmi < 25) return -30 + (bmi - 18.5) * 80 / 6.5; // Gradual movement within normal range
    if (bmi < 30) return 50;
    if (bmi < 35) return 90;
    if (bmi < 40) return 120;
    return 150;
  };

  // Get BMI category and status
  const getBMICategory = (bmi) => {
    if (bmi < 16) return { category: 'Very severely underweight', color: '#007bff', range: 'BMI < 16.0' };
    if (bmi < 17) return { category: 'Severely underweight', color: '#00bfff', range: 'BMI 16.0 - 16.9' };
    if (bmi < 18.5) return { category: 'Underweight', color: '#20B2AA', range: 'BMI 17.0 - 18.4' };
    if (bmi < 25) return { category: 'Normal', color: '#32CD32', range: 'BMI 18.5 - 24.9' };
    if (bmi < 30) return { category: 'Overweight', color: '#FFA500', range: 'BMI 25.0 - 29.9' };
    if (bmi < 35) return { category: 'Obese Class I', color: '#FF4500', range: 'BMI 30.0 - 34.9' };
    if (bmi < 40) return { category: 'Obese Class II', color: '#FF0000', range: 'BMI 35.0 - 39.9' };
    return { category: 'Obese Class III', color: '#8B0000', range: 'BMI ≥ 40.0' };
  };

  // Draw arc for meter
  const drawArc = (startAngle, endAngle, color) => {
    const radius = 40;
    const cx = 50;
    const cy = 50;
    
    // Convert angles to radians
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    // Calculate start and end points
    const startX = cx + radius * Math.cos(startRad);
    const startY = cy + radius * Math.sin(startRad);
    const endX = cx + radius * Math.cos(endRad);
    const endY = cy + radius * Math.sin(endRad);
    
    // Create arc flag
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    // Create path
    return (
      <Path
        d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`}
        stroke={color}
        strokeWidth={8}
        fill="none"
      />
    );
  };

  const needleAngle = getBMIAngle(bmiValue);
  const bmiInfo = getBMICategory(bmiValue);
  
  // Categories for the legend
  const categories = [
    { category: 'Very severely underweight', color: '#007bff', range: 'BMI < 16.0' },
    { category: 'Severely underweight', color: '#00bfff', range: 'BMI 16.0 - 16.9' },
    { category: 'Underweight', color: '#20B2AA', range: 'BMI 17.0 - 18.4' },
    { category: 'Normal', color: '#32CD32', range: 'BMI 18.5 - 24.9' },
    { category: 'Overweight', color: '#FFA500', range: 'BMI 25.0 - 29.9' },
    { category: 'Obese Class I', color: '#FF4500', range: 'BMI 30.0 - 34.9' },
    { category: 'Obese Class II', color: '#FF0000', range: 'BMI 35.0 - 39.9' },
    { category: 'Obese Class III', color: '#8B0000', range: 'BMI ≥ 40.0' }
  ];
  
  // Pre-calculate tick marks to avoid potential issues with inline text in .map()
  const tickMarks = [];
  for (let i = 0; i < 31; i++) {
    const angle = -150 + i * 10;
    const radian = (angle - 90) * Math.PI / 180;
    const x1 = 50 + 40 * Math.cos(radian);
    const y1 = 50 + 40 * Math.sin(radian);
    const x2 = 50 + 35 * Math.cos(radian);
    const y2 = 50 + 35 * Math.sin(radian);
    tickMarks.push(
      <Path
        key={`tick-${i}`}
        d={`M ${x1} ${y1} L ${x2} ${y2}`}
        stroke="#FFFFFF"
        strokeWidth={1}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Updated header container with justify-content: space-between */}
      <View style={styles.headerContainer}>
        <RNText style={styles.headerText}>BMI (kg/m²)</RNText>
        <View style={[styles.statusBadge, { backgroundColor: bmiInfo.color }]}>
          <RNText style={styles.statusText}>{bmiInfo.category}</RNText>
        </View>
      </View>
      
      <View style={[styles.gaugeContainer, { width: size, height: size/2 + 50 }]}>
        <Svg width={size} height={size/2 + 20} viewBox="0 0 100 70">
          {/* Draw the colored arcs */}
          {drawArc(-150, -120, '#007bff')} {/* Very severely underweight */}
          {drawArc(-120, -90, '#00bfff')}  {/* Severely underweight */}
          {drawArc(-90, -30, '#20B2AA')}   {/* Underweight */}
          {drawArc(-30, 50, '#32CD32')}    {/* Normal */}
          {drawArc(50, 90, '#FFA500')}     {/* Overweight */}
          {drawArc(90, 120, '#FF4500')}    {/* Obese Class I */}
          {drawArc(120, 150, '#FF0000')}   {/* Obese Class II */}
          
          {/* Small tick marks - changed to use pre-calculated array */}
          <G>
            {tickMarks}
          </G>
          
          {/* Needle with glow effect */}
          <G transform={`rotate(${needleAngle}, 50, 50)`}>
            {/* Glow effect */}
            <Circle cx="50" cy="50" r="7" fill={bmiInfo.color} opacity={0.4} />
            <Path
              d="M 50 15 L 53 50 L 50 55 L 47 50 Z"
              fill={bmiInfo.color}
              stroke={bmiInfo.color}
              strokeWidth="1"
            />
            <Circle cx="50" cy="50" r="4" fill="#FFFFFF" stroke={bmiInfo.color} strokeWidth="1" />
          </G>
          
          {/* Add BMI markers with SvgText */}
          <SvgText x="10" y="50" fontSize="3" fill="#666666" textAnchor="middle">16</SvgText>
          <SvgText x="20" y="30" fontSize="3" fill="#666666" textAnchor="middle">18.5</SvgText>
          <SvgText x="50" y="15" fontSize="3" fill="#666666" textAnchor="middle">25</SvgText>
          <SvgText x="80" y="30" fontSize="3" fill="#666666" textAnchor="middle">30</SvgText>
          <SvgText x="90" y="50" fontSize="3" fill="#666666" textAnchor="middle">40</SvgText>
        </Svg>
        
        {/* Display BMI value below the SVG */}
        <View style={styles.bmiValueContainer}>
          <RNText style={styles.bmiValueText}>{bmiValue.toFixed(1)}</RNText>
          <RNText style={styles.bmiUnitText}>BMI (kg/m²)</RNText>
        </View>
      </View>
      
      {/* Legend */}
      <View style={styles.legendContainer}>
        {categories.map((cat, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
            <RNText style={styles.legendCategory}>{cat.category}</RNText>
            <RNText style={styles.legendRange}>{cat.range}</RNText>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 10,
    width: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // This pushes items to the edges
    marginBottom: 10,
    width: '100%', // Make sure it spans the full width
    paddingHorizontal: 10, // Add some horizontal padding
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  gaugeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bmiValueContainer: {
    alignItems: 'center',
    marginTop: -15,
  },
  bmiValueText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  bmiUnitText: {
    fontSize: 12,
    color: '#666666',
  },
  legendContainer: {
    marginTop: 20,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendCategory: {
    flex: 1,
    fontSize: 12,
  },
  legendRange: {
    fontSize: 12,
    color: '#666666',
    width: 120,
    textAlign: 'right',
  },
});

export default BMIGauge;