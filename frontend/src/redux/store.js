import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import analysisReducer from './slices/analysisSlice';
import chatReducer from './slices/chatSlice';
import userPreferencesReducer from './slices/userPreferencesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    analysis: analysisReducer,
    chat: chatReducer,
    userPreferences: userPreferencesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore large base64 strings in actions to prevent devtools lag
        ignoredActionPaths: ['payload.imageData', 'meta.arg.imageData'],
        ignoredPaths: ['analysis.currentImage'],
      },
    }),
});