import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const analyzeImage = createAsyncThunk(
  'analysis/analyzeImage',
  async (imageData, { rejectWithValue }) => {
    try {
      const response = await api.post('/analysis/image', { imageData });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Analysis failed');
    }
  }
);

export const submitFeedback = createAsyncThunk(
  'analysis/submitFeedback',
  async ({ analysisId, feedback }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/analysis/${analysisId}/feedback`, feedback);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Feedback failed');
    }
  }
);

const analysisSlice = createSlice({
  name: 'analysis',
  initialState: {
    currentAnalysis: null,
    currentImage: null, // Base64 string
    analyzing: false,
    error: null,
  },
  reducers: {
    setImage: (state, action) => {
      state.currentImage = action.payload;
    },
    clearCurrentAnalysis: (state) => {
      state.currentAnalysis = null;
      state.currentImage = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(analyzeImage.pending, (state) => {
        state.analyzing = true;
        state.error = null;
      })
      .addCase(analyzeImage.fulfilled, (state, action) => {
        state.analyzing = false;
        state.currentAnalysis = action.payload;
      })
      .addCase(analyzeImage.rejected, (state, action) => {
        state.analyzing = false;
        state.error = action.payload;
      });
  },
});

export const { setImage, clearCurrentAnalysis } = analysisSlice.actions;
export default analysisSlice.reducer;