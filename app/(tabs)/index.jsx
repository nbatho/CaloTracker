import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import RingProgress from '../../components/RingProgress';

export default function HomeScreen() {
  const caculateCalo = 2137;
  const theme = useColorScheme(); // Get the current color scheme (light or dark)

  const isDarkMode = theme === 'dark'; // Check if the current theme is dark mode

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }]}>
      {/* Large Main Ring */}
      <View style={{ marginBottom: 20 }}>
        <RingProgress progress={100} size={200} strokeWidth={15} kcalLeft={caculateCalo} />
      </View>

      {/* Nutrition Stats */}
      <View style={styles.nutritionContainer}>
        {/* Carbs */}
        <View style={styles.nutritionItem}>
          <RingProgress progress={0} size={30} strokeWidth={8} />
          <Text style={[styles.nutritionText, { color: isDarkMode ? 'gray' : 'black' }]}> 0/320 g carbs</Text>
        </View>

        {/* Fat */}
        <View style={styles.nutritionItem}>
          <RingProgress progress={0} size={30} strokeWidth={8} />
          <Text style={[styles.nutritionText, { color: isDarkMode ? 'gray' : 'black' }]}> 0/59 g fat</Text>
        </View>

        {/* Protein */}
        <View style={styles.nutritionItem}>
          <RingProgress progress={0} size={30} strokeWidth={8} />
          <Text style={[styles.nutritionText, { color: isDarkMode ? 'gray' : 'black' }]}> 0/80 g protein</Text>
        </View>
      </View>

      {/* Sections */}
      {["Activity", "Breakfast", "Lunch", "Dinner", "Snack"].map((section, index) => (
        <View key={index} style={[styles.section, { backgroundColor: isDarkMode ? '#161616' : '#E0E0E0' }]}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? 'white' : 'black' }]}>
            {section === "Activity" && <FontAwesome5 name="running" size={16} color={isDarkMode ? 'white' : 'black'} />}
            {section === "Breakfast" && <FontAwesome5 name="bread-slice" size={16} color={isDarkMode ? 'white' : 'black'} />}
            {section === "Lunch" && <FontAwesome5 name="hamburger" size={16} color={isDarkMode ? 'white' : 'black'} />}
            {section === "Dinner" && <FontAwesome5 name="utensils" size={16} color={isDarkMode ? 'white' : 'black'} />}
            {section === "Snack" && <FontAwesome5 name="cookie" size={16} color={isDarkMode ? 'white' : 'black'} />}
            {"  "}{section}
          </Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.plus}>+</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Floating Add Button */}
      <TouchableOpacity style={[styles.floatingButton, { backgroundColor: isDarkMode ? 'green' : '#4CAF50' }]}>
        <Text style={styles.plus}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'gray',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  nutritionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '30%',
    marginBottom: 10,
  },
  nutritionText: {
    fontSize: 14,
    marginLeft: 8,
    flexShrink: 1,
  },
});
