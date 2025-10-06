// src/services/slices/feed.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TOrder } from '../../utils/types';

type FeedState = {
  orders: TOrder[];
  totalData: number;
  totalToday: number;
};

const initialState: FeedState = {
  orders: [],
  totalData: 0,
  totalToday: 0
};

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    setFeed(state, action: PayloadAction<FeedState>) {
      return action.payload;
    }
  }
});

export const { setFeed } = feedSlice.actions;
export default feedSlice.reducer;
