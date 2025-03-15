import React from 'react';
import { View, Text, StyleSheet, Image, useColorScheme } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const MealDetailScreen = () => {
  // Get the current color scheme ('light' or 'dark')
  const colorScheme = useColorScheme();

  // Use useLocalSearchParams to get product params
  const params = useLocalSearchParams();
  const product = params.product;

  console.log("Received params:", params);
  console.log("Product string:", product);

  // Parse the product data
  const productData = product ? JSON.parse(product) : {};

  if (!productData || Object.keys(productData).length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.text, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
          No product details available.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
        {productData.name}
      </Text>
      {productData.image_url && <Image source={{ uri: productData.image_url }} style={styles.image} />}
      <Text style={[styles.text, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
        Calories: {productData.energy} kcal
      </Text>
      <Text style={[styles.text, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
        Fat: {productData.fats} g
      </Text>
      <Text style={[styles.text, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
        Saturated Fat: {productData.saturatedFat} g
      </Text>
      <Text style={[styles.text, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
        Carbohydrates: {productData.carbs} g
      </Text>
      <Text style={[styles.text, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
        Sugar: {productData.sugar} g
      </Text>
      <Text style={[styles.text, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
        Fiber: {productData.fiber} g
      </Text>
      <Text style={[styles.text, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
        Protein: {productData.protein} g
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
    marginBottom: 10,
  },
});

export default MealDetailScreen;
