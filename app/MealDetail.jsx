import React from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  useColorScheme, ScrollView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const MealDetailScreen = () => {
  const colorScheme = useColorScheme();
  const params = useLocalSearchParams();
  const router = useRouter();
  const product = params.product;
  const productData = product ? JSON.parse(product) : {};

  const isDarkMode = colorScheme === 'dark';

  // Theme Variables
  const backgroundColor = isDarkMode ? '#121212' : '#F5F5F5'; // Main background
  const textColor = isDarkMode ? '#FFFFFF' : '#212121';
  const secondaryTextColor = isDarkMode ? '#BDBDBD' : '#757575';
  const borderColor = isDarkMode ? '#555555' : '#CCCCCC';
  const cardBackground = isDarkMode ? '#333333' : '#FFFFFF';
  const buttonBackground = isDarkMode ? '#BB86FC' : '#BB86FC'; // Primary button
  const buttonText = isDarkMode ? '#212121' : '#FFFFFF';
  const shadowColor = isDarkMode ? "#FFFFFF" : "#000"; // Shadow color

  if (!productData || Object.keys(productData).length === 0) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={[styles.text, { color: textColor }]}>
          No product details available.
        </Text>
      </View>
    );
  }

  const handleAdd = () => {
    router.push({
      pathname: "/",
      params: { product: JSON.stringify(productData) }
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: backgroundColor }]}>
      <View style={[styles.card, { backgroundColor: cardBackground, shadowColor: shadowColor, elevation: 3 }]}>
        <Text style={[styles.title, { color: textColor }]}>{productData.name}</Text>
        {productData.image_url && (
          <Image
            source={{ uri: productData.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        <View style={styles.nutritionContainer}>
          <Text style={[styles.text, { color: textColor }]}>
            Calories: {productData.energy || '0.0'} kcal / {productData.quantity}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>Fat: {productData.fat || '0.0'} g</Text>
          <Text style={[styles.text, { color: textColor }]}>
            Carbohydrates: {productData.carbohydrates || '0.0'} g
          </Text>
          <Text style={[styles.text, { color: textColor }]}>Protein: {productData.proteins || '0.0'} g</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Nutrition Information (per 100g)
        </Text>
        <View style={[styles.table, { borderColor: borderColor }]}>
          {[
            { label: "Energy", value: `${productData.energy_100g || '0.0'} kcal` },
            { label: "Fat", value: `${productData.fat_100g || '0.0'} g` },
            { label: "Saturated Fat", value: `${productData.saturatedFat || '0.0'} g` },
            { label: "Carbohydrate", value: `${productData.carbohydrates_100g || '0.0'} g` },
            { label: "Sugar", value: `${productData.sugars_100g || '0.0'} g` },
            { label: "Fiber", value: `${productData.fiber || '0.0'} g` },
            { label: "Protein", value: `${productData.proteins_100g || '0.0'} g` },
          ].map((item, index) => (
            <View key={index} style={[styles.row, { borderBottomColor: borderColor }]}>
              <Text style={[styles.cell, { color: textColor }]}>{item.label}</Text>
              <View style={[styles.separator, { backgroundColor: borderColor }]} />
              <Text style={[styles.cell, { color: textColor }]}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Nút Add */}
        <TouchableOpacity style={[styles.addButton, { backgroundColor: buttonBackground }]} onPress={handleAdd}>
          <Text style={[styles.addButtonText, { color: buttonText }]}>Add</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: 'center',
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    marginBottom: 15,
  },
  nutritionContainer: {
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    marginVertical: 4,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  cell: {
    fontSize: 16,
    flex: 1,
    textAlign: "center",
  },
  separator: {
    width: 1,
    height: "100%",
    marginHorizontal: 10,
  },
  addButton: {
    marginTop: 25,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default MealDetailScreen;