import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const startConversation = createAsyncThunk(
  'chat/startConversation',
  async (analysisId, { rejectWithValue }) => {
    try {
      const response = await api.post('/chat/start', { analysisId });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start chat');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, message }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/chat/${conversationId}/message`, { message });
      return { 
        ...response.data.data, 
        userMessage: message // Pass back to optimistically update UI
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    currentConversation: null,
    messages: [],
    loading: false, // For starting chat
    sending: false, // For sending a message
    error: null,
  },
  reducers: {
    clearConversation: (state) => {
      state.currentConversation = null;
      state.messages = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startConversation.pending, (state) => { state.loading = true; })
      .addCase(startConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentConversation = action.payload;
        state.messages = []; 
      })
      .addCase(sendMessage.pending, (state) => { state.sending = true; })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sending = false;
        // 1. Add User Message
        state.messages.push({
          role: 'user',
          content: action.payload.userMessage,
          timestamp: new Date().toISOString()
        });
        // 2. Add AI Response
        state.messages.push({
          role: 'assistant',
          content: action.payload.message,
          reasoning: action.payload.reasoning,
          timestamp: new Date().toISOString()
        });
      });
  },
});

export const { clearConversation } = chatSlice.actions;
export default chatSlice.reducer;