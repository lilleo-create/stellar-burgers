// src/services/slices/feedSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getFeedsApi } from '../../utils/burger-api';
import { TOrder } from '../../utils/types';

type FeedState = {
  orders: TOrder[];
  totalData: {
    total: number;
    totalToday: number;
  };
  feedRequest: boolean;
  error: string | null;
};

const initialState: FeedState = {
  orders: [],
  totalData: { total: 0, totalToday: 0 },
  feedRequest: false,
  error: null
};

// ✅ асинхронное получение заказов
export const getFeeds = createAsyncThunk('feed/getFeeds', async () => {
  const res = await getFeedsApi();
  return res;
});

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFeeds.pending, (state) => {
        state.feedRequest = true;
      })
      .addCase(getFeeds.fulfilled, (state, action) => {
        state.feedRequest = false;
        state.orders = action.payload.orders || []; // ✅ fallback на []
        state.totalData = {
          total: action.payload.total,
          totalToday: action.payload.totalToday
        };
      })

      .addCase(getFeeds.rejected, (state) => {
        state.feedRequest = false;
        state.error = 'Ошибка загрузки ленты заказов';
      });
  }
});

export default feedSlice.reducer;
