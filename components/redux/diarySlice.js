import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as CalendarAPI from 'expo-calendar';

// Load calendar permissions
export const loadCalendars = createAsyncThunk('diary/loadCalendars', async () => {
  const { status } = await CalendarAPI.requestCalendarPermissionsAsync();
  if (status !== 'granted') throw new Error('Calendar permission denied');

  const calendars = await CalendarAPI.getCalendarsAsync(CalendarAPI.EntityTypes.EVENT);
  return calendars;
});

// Redux slice
const diarySlice = createSlice({
  name: 'diary',
  initialState: { 
    calendars: [], 
    loading: false, 
    error: null, 
    activities: {}, 
    sectionsData: {
      Activity: [],
      Breakfast: [],
      Lunch: [],
      Dinner: [],
      Snack: []
    }
  },
  reducers: {
    resetActivities: (state) => {
      state.activities = {}; 
    },
    addItemToSection: (state, action) => {
      const { section, item } = action.payload;
      if (state.sectionsData[section].length < 3) {
        state.sectionsData[section].push(item);
      }
    },
    deleteItemFromSection: (state, action) => {
      const { section, item } = action.payload;
      state.sectionsData[section] = state.sectionsData[section].filter(i => i !== item);
    }
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

export const { addItemToSection, deleteItemFromSection, resetActivities } = diarySlice.actions;
export default diarySlice.reducer;
