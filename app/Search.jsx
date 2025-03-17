import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { addItemToSelectedDate } from "@/components/redux/diarySlice"; 

const FOOD_ITEMS = ["Apple", "Banana", "Chicken", "Rice", "Salad"]; 

const SearchScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { section } = route.params || {};

  const addItem = (item) => {
    dispatch(addItemToSelectedDate({ section, item }));
    navigation.goBack(); // ✅ Quay lại ngay, Redux sẽ tự cập nhật
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Choose an item for {section}</Text>
      <FlatList
        data={FOOD_ITEMS}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.itemButton} onPress={() => addItem(item)}>
            <Text style={styles.itemText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f0f0f0" },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  itemButton: { padding: 15, backgroundColor: "#007bff", marginVertical: 5, borderRadius: 10, width: 200, alignItems: "center" },
  itemText: { color: "white", fontSize: 18 }
});

export default SearchScreen;
