// diary.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ActivityIndicator, Platform, StyleSheet,
  useColorScheme, Dimensions, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Modal, Image
} from 'react-native';
import { useDispatch, useSelector, Provider } from 'react-redux';
import { deleteItemFromSection, loadSelectedDateSectionsData } from '@/components/redux/diarySlice';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation, useRoute, useNavigationState } from '@react-navigation/native';
import store from '@/components/redux/store';
import CompactCalendar from '@/components/redux/CompactCalendar'; // Import CompactCalendar

const { height, width } = Dimensions.get('window');

const getTodayDate = () => new Date().toISOString().split('T')[0];

// Bảng màu
const lightColors = {
  primary: '#6200EE',
  background: '#F5F5F5',
  text: '#212121',
  secondaryText: '#757575',
  accent: '#03DAC5',
  surface: '#FFFFFF',
  error: '#B00020',
  card: '#FFFFFF',
  shadow: '#000',
  border: '#CCCCCC', // Thêm màu border cho light mode
};

const darkColors = {
  primary: '#BB86FC',
  background: '#121212',
  text: '#FFFFFF',
  secondaryText: '#BDBDBD',
  accent: '#03DAC5',
  surface: '#212121',
  error: '#CF6679',
  card: '#333333',
  shadow: '#FFFFFF',
  border: '#555555', // Thêm màu border cho dark mode
};

export default function DiaryScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  const { loading, error, selectedDateSectionsData } = useSelector((state) => state.diary);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = isDarkMode ? darkColors : lightColors;

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const navigationState = useNavigationState((state) => state);

  useEffect(() => {
    if (!navigationState) return;

    const currentRoute = navigationState.routes[navigationState.index].name;
    if (currentRoute !== "Diary") {
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

  const renderItemContent = (section, item) => {
    if (section === "Activity") {
      return (
        <View style={{ alignItems: 'center' }}>
          <FontAwesome5 name={item.icon} size={24} color={colors.text} />
          <Text style={[styles.itemText, { color: colors.text }]}>{item.name}</Text>
        </View>
      );
    } else if (item.image_url) {
      return (
        <Image
          source={{ uri: item.image_url }}
          style={styles.foodImage}
          onError={(error) => console.log("Image Load Error:", error.nativeEvent)}
        />
      );
    } else {
      return (
        <Text style={[styles.itemText, { color: colors.text }]}>{item.name}</Text>
      );
    }
  };

  const calendarTheme = {
    calendarBackground: colors.background,
    textSectionTitleColor: colors.text,
    dayTextColor: colors.text,
    todayTextColor: colors.primary,
    selectedDayBackgroundColor: colors.primary,
    selectedDayTextColor: lightColors.surface,
    monthTextColor: colors.text,
    arrowColor: colors.text,
    textDisabledColor: colors.secondaryText,
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.text} />
        ) : error ? (
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        ) : (
          <>
            <View style={[styles.calendarWrapper, { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }]}>
              <CompactCalendar
                selectedDate={selectedDate}
                onDayPress={handleDayPress}
                theme={calendarTheme}
                isDarkMode={isDarkMode}
              />
            </View>

            <View style={[styles.selectedDateContainer, { backgroundColor: colors.card, shadowColor: colors.shadow, elevation: 3 }]}>
              <Text style={[styles.selectedDateText, { color: colors.text }]}>
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric'
                })}
              </Text>
            </View>

            {Object.keys(selectedDateSectionsData).map((section, index) => (
              <View key={index} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  <FontAwesome5 name={
                    section === "Activity" ? "running" :
                      section === "Breakfast" ? "bread-slice" :
                        section === "Lunch" ? "hamburger" :
                          section === "Dinner" ? "utensils" : "cookie"
                  } size={16} color={colors.text} /> {" "}
                  {section}
                </Text>

                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.dataContainer}>
                  {selectedDateSectionsData[section].length > 0 ? (
                    selectedDateSectionsData[section].map((item, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.dataItem, { backgroundColor: colors.card, shadowColor: colors.shadow, elevation: 2 }]}
                        onLongPress={() => {
                          setSelectedItem(item);
                          setSelectedSection(section);
                          setModalVisible(true);
                        }}
                      >
                        {renderItemContent(section, item)}
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={[styles.dataItem, { backgroundColor: colors.card }]}>
                      <Text style={[styles.noDataText, { color: colors.secondaryText }]}>
                        No Data
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, shadowColor: colors.shadow, elevation: 5 }]}>
            <Text style={[styles.modalText, { color: colors.text }]}>
              Delete "{selectedItem?.name}"?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.modalButton, { backgroundColor: colors.card }]}>
                <Text style={{ color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={deleteItem} style={[styles.modalButton, { backgroundColor: colors.error }]}>
                <Text style={{ color: lightColors.surface }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingBottom: 20, paddingTop: 20, paddingHorizontal: 16 },
  calendarWrapper: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden', // Important for rounded corners to work correctly
    // borderColor: '#ccc',   // Thêm border mặc định
    // borderWidth: 1,
    padding: 5,
  },
  selectedDateContainer: {
    marginTop: 20,
    padding: 12,
    borderRadius: 10,
    alignSelf: 'center',
    width: '90%',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  dataContainer: {
    flexDirection: 'row',
  },
  dataItem: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    padding: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemText: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  foodImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  noDataText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export function WrappedDiaryScreen() {
  return <Provider store={store}><DiaryScreen /></Provider>;
}