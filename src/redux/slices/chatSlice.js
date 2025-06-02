import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  chats: [],
  activeChat: null,
  messages: [],
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    fetchChatsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchChatsSuccess: (state, action) => {
      state.loading = false;
      state.chats = action.payload;
      state.error = null;
    },
    fetchChatsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    fetchMessagesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchMessagesSuccess: (state, action) => {
      state.loading = false;
      state.messages = action.payload;
      state.error = null;
    },
    fetchMessagesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    addChat: (state, action) => {
      state.chats.push(action.payload);
    },
    updateChat: (state, action) => {
      const index = state.chats.findIndex(chat => chat.id === action.payload.id);
      if (index !== -1) {
        state.chats[index] = { ...state.chats[index], ...action.payload };
      }
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const {
  fetchChatsStart,
  fetchChatsSuccess,
  fetchChatsFailure,
  setActiveChat,
  fetchMessagesStart,
  fetchMessagesSuccess,
  fetchMessagesFailure,
  addMessage,
  addChat,
  updateChat,
  clearMessages,
} = chatSlice.actions;

export default chatSlice.reducer; 