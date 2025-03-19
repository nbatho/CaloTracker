import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { useRouter } from "expo-router";

const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanning, setScanning] = useState(true);
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
    // Prevent multiple simultaneous scans
    if (loading) return;
    
    setLoading(true);
    setScanning(false);
    
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json?lc=en`);
      const data = await response.json();
  
      if (data.status === 1) {
        const productData = {
          name: data.product.product_name_en || "No English name available",
          energy: (data.product.nutriments?.["energy-kcal"] || 0.0).toFixed(1),
          energy_100g: (data.product.nutriments?.["energy-kcal_100g"] || 0.0).toFixed(1),
          proteins_100g: (data.product.nutriments?.proteins_100g || 0.0).toFixed(1),
          proteins: (data.product.nutriments?.proteins || 0.0).toFixed(1),
          quantity: data.product.quantity || "Unknown",
          carbohydrates_100g: (data.product.nutriments?.carbohydrates_100g || 0.0).toFixed(1),
          carbohydrates: (data.product.nutriments?.carbohydrates || 0.0).toFixed(1),
          fat: (data.product.nutriments?.fat || 0.0).toFixed(1),
          fat_100g: (data.product.nutriments?.fat_100g || 0.0).toFixed(1),
          image_url: data.product.image_url || null,
          saturatedFat: (data.product.nutriments?.["saturated-fat"] || 0.0).toFixed(1),
          sugars_100g: (data.product.nutriments?.sugars_100g || 0.0).toFixed(1),
          fiber: (data.product.nutriments?.fiber || 0.0).toFixed(1),
        };
  
        // Pass product data to the MealDetailScreen via params
        router.push({
          pathname: "MealDetail",
          params: { product: JSON.stringify(productData) },
        });
        // console.log("Sending product data:", JSON.stringify(productData));
      } else {
        alert("Product not found in Open Food Facts database.");
        // Enable scanning again after showing the alert
        setScanning(true);
      }
    } catch (error) {
      alert("Error fetching product data.");
      // Enable scanning again after showing the alert
      setScanning(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScanned = ({ type, data }) => {
    if (scanning) {
      fetchProductDetails(data);
    }
  };

  if (hasPermission === null) return <Text>Requesting for camera permission</Text>;
  if (hasPermission === false) return <Text>No access to camera</Text>;

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "qr"],
        }}
        style={StyleSheet.absoluteFillObject}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading product data...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
  }
});

export default CameraScreen;