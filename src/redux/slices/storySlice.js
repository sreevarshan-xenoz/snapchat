import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stories: [],
  myStories: [],
  loading: false,
  error: null,
};

const storySlice = createSlice({
  name: 'story',
  initialState,
  reducers: {
    fetchStoriesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchStoriesSuccess: (state, action) => {
      state.loading = false;
      state.stories = action.payload;
      state.error = null;
    },
    fetchStoriesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchMyStoriesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchMyStoriesSuccess: (state, action) => {
      state.loading = false;
      state.myStories = action.payload;
      state.error = null;
    },
    fetchMyStoriesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addStory: (state, action) => {
      state.myStories.push(action.payload);
    },
    removeStory: (state, action) => {
      state.myStories = state.myStories.filter(story => story.id !== action.payload);
    },
    updateStory: (state, action) => {
      const index = state.myStories.findIndex(story => story.id === action.payload.id);
      if (index !== -1) {
        state.myStories[index] = { ...state.myStories[index], ...action.payload };
      }
    },
  },
});

export const {
  fetchStoriesStart,
  fetchStoriesSuccess,
  fetchStoriesFailure,
  fetchMyStoriesStart,
  fetchMyStoriesSuccess,
  fetchMyStoriesFailure,
  addStory,
  removeStory,
  updateStory,
} = storySlice.actions;

export default storySlice.reducer; 