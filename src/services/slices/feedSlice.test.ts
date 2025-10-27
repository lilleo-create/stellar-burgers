// src/services/slices/feed/feedSlice.test.ts
import { configureStore } from '@reduxjs/toolkit';
import reducer, { initialState as feedInitial, getFeeds } from './feedSlice';

// Заглушаем шум в логах из console.error внутри thunk при ошибке
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  (console.error as jest.Mock).mockRestore?.();
});

// Мокаем модуль API, откуда берётся getFeedsApi
jest.mock('../../utils/burger-api', () => ({
  getFeedsApi: jest.fn()
}));

import { getFeedsApi } from '../../utils/burger-api';

const mockResponse = {
  success: true,
  total: 1234,
  totalToday: 56,
  orders: [
    {
      _id: 'o1',
      number: 101,
      status: 'done',
      ingredients: ['a', 'b'],
      createdAt: '2025-10-26T00:00:00.000Z',
      updatedAt: '2025-10-26T00:00:00.000Z',
      name: 'Order 101'
    },
    {
      _id: 'o2',
      number: 102,
      status: 'pending',
      ingredients: ['c'],
      createdAt: '2025-10-26T00:00:00.000Z',
      updatedAt: '2025-10-26T00:00:00.000Z',
      name: 'Order 102'
    }
  ]
};

describe('feedSlice — unit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('возвращает initial state по умолчанию', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state).toEqual(feedInitial);
  });

  it('pending: выставляет feedRequest=true и не трогает остальное', () => {
    const next = reducer(undefined, { type: getFeeds.pending.type });
    expect(next.feedRequest).toBe(true);
    expect(next.orders).toEqual(feedInitial.orders);
    expect(next.totalData).toEqual(feedInitial.totalData);
    expect(next.error).toBeNull();
  });

  it('fulfilled: кладёт orders и totalData, feedRequest=false', () => {
    const prev = { ...feedInitial, feedRequest: true };
    const next = reducer(prev as any, {
      type: getFeeds.fulfilled.type,
      payload: mockResponse
    });

    expect(next.feedRequest).toBe(false);
    expect(next.orders).toHaveLength(2);
    expect(next.orders[0]._id).toBe('o1');
    expect(next.totalData).toEqual({ total: 1234, totalToday: 56 });
    expect(next.error).toBeNull();
  });

  it('fulfilled без orders: использует [] по умолчанию', () => {
    const prev = { ...feedInitial, feedRequest: true };
    const payload = { total: 5, totalToday: 2 } as any;

    const next = reducer(prev as any, {
      type: getFeeds.fulfilled.type,
      payload
    });

    expect(next.feedRequest).toBe(false);
    expect(next.orders).toEqual([]);
    expect(next.totalData).toEqual({ total: 5, totalToday: 2 });
  });

  it('rejected: записывает payload как error и feedRequest=false', () => {
    const prev = { ...feedInitial, feedRequest: true };
    const next = reducer(prev as any, {
      type: getFeeds.rejected.type,
      payload: 'Boom'
    });

    expect(next.feedRequest).toBe(false);
    expect(next.error).toBe('Boom');
  });

  it('rejected без payload: ставит дефолтное сообщение', () => {
    const next = reducer(undefined, { type: getFeeds.rejected.type });
    expect(next.error).toBe('Ошибка загрузки ленты заказов');
  });
});

describe('feedSlice — thunk через тестовый store', () => {
  const makeStore = () => configureStore({ reducer: { feed: reducer } });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('успех: диспатчит fulfilled и обновляет state', async () => {
    (getFeedsApi as jest.Mock).mockResolvedValueOnce(mockResponse);

    const store = makeStore();
    await store.dispatch<any>(getFeeds());

    const state: any = store.getState().feed;
    expect(getFeedsApi).toHaveBeenCalledTimes(1);
    expect(state.feedRequest).toBe(false);
    expect(state.orders).toHaveLength(2);
    expect(state.totalData).toEqual({ total: 1234, totalToday: 56 });
    expect(state.error).toBeNull();
  });

  it('ошибка: диспатчит rejected с rejectWithValue и пишет error', async () => {
    (getFeedsApi as jest.Mock).mockRejectedValueOnce(new Error('Network down'));

    const store = makeStore();
    await store.dispatch<any>(getFeeds());

    const state: any = store.getState().feed;
    expect(getFeedsApi).toHaveBeenCalledTimes(1);
    expect(state.feedRequest).toBe(false);
    expect(state.orders).toHaveLength(0);
    expect(state.totalData).toEqual({ total: 0, totalToday: 0 });
    expect(state.error).toBe('Network down');
  });
});