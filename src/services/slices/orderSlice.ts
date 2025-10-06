// src/services/slices/orderSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { orderBurgerApi } from '../../utils/burger-api';
import { TOrder } from '../../utils/types';

export const sendOrder = createAsyncThunk(
  'order/sendOrder',
  async (ingredientIds: string[]) => {
    const response = await orderBurgerApi(ingredientIds);
    return response.order;
  }
);

interface OrderState {
  orderData: TOrder | null;
  orderRequest: boolean;
  orderFailed: boolean;
  orderModalData: TOrder | null;
}

const initialState: OrderState = {
  orderData: null,
  orderRequest: false,
  orderFailed: false,
  orderModalData: null
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    closeOrderModal: (state) => {
      state.orderModalData = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendOrder.pending, (state) => {
        state.orderRequest = true;
        state.orderFailed = false;
      })
      .addCase(sendOrder.fulfilled, (state, action: PayloadAction<TOrder>) => {
        state.orderRequest = false;
        state.orderData = action.payload;
        state.orderModalData = action.payload;
      })
      .addCase(sendOrder.rejected, (state) => {
        state.orderRequest = false;
        state.orderFailed = true;
        state.orderData = null;
      });
  }
});

export const { closeOrderModal } = orderSlice.actions;
export default orderSlice.reducer;
