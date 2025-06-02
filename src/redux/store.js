import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import storyReducer from './slices/storySlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    story: storyReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
}); 