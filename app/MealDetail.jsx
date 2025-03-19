import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router'; // ✅ Import router

const MealDetailScreen = () => {
  const colorScheme = useColorScheme();
  const params = useLocalSearchParams();
  const router = useRouter(); // ✅ Dùng router thay vì navigation
  const product = params.product;

  // console.log("Received params:", params);
  // console.log("Product string:", product);

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

  const handleAdd = () => {
    // console.log("Data from MealDetail:", productData);
    router.push({
      pathname: "/",
      params: { product: JSON.stringify(productData) }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>{productData.name}</Text>
      {productData.image_url && <Image source={{ uri: productData.image_url }} style={styles.image} />}
      <Text style={[styles.text, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
        Calories: {productData.energy || '0.0'} kcal/ {productData.quantity}
      </Text>
      <Text style={[styles.text, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>Fat: {productData.fat || '0.0'} g</Text>
      <Text style={[styles.text, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
        Carbohydrates: {productData.carbohydrates || '0.0'} g
      </Text>
      <Text style={[styles.text, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>Protein: {productData.proteins || '0.0'} g</Text>

      <Text style={[styles.text, styles.sectionTitle, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
        Nutrition Information
      </Text>
      <View style={styles.table}>
        {[
          { label: "Energy", value: `${productData.energy_100g || '0.0'} kcal` },
          { label: "Fat", value: `${productData.fat_100g || '0.0'} g` },
          { label: "Saturated Fat", value: `${productData.saturatedFat || '0.0'} g` },
          { label: "Carbohydrate", value: `${productData.carbohydrates_100g || '0.0'} g` },
          { label: "Sugar", value: `${productData.sugars_100g || '0.0'} g` },
          { label: "Fiber", value: `${productData.fiber || '0.0'} g` },
          { label: "Protein", value: `${productData.proteins_100g || '0.0'} g` },
        ].map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={[styles.cell, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>{item.label}</Text>
            <View style={styles.separator} />
            <Text style={[styles.cell, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Nút Add */}
      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
    marginBottom: 10,
  },
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  cell: {
    fontSize: 16,
    flex: 1,
    textAlign: "center",
  },
  separator: {
    width: 1,
    backgroundColor: "#ccc",
    height: "100%",
    marginHorizontal: 10,
  },
  addButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#007bff",
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  addButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});

export default MealDetailScreen;