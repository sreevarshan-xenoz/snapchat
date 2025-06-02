import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  friends: [],
  friendRequests: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    fetchFriendsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchFriendsSuccess: (state, action) => {
      state.loading = false;
      state.friends = action.payload;
      state.error = null;
    },
    fetchFriendsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchFriendRequestsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchFriendRequestsSuccess: (state, action) => {
      state.loading = false;
      state.friendRequests = action.payload;
      state.error = null;
    },
    fetchFriendRequestsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addFriend: (state, action) => {
      state.friends.push(action.payload);
    },
    removeFriend: (state, action) => {
      state.friends = state.friends.filter(friend => friend.id !== action.payload);
    },
    addFriendRequest: (state, action) => {
      state.friendRequests.push(action.payload);
    },
    removeFriendRequest: (state, action) => {
      state.friendRequests = state.friendRequests.filter(request => request.id !== action.payload);
    },
  },
});

export const {
  fetchFriendsStart,
  fetchFriendsSuccess,
  fetchFriendsFailure,
  fetchFriendRequestsStart,
  fetchFriendRequestsSuccess,
  fetchFriendRequestsFailure,
  addFriend,
  removeFriend,
  addFriendRequest,
  removeFriendRequest,
} = userSlice.actions;

export default userSlice.reducer; 