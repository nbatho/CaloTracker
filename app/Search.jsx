import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { addItemToSelectedDate } from "@/components/redux/diarySlice"; 
import { Ionicons } from "@expo/vector-icons";

const SearchScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Nhận section từ params để biết sản phẩm sẽ thêm vào đâu
  const { section } = route.params || {};
  const [searchQuery, setSearchQuery] = useState("");
  
  // Nhận productData nếu có (sau khi quét mã vạch)
  const productData = route.params?.product ? JSON.parse(route.params.product) : null;
  // console.log("Received productData:", productData);

  // Khi nhấn Add, thêm sản phẩm vào Redux store và quay về HomeScreen
  const handleAddProduct = () => {
    if (productData && section) {
      dispatch(addItemToSelectedDate({ section, item: productData }));
      navigation.navigate("/"); // Quay lại màn hình chính
    }
  };

  return (
    <View style={styles.container}>
      {/* Thanh tìm kiếm */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchBar}
            placeholder="Search food..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {/* Nút mở Camera */}
          <TouchableOpacity onPress={() => navigation.navigate("Camera")}> 
            <Ionicons name="barcode" size={24} color="#888" style={styles.barcodeIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hiển thị sản phẩm nếu có */}
      {productData && (
        <View style={styles.productContainer}>
          {productData.image_url && (
            <Image source={{ uri: productData.image_url }} style={styles.productImage} />
          )}
          <Text style={styles.productName}>{productData.name}</Text>
          <Text style={styles.productInfo}>Calories: {productData.energy} kcal</Text>
          
          {/* Nút Add */}
          <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
            <Text style={styles.addButtonText}>Add to {section}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", backgroundColor: "#f0f0f0", paddingTop: 20 },
  searchWrapper: { flexDirection: "row", alignItems: "center", width: "90%", marginBottom: 10 },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "white", borderRadius: 10, borderWidth: 1, borderColor: "#ccc", flex: 1, paddingHorizontal: 10 },
  searchIcon: { marginRight: 10 },
  barcodeIcon: { marginLeft: 10 },
  searchBar: { flex: 1, padding: 10 },
  productContainer: { alignItems: "center", marginTop: 20, padding: 20, backgroundColor: "white", borderRadius: 10 },
  productImage: { width: 100, height: 100, resizeMode: "contain", marginBottom: 10 },
  productName: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  productInfo: { fontSize: 16, color: "#666" },
  addButton: { marginTop: 20, padding: 15, backgroundColor: "#007bff", borderRadius: 10, width: 200, alignItems: "center" },
  addButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});

export default SearchScreen;
