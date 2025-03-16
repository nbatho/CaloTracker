import React, { useEffect, useState } from 'react';
import { 
  View, Text, ActivityIndicator, Platform, StyleSheet, 
  useColorScheme, Dimensions, TouchableOpacity, ScrollView, 
  KeyboardAvoidingView, Modal 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addItemToSection, deleteItemFromSection } from '@/components/redux/diarySlice';
import { loadCalendars } from '@/components/redux/diarySlice';
import { Calendar } from 'react-native-calendars';
import { FontAwesome5 } from '@expo/vector-icons';
import { Provider } from 'react-redux';
import store from '@/components/redux/store';

const { height, width } = Dimensions.get('window');

export default function DiaryScreen() {
  const dispatch = useDispatch();
  const { loading, error, sectionsData } = useSelector((state) => state.diary); // Get sectionsData from Redux
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const getTodayDate = () => new Date().toISOString().split('T')[0]; 

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  useEffect(() => {
    dispatch(loadCalendars());
  }, [dispatch]);

  const backgroundColor = isDarkMode ? '#121212' : '#fff';
  const textColor = isDarkMode ? '#ffffff' : '#000000';

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  // 🔹 Add item to section
  const addItem = (section) => {
    dispatch(addItemToSection({ section, item: `Item ${sectionsData[section].length + 1}` }));
  };

  // 🔹 Delete item from section
  const deleteItem = () => {
    dispatch(deleteItemFromSection({ section: selectedSection, item: selectedItem }));
    setModalVisible(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={textColor} />
        ) : error ? (
          <Text style={[styles.error, { color: textColor }]}>{error}</Text>
        ) : (
          <>
            <View style={styles.calendarWrapper}>
              <Calendar
                style={[styles.calendar]}
                theme={{
                  calendarBackground: backgroundColor,
                  textSectionTitleColor: textColor,
                  dayTextColor: textColor,
                  todayTextColor: isDarkMode ? '#ff8c00' : '#ff4500',
                  selectedDayBackgroundColor: isDarkMode ? '#555' : '#007bff',
                  selectedDayTextColor: '#ffffff',
                  monthTextColor: textColor,
                  arrowColor: textColor,
                }}
                onDayPress={handleDayPress}
                markedDates={{ [selectedDate]: { selected: true, selectedColor: 'blue' } }}
              />
            </View>

            <View style={styles.selectedDateContainer}>
              <Text style={[styles.selectedDateText, { color: textColor }]}>
                Selected Date: {new Date(selectedDate).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric'
                })}
              </Text>
            </View>

            {/* 🔹 Display sectionsData with Add/Delete */}
            {Object.keys(sectionsData).map((section, index) => (
              <View key={index} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                  <FontAwesome5 name={
                    section === "Activity" ? "running" :
                    section === "Breakfast" ? "bread-slice" :
                    section === "Lunch" ? "hamburger" :
                    section === "Dinner" ? "utensils" : "cookie"
                  } size={16} color={textColor} /> {" "}
                  {section}
                </Text>

                <View style={styles.dataContainer}>
                  {sectionsData[section].map((item, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      style={styles.dataItem} 
                      onLongPress={() => {
                        setSelectedItem(item);
                        setSelectedSection(section);
                        setModalVisible(true);
                      }}
                    >
                      <Text style={{ color: textColor }}>{item}</Text>
                    </TouchableOpacity>
                  ))}

                  {/* 🔹 + Button to Add Items */}
                  {sectionsData[section].length < 3 && (
                    <TouchableOpacity style={styles.plusButton} onPress={() => addItem(section)}>
                      <Text style={[styles.plus, { color: textColor }]}>+</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* 🔹 Delete Confirmation Modal */}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  calendarWrapper: {
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendar: {
    width: width * 0.95,
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  selectedDateContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    alignSelf: 'center',
    width: width * 0.9,
    alignItems: 'center',
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    marginVertical: 8,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  dataItem: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'gray',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: 'transparent',
  },
  plusButton: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'gray',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 250,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  modalButton: {
    padding: 10,
    margin: 5,
    borderRadius: 5,
    alignItems: 'center',
    width: 80,
  },
});

export function WrappedDiaryScreen() {
  return (
    <Provider store={store}>
      <DiaryScreen />
    </Provider>
  );
}
