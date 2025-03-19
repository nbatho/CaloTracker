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
export const loadTodaySectionsData = createAsyncThunk(
  'diary/loadTodaySectionsData',
  async () => {
    const today = getTodayDate();
    let allSectionsData = await AsyncStorage.getItem('allSectionsData');
    allSectionsData = allSectionsData ? JSON.parse(allSectionsData) : {};

    if (!allSectionsData[today]) {
      allSectionsData[today] = { Activity: [], Breakfast: [], Lunch: [], Dinner: [], Snack: [] };
      await AsyncStorage.setItem('allSectionsData', JSON.stringify(allSectionsData));
    }

    // console.log("📦 Loaded from AsyncStorage:", allSectionsData[today]); // 🛠 Kiểm tra dữ liệu trước khi trả về

    return allSectionsData[today];
  }
);

// 🎯 Load dữ liệu của ngày được chọn
export const loadSelectedDateSectionsData = createAsyncThunk(
  'diary/loadSelectedDateSectionsData',
  async () => {
    const selectedDate = await AsyncStorage.getItem('selectedDate');
    let allSectionsData = await AsyncStorage.getItem('allSectionsData');
    allSectionsData = allSectionsData ? JSON.parse(allSectionsData) : {};

    if (!allSectionsData[selectedDate]) {
      allSectionsData[selectedDate] = { Activity: [], Breakfast: [], Lunch: [], Dinner: [], Snack: [] };
      await AsyncStorage.setItem('allSectionsData', JSON.stringify(allSectionsData));
    }

    return allSectionsData[selectedDate];
  }
);

// 🎯 Thêm mục vào ngày được chọn
export const addItemToSelectedDate = createAsyncThunk(
  'diary/addItemToSelectedDate',
  async ({ section, item }, { dispatch, getState }) => {
    // console.log("📥 Received in Redux (addItemToSelectedDate):", item);

    if (!item || !item.name) {
      console.log("❌ Invalid item:", item);
      return;
    }

    const selectedDate = await AsyncStorage.getItem('selectedDate');
    let allSectionsData = await AsyncStorage.getItem('allSectionsData');
    allSectionsData = allSectionsData ? JSON.parse(allSectionsData) : {};

    if (!allSectionsData[selectedDate]) {
      allSectionsData[selectedDate] = { Activity: [], Breakfast: [], Lunch: [], Dinner: [], Snack: [] };
    }

    const newItem = {
      name: item.name,
      carbohydrates: item.carbohydrates_100g,
      energy: item.energy_100g,
      fat: item.fat_100g,
      proteins: item.proteins_100g,
      sugars: item.sugars_100g,
      fiber: item.fiber,
      image_url: item.image_url,
      icon: item.icon, // ✅ Thêm icon vào newItem
      quantity: item.quantity
    };

    // console.log("✅ Item to be saved:", newItem);

    // Kiểm tra xem item đã tồn tại chưa, tránh thêm trùng lặp
    const sectionData = allSectionsData[selectedDate][section] || [];    
      allSectionsData[selectedDate][section].push(newItem);
      await AsyncStorage.setItem('allSectionsData', JSON.stringify(allSectionsData));

      dispatch(loadSelectedDateSectionsData());

      // Chỉ gọi `loadTodaySectionsData()` nếu thực sự cần thiết
      const state = getState();
      if (selectedDate === getTodayDate() && state.diary.todaySectionsData !== allSectionsData[selectedDate]) {
        dispatch(loadTodaySectionsData());
      }

  }
);

// 🎯 Xóa mục khỏi ngày được chọn
export const deleteItemFromSection = createAsyncThunk(
  'diary/deleteItemFromSection',
  async ({ section, item }, { dispatch }) => {
    const selectedDate = await AsyncStorage.getItem('selectedDate');
    let allSectionsData = await AsyncStorage.getItem('allSectionsData');
    allSectionsData = allSectionsData ? JSON.parse(allSectionsData) : {};

    if (allSectionsData[selectedDate]) {
      const index = allSectionsData[selectedDate][section].findIndex(i => i.name === item.name);
      if (index !== -1) {
        allSectionsData[selectedDate][section].splice(index, 1);
        await AsyncStorage.setItem('allSectionsData', JSON.stringify(allSectionsData));
        dispatch(loadSelectedDateSectionsData()); // 🔥 Load lại dữ liệu sau khi xóa
        if (selectedDate === getTodayDate()) dispatch(loadTodaySectionsData());
      }
    }
  }
);

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
        if (JSON.stringify(state.todaySectionsData) !== JSON.stringify(action.payload)) {
          console.log("📌 Redux todaySectionsData updated:", action.payload);
          state.todaySectionsData = action.payload;
        } else {
          console.log("⏳ No update needed, data unchanged.");
        }
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