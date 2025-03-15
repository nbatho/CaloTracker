// Camera.jsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, ActivityIndicator } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { useRouter } from "expo-router";

const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getCameraPermissions();
  }, []);

  const fetchProductDetails = async (barcode) => {
    setLoading(true);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json?lc=en`);
      const data = await response.json();

      if (data.status === 1) {
        const productData = {
          name: data.product.product_name || "No English name available",
          calories: data.product.nutriments?.["energy-kcal"] || "N/A",
          protein: data.product.nutriments?.proteins || "N/A",
          carbs: data.product.nutriments?.carbohydrates || "N/A",
          fats: data.product.nutriments?.fat || "N/A",
          image_url: data.product.image_url || null,
          energy: data.product.nutriments?.["energy-kcal"] || "N/A",
          saturatedFat: data.product.nutriments?.["saturated-fat"] || "N/A",
          sugar: data.product.nutriments?.sugars || "N/A",
          fiber: data.product.nutriments?.fiber || "N/A",
        };

        // Pass product data to the MealDetailScreen via query
        router.push({
            pathname: "MealDetail",
            params: { product: JSON.stringify(productData) },
        });
        console.log("Sending product data:", JSON.stringify(productData));
      } else {
        alert("Product not found in Open Food Facts database.");
      }
    } catch (error) {
      alert("Error fetching product data.");
    }
    setLoading(false);
  };

  const handleBarcodeScanned = ({ type, data }) => {
    setScanned(true);
    fetchProductDetails(data);
  };

  if (hasPermission === null) return <Text>Requesting for camera permission</Text>;
  if (hasPermission === false) return <Text>No access to camera</Text>;

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "qr"],
        }}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />
      )}
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});

// Default export the CameraScreen component
export default CameraScreen;
