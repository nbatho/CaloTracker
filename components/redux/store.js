import { configureStore } from '@reduxjs/toolkit';
import diaryReducer from './diarySlice'; 

const store = configureStore({
  reducer: {
    diary: diaryReducer,
  },
});

export default store;
