// DiaryScreen.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ActivityIndicator, Platform, StyleSheet,
  useColorScheme, Dimensions, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Modal, Image
} from 'react-native';
import { useDispatch, useSelector, Provider } from 'react-redux';
import { deleteItemFromSection, loadSelectedDateSectionsData } from '@/components/redux/diarySlice';
import { Calendar } from 'react-native-calendars';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation, useRoute, useNavigationState  } from '@react-navigation/native';
import store from '@/components/redux/store';

const { height, width } = Dimensions.get('window');

const getTodayDate = () => new Date().toISOString().split('T')[0];

export default function DiaryScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  const { loading, error, selectedDateSectionsData } = useSelector((state) => state.diary);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const navigationState = useNavigationState((state) => state);
  useEffect(() => {
    if (!navigationState) return;

    const currentRoute = navigationState.routes[navigationState.index].name;
    if (currentRoute !== "Diary") {
      // console.log(" Rời khỏi Diary, reset về ngày hôm nay");
      setSelectedDate(getTodayDate());
      AsyncStorage.setItem('selectedDate', getTodayDate());
    }
  }, [navigationState]);

  // Khi Diary được focus -> Tải dữ liệu ngày hiện tại
  useFocusEffect(
    useCallback(() => {
      const loadDiaryData = async () => {
        const today = getTodayDate();
        const storedDate = await AsyncStorage.getItem('selectedDate');

        if (storedDate !== today) {
          // console.log(" Diary được mở, cập nhật ngày hiện tại");
          setSelectedDate(today);
          await AsyncStorage.setItem('selectedDate', today);
        }

        dispatch(loadSelectedDateSectionsData());
      };

      loadDiaryData();
    }, [dispatch])
  );

  const handleDayPress = async (day) => {
    setSelectedDate(day.dateString);
    await AsyncStorage.setItem('selectedDate', day.dateString);
    dispatch(loadSelectedDateSectionsData());
  };

  const deleteItem = () => {
    dispatch(deleteItemFromSection({ section: selectedSection, item: selectedItem }));
    setModalVisible(false);
  };

  const renderItemContent = (section, item, isDarkMode) => {
    if (section === "Activity") {
      return (
        <View style={{ alignItems: 'center' }}>
          <FontAwesome5 name={item.icon} size={30} color={isDarkMode ? 'white' : 'black'} />
          <Text style={{ color: isDarkMode ? 'white' : 'black', fontSize: 12 }}>{item.name}</Text>
        </View>
      );
    } else if (item.image_url) {
      return (
        <Image
          source={{ uri: item.image_url }}
          style={styles.foodImage}
          onError={(error) => console.log(" Image Load Error:", error.nativeEvent)}
        />
      );
    } else {
      return (
        <Text style={{ color: isDarkMode ? 'white' : 'black' }}>{item.name}</Text>
      );
    }
  };

  const backgroundColor = isDarkMode ? '#121212' : '#fff';
  const textColor = isDarkMode ? '#ffffff' : '#000000';

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
                style={styles.calendar}
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

            {Object.keys(selectedDateSectionsData).map((section, index) => (
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
                  {selectedDateSectionsData[section].length > 0 ? (
                    selectedDateSectionsData[section].map((item, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.dataItem}
                        onLongPress={() => {
                          setSelectedItem(item);
                          setSelectedSection(section);
                          setModalVisible(true);
                        }}
                      >
                        {renderItemContent(section, item, isDarkMode)}
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.dataItem}>
                    <Text style={[styles.noDataText, { color: isDarkMode ? 'white' : 'black' }]}>
                      No Data
                    </Text>
                  </View>
                  )}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{ color: 'black', fontSize: 16, marginBottom: 10 }}>
              Do you want to delete "{selectedItem?.name}"?
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
  container: { flexGrow: 1, paddingBottom: 20 },
  calendarWrapper: { height: height * 0.4, justifyContent: 'center', alignItems: 'center' },
  calendar: { width: width * 0.95, borderRadius: 10, overflow: 'hidden', alignSelf: 'center' },
  selectedDateContainer: { marginTop: 10, padding: 10, borderRadius: 8, alignSelf: 'center', width: width * 0.9, alignItems: 'center' },
  selectedDateText: { fontSize: 18, fontWeight: 'bold' },
  section: { marginVertical: 8, padding: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
  dataContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  dataItem: { width: 80, height: 80, borderRadius: 10, borderWidth: 1, borderColor: 'gray', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  plusButton: { width: 80, height: 80, borderRadius: 10, borderWidth: 1, borderColor: 'gray', alignItems: 'center', justifyContent: 'center' },
  plus: { fontSize: 30, fontWeight: 'bold' },
  modalContent: {
    width: 250, backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center'
  },
  modalContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalButtons: { flexDirection: 'row', marginTop: 10 },
  modalButton: { padding: 10, margin: 5, borderRadius: 5, alignItems: 'center', width: 80 },
  foodImage: {
    width: 75,
    height: 75,
    borderRadius: 10,
    resizeMode: 'cover'
  },
  noDataText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export function WrappedDiaryScreen() {
  return <Provider store={store}><DiaryScreen /></Provider>;
}