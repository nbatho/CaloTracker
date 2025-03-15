import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Platform, StyleSheet, useColorScheme, Dimensions, TouchableOpacity, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createSlice, createAsyncThunk, configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { Calendar } from 'react-native-calendars';
import * as CalendarAPI from 'expo-calendar';
import { FontAwesome5 } from '@expo/vector-icons';

const { height, width } = Dimensions.get('window');

export const loadCalendars = createAsyncThunk('diary/loadCalendars', async () => {
  const { status } = await CalendarAPI.requestCalendarPermissionsAsync();
  if (status !== 'granted') throw new Error('Calendar permission denied');

  const calendars = await CalendarAPI.getCalendarsAsync(CalendarAPI.EntityTypes.EVENT);
  return calendars;
});

const diarySlice = createSlice({
  name: 'diary',
  initialState: { calendars: [], loading: false, error: null },
  reducers: {
    resetActivities: (state) => {
      state.activities = {}; // Reset activities when a new day starts
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCalendars.pending, (state) => { state.loading = true; })
      .addCase(loadCalendars.fulfilled, (state, action) => {
        state.loading = false;
        state.calendars = action.payload;
      })
      .addCase(loadCalendars.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

const { resetActivities } = diarySlice.actions;
const store = configureStore({ reducer: { diary: diarySlice.reducer } });

export default function DiaryScreen() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.diary);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // ✅ Default selected day is today
  const today = new Date().toISOString().split('T')[0]; 
  const [selectedDate, setSelectedDate] = useState(today);
  const [lastUpdatedDate, setLastUpdatedDate] = useState(today); // To track last updated date

  useEffect(() => {
    dispatch(loadCalendars());

    // ✅ Reset data when the date changes
    if (lastUpdatedDate !== today) {
      dispatch(resetActivities());
      setLastUpdatedDate(today);
    }
  }, [dispatch, today, lastUpdatedDate]);

  const backgroundColor = isDarkMode ? '#121212' : '#fff';
  const textColor = isDarkMode ? '#ffffff' : '#000000';

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
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
                calendarBackground: isDarkMode ? '#121212' : '#ffffff', 
                textSectionTitleColor: isDarkMode ? '#ffffff' : '#000000', 
                dayTextColor: isDarkMode ? '#ffffff' : '#000000', 
                todayTextColor: isDarkMode ? '#ff8c00' : '#ff4500',
                selectedDayBackgroundColor: isDarkMode ? '#555' : '#007bff',
                selectedDayTextColor: '#ffffff',
                monthTextColor: isDarkMode ? '#ffffff' : '#000000', 
                arrowColor: isDarkMode ? '#ffffff' : '#000000', 
              }}
              onDayPress={handleDayPress}
              markedDates={{ [selectedDate]: { selected: true, selectedColor: 'blue' } }}
            />

            </View>

            {/* ✅ Selected Date Display */}
            <View style={[styles.selectedDateContainer, { backgroundColor: isDarkMode ? '#161616' : '#E0E0E0' }]}>
              <Text style={[styles.selectedDateText, { color: textColor }]}>
                Selected Date: {new Date(selectedDate).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric'
                })}
              </Text>
            </View>

            <View style={styles.sectionsContainer}>
              {["Activity", "Breakfast", "Lunch", "Dinner", "Snack"].map((section, index) => (
                <View key={index} style={[styles.section, { backgroundColor: isDarkMode ? '#161616' : '#E0E0E0' }]}>
                  <Text style={[styles.sectionTitle, { color: isDarkMode ? 'white' : 'black' }]}>
                    {section === "Activity" && <FontAwesome5 name="running" size={16} color={isDarkMode ? 'white' : 'black'} />}
                    {section === "Breakfast" && <FontAwesome5 name="bread-slice" size={16} color={isDarkMode ? 'white' : 'black'} />}
                    {section === "Lunch" && <FontAwesome5 name="hamburger" size={16} color={isDarkMode ? 'white' : 'black'} />}
                    {section === "Dinner" && <FontAwesome5 name="utensils" size={16} color={isDarkMode ? 'white' : 'black'} />}
                    {section === "Snack" && <FontAwesome5 name="cookie" size={16} color={isDarkMode ? 'white' : 'black'} />}
                    {"  "}{section}
                  </Text>
                  <TouchableOpacity style={styles.addButton} onPress={() => console.log(`Add item to ${section}`)}>
                    <Text style={styles.plus}>+</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
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
  sectionsContainer: {
    width: width * 0.95,
    alignSelf: 'center',
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plus: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  error: {
    textAlign: 'center',
    marginTop: 20,
  },
});

export function WrappedDiaryScreen() {
  return (
    <Provider store={store}>
      <DiaryScreen />
    </Provider>
  );
}
