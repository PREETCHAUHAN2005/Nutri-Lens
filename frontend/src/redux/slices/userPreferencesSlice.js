import { createSlice } from '@reduxjs/toolkit';

// Placeholder slice for now - can expand for personalization features
const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState: {
    dietaryRestrictions: [],
  },
  reducers: {
    setPreferences: (state, action) => {
      return { ...state, ...action.payload };
    }
  }
});

export const { setPreferences } = userPreferencesSlice.actions;
export default userPreferencesSlice.reducer;