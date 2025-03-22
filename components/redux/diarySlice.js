import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as CalendarAPI from 'expo-calendar';
import AsyncStorage from '@react-native-async-storage/async-storage';

//  Lấy ngày hiện tại
const getTodayDate = () => new Date().toISOString().split('T')[0];

//  Hàm hỗ trợ lấy ngày đầu tuần/tháng/năm
const getStartOfWeek = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0];
};

const getStartOfMonth = (date) => {
  const d = new Date(date);
  d.setDate(1);
  return d.toISOString().split('T')[0];
};

const getStartOfYear = (date) => {
  const d = new Date(date);
  d.setMonth(0, 1);
  return d.toISOString().split('T')[0];
};

// Load dữ liệu trong khoảng thời gian
const loadDataInRange = async (startDate) => {
  let allSectionsData = await AsyncStorage.getItem('allSectionsData');
  allSectionsData = allSectionsData ? JSON.parse(allSectionsData) : {};

  // Lọc dữ liệu theo ngày và sắp xếp theo thứ tự tăng dần
  const sortedData = Object.keys(allSectionsData)
    .filter(date => date >= startDate)
    .sort((a, b) => new Date(a) - new Date(b)) // Sắp xếp ngày theo thứ tự tăng dần
    .reduce((acc, date) => {
      acc[date] = allSectionsData[date];
      return acc;
    }, {});

  return sortedData;
};

// Load dữ liệu trong tuần
export const loadWeekData = createAsyncThunk('diary/loadWeekData', async () => {
  const startDate = getStartOfWeek(getTodayDate());
  return await loadDataInRange(startDate);
});

// Load dữ liệu trong tháng
export const loadMonthData = createAsyncThunk('diary/loadMonthData', async () => {
  const startDate = getStartOfMonth(getTodayDate());
  return await loadDataInRange(startDate);
});

// Load dữ liệu trong năm
export const loadYearData = createAsyncThunk('diary/loadYearData', async () => {
  const startDate = getStartOfYear(getTodayDate());
  return await loadDataInRange(startDate);
});

//  Load quyền truy cập lịch
export const loadCalendars = createAsyncThunk('diary/loadCalendars', async () => {
  const { status } = await CalendarAPI.requestCalendarPermissionsAsync();
  if (status !== 'granted') throw new Error('Calendar permission denied');

  const calendars = await CalendarAPI.getCalendarsAsync(CalendarAPI.EntityTypes.EVENT);
  return calendars;
});

//  Load dữ liệu ngày hiện tại
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

//  Thêm mục vào ngày được chọn
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
      ...item,
      met: item.met || 0 // Đảm bảo có MET
    };

    console.log("🆕 Item added:", newItem);
    allSectionsData[selectedDate][section].push(newItem);

    //  Tính tổng Carbs, Fat, Protein, MET ngay lập tức
    const totalNutrients = Object.values(allSectionsData[selectedDate])
    .flat()
    .reduce((totals, foodItem) => ({
      carbohydrates: parseFloat((totals.carbohydrates + (parseFloat(foodItem.carbohydrates) || 0)).toFixed(1)),
      energy: parseFloat((totals.energy + (parseFloat(foodItem.energy) || 0)).toFixed(1)),
      fat: parseFloat((totals.fat + (parseFloat(foodItem.fat) || 0)).toFixed(1)),
      proteins: parseFloat((totals.proteins + (parseFloat(foodItem.proteins) || 0)).toFixed(1)),
      totalMET: parseFloat((totals.totalMET + (parseFloat(foodItem.met) || 0)).toFixed(1))
    }), { carbohydrates: 0, fat: 0, proteins: 0, energy: 0, totalMET: 0 });
    //  Lưu vào AsyncStorage
    await AsyncStorage.setItem('allSectionsData', JSON.stringify(allSectionsData));
    await AsyncStorage.setItem('totalNutrients', JSON.stringify(totalNutrients));

    dispatch(updateTotalNutrients(totalNutrients)); //  Cập nhật Redux ngay lập tức
    dispatch(loadSelectedDateSectionsData());

    if (selectedDate === getTodayDate()) {
      dispatch(loadTodaySectionsData());
    }
  }
);

//  Xóa mục khỏi ngày được chọn
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
        allSectionsData[selectedDate][section].splice(index, 1); // ❌ Xóa item khỏi danh sách
      }

      //  Cập nhật tổng dinh dưỡng & MET ngay lập tức
      const totalNutrients = Object.values(allSectionsData[selectedDate])
      .flat()
      .reduce((totals, foodItem) => ({
        carbohydrates: parseFloat((totals.carbohydrates + (parseFloat(foodItem.carbohydrates) || 0)).toFixed(1)),
        energy: parseFloat((totals.energy + (parseFloat(foodItem.energy) || 0)).toFixed(1)),
        fat: parseFloat((totals.fat + (parseFloat(foodItem.fat) || 0)).toFixed(1)),
        proteins: parseFloat((totals.proteins + (parseFloat(foodItem.proteins) || 0)).toFixed(1)),
        totalMET: parseFloat((totals.totalMET + (parseFloat(foodItem.met) || 0)).toFixed(1))
      }), { carbohydrates: 0, fat: 0, proteins: 0, energy: 0, totalMET: 0 });

      await AsyncStorage.setItem('allSectionsData', JSON.stringify(allSectionsData));
      await AsyncStorage.setItem('totalNutrients', JSON.stringify(totalNutrients));

      dispatch(updateTotalNutrients(totalNutrients)); //  Cập nhật Redux ngay lập tức
      dispatch(loadSelectedDateSectionsData());

      if (selectedDate === getTodayDate()) {
        dispatch(loadTodaySectionsData());
      }
    }
  }
);

//  Load tổng dữ liệu dinh dưỡng
export const loadTotalNutrients = createAsyncThunk(
  'diary/loadTotalNutrients',
  async () => {
    const storedNutrients = await AsyncStorage.getItem('totalNutrients');
    return storedNutrients ? JSON.parse(storedNutrients) : { carbohydrates: 0, fat: 0, proteins: 0, energy: 0, totalMET: 0 };
  }
);

//  Redux Slice
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
    totalNutrients: { carbohydrates: 0, fat: 0, proteins: 0, energy: 0, totalMET: 0 },
    weekData: {},
    monthData: {},
    yearData: {}
  },
  reducers: {
    updateTotalNutrients: (state, action) => {
      state.totalNutrients = {
          ...state.totalNutrients, //  Giữ lại totalMET
          ...action.payload 
      };
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
      .addCase(loadWeekData.fulfilled, (state, action) => {
        state.weekData = action.payload;
      })
      .addCase(loadMonthData.fulfilled, (state, action) => {
        state.monthData = action.payload;
      })
      .addCase(loadYearData.fulfilled, (state, action) => {
        state.yearData = action.payload;
      });
  }
});

export const { updateTotalNutrients } = diarySlice.actions;
export default diarySlice.reducer;
