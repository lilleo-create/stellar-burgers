import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { orderBurgerApi, fetchWithRefresh } from '../../utils/burger-api';
import { getCookie } from '../../utils/cookie';
import { TOrder } from '../../utils/types';

const API_URL = 'https://norma.nomoreparties.space/api';

export const sendOrder = createAsyncThunk(
  'order/sendOrder',
  async (ingredientIds: string[]) => {
    const response = await orderBurgerApi(ingredientIds);
    return response.order;
  }
);

export const getUserOrders = createAsyncThunk(
  'order/getUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetchWithRefresh<{ orders: TOrder[] }>(
        `${API_URL}/orders`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
            Authorization: 'Bearer ' + getCookie('accessToken')
          }
        }
      );
      return res.orders;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Ошибка загрузки истории заказов');
    }
  }
);

interface OrderState {
  orderData: TOrder | null;
  orderRequest: boolean;
  orderFailed: boolean;
  orderModalData: TOrder | null;
  userOrders: TOrder[];
}

const initialState: OrderState = {
  orderData: null,
  orderRequest: false,
  orderFailed: false,
  orderModalData: null,
  userOrders: []
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    closeOrderModal: (state) => {
      state.orderModalData = null;
      state.orderRequest = false;
      state.orderFailed = false;
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
      })

      .addCase(getUserOrders.pending, (state) => {
        state.orderRequest = true;
        state.orderFailed = false;
      })
      .addCase(
        getUserOrders.fulfilled,
        (state, action: PayloadAction<TOrder[]>) => {
          state.orderRequest = false;
          state.userOrders = action.payload;
        }
      )
      .addCase(getUserOrders.rejected, (state) => {
        state.orderRequest = false;
        state.orderFailed = true;
      });
  }
});

export const { closeOrderModal } = orderSlice.actions;
export default orderSlice.reducer;
