// src/services/slices/orderSlice.test.ts
import { configureStore } from '@reduxjs/toolkit';
import reducer, {
  initialState as orderInitial,
  sendOrder,
  getUserOrders,
  closeOrderModal
} from './orderSlice';

// Мокаем API-модули (путь из src/services/slices/* к src/utils/*)
jest.mock('../../utils/burger-api', () => ({
  orderBurgerApi: jest.fn(),
  fetchWithRefresh: jest.fn()
}));
jest.mock('../../utils/cookie', () => ({
  getCookie: jest.fn()
}));

import { orderBurgerApi, fetchWithRefresh } from '../../utils/burger-api';
import { getCookie } from '../../utils/cookie';

const mockOrder = {
  _id: 'ord1',
  number: 777,
  status: 'done',
  name: 'Super Burger',
  ingredients: ['a', 'b'],
  createdAt: '2025-10-26T00:00:00.000Z',
  updatedAt: '2025-10-26T00:00:00.000Z'
} as any;

describe('orderSlice — unit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initial state', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state).toEqual(orderInitial);
  });

  it('closeOrderModal: очищает modal и флаги', () => {
    const prepared = reducer(undefined, {
      type: closeOrderModal.type
    } as any);
    expect(prepared.orderModalData).toBeNull();
    expect(prepared.orderRequest).toBe(false);
    expect(prepared.orderFailed).toBe(false);
  });

  it('sendOrder.pending: orderRequest=true, orderFailed=false', () => {
    const next = reducer(undefined, { type: sendOrder.pending.type });
    expect(next.orderRequest).toBe(true);
    expect(next.orderFailed).toBe(false);
  });

  it('sendOrder.fulfilled: кладёт orderData и orderModalData, снимает orderRequest', () => {
    const prev = { ...orderInitial, orderRequest: true };
    const next = reducer(prev as any, {
      type: sendOrder.fulfilled.type,
      payload: mockOrder
    });
    expect(next.orderRequest).toBe(false);
    expect(next.orderFailed).toBe(false);
    expect(next.orderData).toEqual(mockOrder);
    expect(next.orderModalData).toEqual(mockOrder);
  });

  it('sendOrder.rejected: orderFailed=true, orderRequest=false, orderData=null', () => {
    const prev = { ...orderInitial, orderRequest: true };
    const next = reducer(prev as any, { type: sendOrder.rejected.type });
    expect(next.orderRequest).toBe(false);
    expect(next.orderFailed).toBe(true);
    expect(next.orderData).toBeNull();
  });

  it('getUserOrders.pending: orderRequest=true, orderFailed=false', () => {
    const next = reducer(undefined, { type: getUserOrders.pending.type });
    expect(next.orderRequest).toBe(true);
    expect(next.orderFailed).toBe(false);
  });

  it('getUserOrders.fulfilled: заполняет userOrders, orderRequest=false', () => {
    const prev = { ...orderInitial, orderRequest: true };
    const next = reducer(prev as any, {
      type: getUserOrders.fulfilled.type,
      payload: [mockOrder]
    });
    expect(next.orderRequest).toBe(false);
    expect(next.orderFailed).toBe(false);
    expect(next.userOrders).toHaveLength(1);
    expect(next.userOrders[0]._id).toBe('ord1');
  });

  it('getUserOrders.rejected: orderFailed=true, orderRequest=false', () => {
    const prev = { ...orderInitial, orderRequest: true };
    const next = reducer(prev as any, { type: getUserOrders.rejected.type });
    expect(next.orderRequest).toBe(false);
    expect(next.orderFailed).toBe(true);
  });
});

describe('orderSlice — thunk через тестовый store', () => {
  const makeStore = () => configureStore({ reducer: { order: reducer } });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sendOrder успех: вызывает orderBurgerApi и сохраняет order', async () => {
    (orderBurgerApi as jest.Mock).mockResolvedValueOnce({ order: mockOrder });

    const store = makeStore();
    await store.dispatch<any>(sendOrder(['id1', 'id2']));

    expect(orderBurgerApi).toHaveBeenCalledTimes(1);
    expect(orderBurgerApi).toHaveBeenCalledWith(['id1', 'id2']);

    const state: any = store.getState().order;
    expect(state.orderRequest).toBe(false);
    expect(state.orderFailed).toBe(false);
    expect(state.orderData?.number).toBe(777);
    expect(state.orderModalData?._id).toBe('ord1');
  });

  it('sendOrder ошибка: rejected ставит orderFailed=true', async () => {
    (orderBurgerApi as jest.Mock).mockRejectedValueOnce(new Error('API down'));

    const store = makeStore();
    await store.dispatch<any>(sendOrder(['id1']));

    const state: any = store.getState().order;
    expect(orderBurgerApi).toHaveBeenCalledTimes(1);
    expect(state.orderRequest).toBe(false);
    expect(state.orderFailed).toBe(true);
    expect(state.orderData).toBeNull();
  });

  it('getUserOrders успех: использует токен и сохраняет userOrders', async () => {
    (getCookie as jest.Mock).mockReturnValue('FAKE.TOKEN');
    (fetchWithRefresh as jest.Mock).mockResolvedValueOnce({
      orders: [mockOrder]
    });

    const store = makeStore();
    await store.dispatch<any>(getUserOrders());

    // Проверяем, что заголовок Authorization сформирован как в слайсе
    expect(fetchWithRefresh).toHaveBeenCalledTimes(1);
    const [url, options] = (fetchWithRefresh as jest.Mock).mock.calls[0];
    expect(url).toBe('https://norma.nomoreparties.space/api/orders');
    expect(options.headers.Authorization).toBe('Bearer FAKE.TOKEN');

    const state: any = store.getState().order;
    expect(state.orderRequest).toBe(false);
    expect(state.orderFailed).toBe(false);
    expect(state.userOrders).toHaveLength(1);
    expect(state.userOrders[0].number).toBe(777);
  });

  it('getUserOrders ошибка: rejectedWithValue кладёт сообщение в orderFailed=true флаг', async () => {
    (getCookie as jest.Mock).mockReturnValue('FAKE.TOKEN');
    (fetchWithRefresh as jest.Mock).mockRejectedValueOnce(
      new Error('History service unavailable')
    );

    const store = makeStore();
    await store.dispatch<any>(getUserOrders());

    const state: any = store.getState().order;
    expect(fetchWithRefresh).toHaveBeenCalledTimes(1);
    expect(state.orderRequest).toBe(false);
    expect(state.orderFailed).toBe(true);
    expect(state.userOrders).toHaveLength(0);
  });

  it('sendOrder.rejected: очищает orderData если ранее был успешный заказ', () => {
    const withOrder = reducer(undefined, {
      type: sendOrder.fulfilled.type,
      payload: { _id: 'x', number: 1 } as any
    });
    expect(withOrder.orderData).not.toBeNull();

    const next = reducer(withOrder as any, { type: sendOrder.rejected.type });
    expect(next.orderRequest).toBe(false);
    expect(next.orderFailed).toBe(true);
    expect(next.orderData).toBeNull();
  });
});
