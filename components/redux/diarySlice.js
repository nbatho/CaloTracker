import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as CalendarAPI from 'expo-calendar';

// ✅ Async action to load calendar data
export const loadCalendars = createAsyncThunk('diary/loadCalendars', async () => {
  const { status } = await CalendarAPI.requestCalendarPermissionsAsync();
  if (status !== 'granted') throw new Error('Calendar permission denied');

  const calendars = await CalendarAPI.getCalendarsAsync(CalendarAPI.EntityTypes.EVENT);
  return calendars;
});

// ✅ Redux slice
const diarySlice = createSlice({
  name: 'diary',
  initialState: {
    calendars: [],
    loading: false,
    error: null,
  },
  reducers: {},
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

export default diarySlice.reducer;
