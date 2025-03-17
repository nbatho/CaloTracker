import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Modal, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { loadTodaySectionsData, addItemToSelectedDate, deleteItemFromSection } from '@/components/redux/diarySlice';
import RingProgress from '../../components/RingProgress';

export default function HomeScreen() {
  const dispatch = useDispatch();
  const theme = useColorScheme();
  const isDarkMode = theme === 'dark';

  // Lấy dữ liệu từ Redux Store
  const todaySelection = useSelector(state => state.diary.selectedDateSectionsData);

  // State để hiển thị modal xác nhận xóa
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Load dữ liệu ngày hôm nay khi màn hình mở
  useEffect(() => {
    dispatch(loadTodaySectionsData());
  }, [dispatch]);

  // Thêm mục vào Redux store
  const addItem = (section) => {
    dispatch(addItemToSelectedDate({ section, item: `Item ${todaySelection[section].length + 1}` }));
  };

  // Xóa mục khỏi Redux store
  const deleteItem = () => {
    dispatch(deleteItemFromSection({ section: selectedSection, item: selectedItem }));
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={{ marginBottom: 20 }}>
          <RingProgress progress={100} size={200} strokeWidth={15} kcalLeft={2137} />
        </View>

        {Object.keys(todaySelection).map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? 'white' : 'black' }]}>
              <FontAwesome5 name={
                section === "Activity" ? "running" :
                section === "Breakfast" ? "bread-slice" :
                section === "Lunch" ? "hamburger" :
                section === "Dinner" ? "utensils" : "cookie"
              } size={16} color={isDarkMode ? 'white' : 'black'} />{" "}
              {section}
            </Text>

            <View style={styles.dataContainer}>
              {todaySelection[section].map((item, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={styles.dataItem}
                  onLongPress={() => {
                    setSelectedItem(item);
                    setSelectedSection(section);
                    setModalVisible(true);
                  }}
                >
                  <Text style={{ color: isDarkMode ? 'white' : 'black' }}>{item}</Text>
                </TouchableOpacity>
              ))}

              {todaySelection[section].length < 3 && (
                <TouchableOpacity style={styles.dataItem} onPress={() => addItem(section)}>
                  <Text style={[styles.plus, { color: isDarkMode ? 'white' : 'black' }]}>+</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal xác nhận xóa */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  scrollContainer: { paddingBottom: 100 },
  section: { padding: 15, borderRadius: 10, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  dataContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  dataItem: { 
    width: 80, height: 80, borderRadius: 10, borderWidth: 1, 
    borderColor: 'gray', alignItems: 'center', justifyContent: 'center', marginRight: 10 
  },
  plus: { fontSize: 30, fontWeight: 'bold' },
  modalContainer: { 
    flex: 1, justifyContent: 'center', alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  modalContent: { 
    width: 250, backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' 
  },
  modalButtons: { flexDirection: 'row', marginTop: 10 },
  modalButton: { padding: 10, margin: 5, borderRadius: 5, alignItems: 'center', width: 80 },
});

