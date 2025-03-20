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
    }

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
    }

    return allSectionsData[selectedDate];
  }
);

// 🎯 Thêm mục vào ngày được chọn
export const addItemToSelectedDate = createAsyncThunk(
  'diary/addItemToSelectedDate',
  async ({ section, item }, { dispatch, getState }) => {
    if (!item || !item.name) return;

    const selectedDate = await AsyncStorage.getItem('selectedDate');
    let allSectionsData = await AsyncStorage.getItem('allSectionsData');
    allSectionsData = allSectionsData ? JSON.parse(allSectionsData) : {};

    if (!allSectionsData[selectedDate]) {
      allSectionsData[selectedDate] = { Activity: [], Breakfast: [], Lunch: [], Dinner: [], Snack: [] };
    }

    const newItem = {
      name: item.name,
      carbohydrates: (parseFloat(item.carbohydrates_100g) || 0) * (parseFloat(item.quantity) / 100 || 1),
      energy: (parseFloat(item.energy_100g) || 0) * (parseFloat(item.quantity) / 100 || 1),
      fat: (parseFloat(item.fat_100g) || 0) * (parseFloat(item.quantity) / 100 || 1),
      proteins: (parseFloat(item.proteins_100g) || 0) * (parseFloat(item.quantity) / 100 || 1),
      sugars: item.sugars_100g * (item.quantity / 100),
      fiber: item.fiber ? item.fiber * (item.quantity / 100) : 0,
      image_url: item.image_url,
      icon: item.icon,
      quantity: item.quantity
    };
    console.log("🆕 Item added:", newItem);
    allSectionsData[selectedDate][section].push(newItem);

    // ✅ Tính tổng Carbs, Fat, Protein sau khi thêm thực phẩm
    const totalNutrients = Object.values(allSectionsData[selectedDate])
      .flat()
      .reduce((totals, foodItem) => ({
        carbohydrates: totals.carbohydrates + (foodItem.carbohydrates || 0),
        energy: totals.energy + (parseFloat(foodItem.energy) || 0),
        fat: totals.fat + (foodItem.fat || 0),
        proteins: totals.proteins + (foodItem.proteins || 0),
      }), { carbohydrates: 0, fat: 0, proteins: 0, energy:0 });
    // ✅ Lưu vào AsyncStorage
    await AsyncStorage.setItem('allSectionsData', JSON.stringify(allSectionsData));
    await AsyncStorage.setItem('totalNutrients', JSON.stringify(totalNutrients));

    dispatch(loadSelectedDateSectionsData());
    dispatch(updateTotalNutrients(totalNutrients));

    if (selectedDate === getTodayDate()) {
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

    if (allSectionsData[selectedDate] && allSectionsData[selectedDate][section]) {
      const index = allSectionsData[selectedDate][section].findIndex(
        i => i.name === item.name && i.quantity === item.quantity
      );

      if (index !== -1) {
        allSectionsData[selectedDate][section].splice(index, 1); // ❌ Chỉ xóa 1 item
      }

      // ✅ Tính lại tổng sau khi xóa
      const totalNutrients = Object.values(allSectionsData[selectedDate])
        .flat()
        .reduce((totals, foodItem) => ({
          carbohydrates: totals.carbohydrates + (foodItem.carbohydrates || 0),
          energy: totals.energy + (parseFloat(foodItem.energy) || 0),
          fat: totals.fat + (foodItem.fat || 0),
          proteins: totals.proteins + (foodItem.proteins || 0),
        }), { carbohydrates: 0, fat: 0, proteins: 0, energy:0 });

      await AsyncStorage.setItem('allSectionsData', JSON.stringify(allSectionsData));
      await AsyncStorage.setItem('totalNutrients', JSON.stringify(totalNutrients));

      dispatch(loadSelectedDateSectionsData());
      dispatch(updateTotalNutrients(totalNutrients));

      if (selectedDate === getTodayDate()) {
        dispatch(loadTodaySectionsData());
      }
    }
  }
);
export const loadTotalNutrients = createAsyncThunk(
  'diary/loadTotalNutrients',
  async () => {
    const storedNutrients = await AsyncStorage.getItem('totalNutrients');
    return storedNutrients ? JSON.parse(storedNutrients) : { carbohydrates: 0, fat: 0, proteins: 0, energy:0 };
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
    },
    totalNutrients: { carbohydrates: 0, fat: 0, proteins: 0 , energy:0 }
  },
  reducers: {
    updateTotalNutrients: (state, action) => {
      state.totalNutrients = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTotalNutrients.fulfilled, (state, action) => {
        state.totalNutrients = action.payload;
      })
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
  }
});

export const { updateTotalNutrients } = diarySlice.actions;
export default diarySlice.reducer;