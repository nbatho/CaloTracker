import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as CalendarAPI from 'expo-calendar';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🎯 Lấy ngày hiện tại
const getTodayDate = () => new Date().toISOString().split('T')[0];

// 🎯 Load quyền truy cập lịch
export const loadCalendars = createAsyncThunk('diary/loadCalendars', async () => {
  const { status } = await CalendarAPI.requestCalendarPermissionsAsync();
  if (status !== 'granted') throw new Error('Calendar permission denied');

  const calendars = await CalendarAPI.getCalendarsAsync(CalendarAPI.EntityTypes.EVENT);
  return calendars;
});

// 🎯 Load dữ liệu ngày hiện tại
export const loadTodaySectionsData = createAsyncThunk('diary/loadTodaySectionsData', async () => {
  const today = getTodayDate();
  let allSectionsData = await AsyncStorage.getItem('allSectionsData');
  allSectionsData = allSectionsData ? JSON.parse(allSectionsData) : {};

  if (!allSectionsData[today]) {
    allSectionsData[today] = { Activity: [], Breakfast: [], Lunch: [], Dinner: [], Snack: [] };
    await AsyncStorage.setItem('allSectionsData', JSON.stringify(allSectionsData));
  }

  return allSectionsData[today];
});

// 🎯 Load dữ liệu của ngày được chọn
export const loadSelectedDateSectionsData = createAsyncThunk('diary/loadSelectedDateSectionsData', async () => {
  const selectedDate = await AsyncStorage.getItem('selectedDate');
  let allSectionsData = await AsyncStorage.getItem('allSectionsData');
  allSectionsData = allSectionsData ? JSON.parse(allSectionsData) : {};

  if (!allSectionsData[selectedDate]) {
    allSectionsData[selectedDate] = { Activity: [], Breakfast: [], Lunch: [], Dinner: [], Snack: [] };
    await AsyncStorage.setItem('allSectionsData', JSON.stringify(allSectionsData));
  }

  return allSectionsData[selectedDate];
});

// 🎯 Thêm mục vào ngày được chọn
export const addItemToSelectedDate = createAsyncThunk('diary/addItemToSelectedDate', async ({ section, item }, { dispatch }) => {
  const selectedDate = await AsyncStorage.getItem('selectedDate');
  let allSectionsData = await AsyncStorage.getItem('allSectionsData');
  allSectionsData = allSectionsData ? JSON.parse(allSectionsData) : {};

  if (!allSectionsData[selectedDate]) {
    allSectionsData[selectedDate] = { Activity: [], Breakfast: [], Lunch: [], Dinner: [], Snack: [] };
  }

  if (allSectionsData[selectedDate][section].length < 3) {
    allSectionsData[selectedDate][section].push(item);
    await AsyncStorage.setItem('allSectionsData', JSON.stringify(allSectionsData));
    dispatch(loadSelectedDateSectionsData()); // 🔥 Load lại dữ liệu sau khi thêm
    if (selectedDate === getTodayDate()) dispatch(loadTodaySectionsData());
  }
});

// 🎯 Xóa từng mục một khỏi ngày được chọn
export const deleteItemFromSection = createAsyncThunk('diary/deleteItemFromSection', async ({ section, item }, { dispatch }) => {
  const selectedDate = await AsyncStorage.getItem('selectedDate');
  let allSectionsData = await AsyncStorage.getItem('allSectionsData');
  allSectionsData = allSectionsData ? JSON.parse(allSectionsData) : {};

  if (allSectionsData[selectedDate]) {
    const index = allSectionsData[selectedDate][section].findIndex(i => i === item);
    if (index !== -1) {
      allSectionsData[selectedDate][section].splice(index, 1);
      await AsyncStorage.setItem('allSectionsData', JSON.stringify(allSectionsData));
      dispatch(loadSelectedDateSectionsData()); // 🔥 Load lại dữ liệu sau khi xóa
      if (selectedDate === getTodayDate()) dispatch(loadTodaySectionsData());
    }
  }
});

// 🎯 Redux Slice
const diarySlice = createSlice({
  name: 'diary',
  initialState: { 
    calendars: [], 
    loading: false, 
    error: null, 
    todaySectionsData: {
      Activity: [],
      Breakfast: [],
      Lunch: [],
      Dinner: [],
      Snack: []
    },
    selectedDateSectionsData: {
      Activity: [],
      Breakfast: [],
      Lunch: [],
      Dinner: [],
      Snack: []
    }
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCalendars.fulfilled, (state, action) => {
        state.calendars = action.payload;
      })
      .addCase(loadTodaySectionsData.fulfilled, (state, action) => {
        state.todaySectionsData = action.payload;
      })
      .addCase(loadSelectedDateSectionsData.fulfilled, (state, action) => {
        state.selectedDateSectionsData = action.payload;
      })
      .addCase(deleteItemFromSection.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export default diarySlice.reducer;
