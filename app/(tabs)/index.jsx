import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Modal, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import RingProgress from '../../components/RingProgress';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { addItemToSection, deleteItemFromSection } from '@/components/redux/diarySlice';

export default function HomeScreen() {
  const theme = useColorScheme();
  const isDarkMode = theme === 'dark';
  const navigation = useNavigation();

  const dispatch = useDispatch();
  const sectionsData = useSelector(state => state.diary.sectionsData);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const calculateCalo = 2137;

  const addItem = (section) => {
    dispatch(addItemToSection({ section, item: `Item ${sectionsData[section].length + 1}` }));
  };

  const deleteItem = () => {
    dispatch(deleteItemFromSection({ section: selectedSection, item: selectedItem }));
    setModalVisible(false);
  };

  const handleLongPress = (section, item) => {
    setSelectedItem(item);
    setSelectedSection(section);
    setModalVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Large Main Ring */}
        <View style={{ marginBottom: 20 }}>
          <RingProgress progress={100} size={200} strokeWidth={15} kcalLeft={calculateCalo} />
        </View>

        {/* Nutrition Stats */}
        <View style={styles.nutritionContainer}>
          {["Carbs", "Fat", "Protein"].map((nutrient, index) => (
            <View key={index} style={styles.nutritionItem}>
              <RingProgress progress={0} size={30} strokeWidth={8} />
              <Text style={[styles.nutritionText, { color: isDarkMode ? 'gray' : 'black' }]}>
                0/320 g {nutrient.toLowerCase()}
              </Text>
            </View>
          ))}
        </View>

        {/* Sections */}
        {Object.keys(sectionsData).map((section, index) => (
          <View key={index} style={[styles.section]}>
            {/* Section Title */}
            <Text style={[styles.sectionTitle, { color: isDarkMode ? 'white' : 'black' }]}>
              {section === "Activity" && <FontAwesome5 name="running" size={16} color={isDarkMode ? 'white' : 'black'} />}
              {section === "Breakfast" && <FontAwesome5 name="bread-slice" size={16} color={isDarkMode ? 'white' : 'black'} />}
              {section === "Lunch" && <FontAwesome5 name="hamburger" size={16} color={isDarkMode ? 'white' : 'black'} />}
              {section === "Dinner" && <FontAwesome5 name="utensils" size={16} color={isDarkMode ? 'white' : 'black'} />}
              {section === "Snack" && <FontAwesome5 name="cookie" size={16} color={isDarkMode ? 'white' : 'black'} />}
              {"  "}{section}
            </Text>

            {/* Data Grid */}
            <View style={styles.dataContainer}>
              {sectionsData[section].map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.dataItem}
                  onLongPress={() => handleLongPress(section, item)}
                >
                  <Text style={{ color: isDarkMode ? 'white' : 'black' }}>{item}</Text>
                </TouchableOpacity>
              ))}

              {/* + Button */}
              {sectionsData[section].length < 3 && (
                <TouchableOpacity style={styles.dataItem} onPress={() => addItem(section)}>
                  <Text style={[styles.plus, { color: isDarkMode ? 'white' : 'black' }]}>+</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{ color: 'black', fontSize: 16, marginBottom: 10 }}>
              Do you want to delete "{selectedItem}"?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                <Text style={{ color: 'black' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={deleteItem} style={[styles.modalButton, { backgroundColor: 'red' }]}>
                <Text style={{ color: 'white' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* + Button to Navigate to Camera */}
      <TouchableOpacity
        style={[styles.plusButton, { backgroundColor: isDarkMode ? '#333' : '#ddd' }]}
        onPress={() => navigation.navigate('Camera')}
      >
        <Text style={[styles.plus, { color: isDarkMode ? 'white' : 'black' }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  scrollContainer: { paddingBottom: 100 },
  section: { padding: 15, borderRadius: 10, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  dataContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  dataItem: { width: 80, height: 80, borderRadius: 10, borderWidth: 1, borderColor: 'gray', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  nutritionContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 },
  nutritionItem: { flexDirection: 'row', alignItems: 'center', width: '30%', marginBottom: 10 },
  nutritionText: { fontSize: 14, marginLeft: 8, flexShrink: 1 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: 250, backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' },
  modalButtons: { flexDirection: 'row', marginTop: 10 },
  modalButton: { padding: 10, margin: 5, borderRadius: 5, alignItems: 'center', width: 80 },
  plusButton: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
  plus: { fontSize: 40, fontWeight: 'bold' },
});
