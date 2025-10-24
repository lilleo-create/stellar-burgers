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

export const getFeeds = createAsyncThunk(
  'feed/getFeeds',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getFeedsApi();
      return res;
    } catch (err: any) {
      console.error('❌ Ошибка загрузки ленты:', err);
      return rejectWithValue(err.message || 'Ошибка загрузки ленты заказов');
    }
  }
);

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
        state.orders = action.payload.orders || [];
        state.totalData = {
          total: action.payload.total,
          totalToday: action.payload.totalToday
        };
      })

      .addCase(getFeeds.rejected, (state, action) => {
        state.feedRequest = false;
        state.error =
          (action.payload as string) || 'Ошибка загрузки ленты заказов';
      });
  }
});

export default feedSlice.reducer;
