import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, ActivityIndicator, Platform, StyleSheet, 
  useColorScheme, Dimensions, TouchableOpacity, ScrollView, 
  KeyboardAvoidingView, Modal , Image
} from 'react-native';
import { useDispatch, useSelector, Provider } from 'react-redux';
import { deleteItemFromSection, loadSelectedDateSectionsData } from '@/components/redux/diarySlice';
import { Calendar } from 'react-native-calendars';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
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

  useFocusEffect(
    useCallback(() => {
      const checkAndUpdateDate = async () => {
        const storedDate = await AsyncStorage.getItem('selectedDate');
        const today = getTodayDate();
  
        if (route.params?.fromSearch) {
          console.log("Trở về từ Search, giữ nguyên ngày:", storedDate);
          return;
        }
  
        if (storedDate !== today) {
          console.log("Chuyển từ tab khác, reset về hôm nay");
          setSelectedDate(today);
          await AsyncStorage.setItem('selectedDate', today);
          dispatch(loadSelectedDateSectionsData()); // Chỉ gọi khi ngày thay đổi
        }
      };
  
      checkAndUpdateDate();
    }, [dispatch, route.params])
  );

  useEffect(() => {
    const updateStoredDate = async () => {
      await AsyncStorage.setItem('selectedDate', selectedDate);
      dispatch(loadSelectedDateSectionsData()); 
    };
    updateStoredDate();
  }, [selectedDate, dispatch]);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const handleAddItem = (section) => {
    if (section === "Activity") {
      navigation.navigate("Data"); // Chuyển hướng đến màn hình AI nếu là Activity
    } else {
      navigation.navigate("Search", { section, selectedDate, fromDiary: true });
    }
  };
  const deleteItem = () => {
    dispatch(deleteItemFromSection({ section: selectedSection, item: selectedItem }));
    setModalVisible(false);
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
                  {selectedDateSectionsData[section].map((item, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      style={styles.dataItem} 
                      onLongPress={() => {
                        setSelectedItem(item);
                        setSelectedSection(section);
                        setModalVisible(true);
                      }}
                    >
                      {item.image_url ? (
                        <Image 
                          source={{ uri: item.image_url }} 
                          style={styles.foodImage} 
                          onError={(error) => console.log("❌ Image Load Error:", error.nativeEvent)}
                        />
                      ) : (
                        <Text style={{ color: textColor }}>{item.name}</Text>
                      )}
                    </TouchableOpacity>
                  ))}

                  {selectedDateSectionsData[section].length < 3 && (
                    <TouchableOpacity style={styles.plusButton} onPress={() => handleAddItem(section)}>
                      <Text style={[styles.plus, { color: textColor }]}>+</Text>
                    </TouchableOpacity>
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
  modalButtons: { flexDirection: 'row', marginTop: 10 },
  modalButton: { padding: 10, margin: 5, borderRadius: 5, alignItems: 'center', width: 80 },
  foodImage: {
    width: 75,
    height: 75,
    borderRadius: 10,
    resizeMode: 'cover'
  }
});

export function WrappedDiaryScreen() {
  return <Provider store={store}><DiaryScreen /></Provider>;
}
