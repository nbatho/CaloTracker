import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { addItemToSelectedDate } from "@/components/redux/diarySlice"; 
import { Ionicons } from "@expo/vector-icons";


const SearchScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { section } = route.params || {};
  const [searchQuery, setSearchQuery] = useState("");


  return (
    <View style={styles.container}>
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchBar}
            placeholder="Search food..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={() => navigation.navigate("Camera")}> 
            <Ionicons name="barcode" size={24} color="#888" style={styles.barcodeIcon} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => { /* Add search action if needed */ }} style={styles.outsideSearchButton}> 
          <Ionicons name="search" size={24} color="#888" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", backgroundColor: "#f0f0f0", paddingTop: 20 },
  searchWrapper: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "90%", marginBottom: 10 },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "white", borderRadius: 10, borderWidth: 1, borderColor: "#ccc", flex: 1, paddingHorizontal: 10 },
  searchIcon: { marginRight: 10 },
  barcodeIcon: { marginLeft: 10 },
  searchBar: { flex: 1, padding: 10 },
  outsideSearchButton: { marginLeft: 10, padding: 10, backgroundColor: "white", borderRadius: 10, borderWidth: 1, borderColor: "#ccc" },
  itemButton: { padding: 15, backgroundColor: "#007bff", marginVertical: 5, borderRadius: 10, width: 200, alignItems: "center" },
  itemText: { color: "white", fontSize: 18 }
});

export default SearchScreen;
