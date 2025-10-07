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
      // ✅ мутируем draft, а не возвращаем объект
      state.orders = action.payload.orders;
      state.totalData = action.payload.totalData;
      state.totalToday = action.payload.totalToday;
    }
  }
});

export const { setFeed } = feedSlice.actions;
export default feedSlice.reducer;
