// src/services/slices/ingredientsSlice.test.ts
import { configureStore } from '@reduxjs/toolkit';
import reducer, { fetchIngredients } from './ingredientsSlice';

// Мокаем модуль API, откуда берётся fetchIngredientsApi
jest.mock('../../utils/burger-api', () => ({
  fetchIngredientsApi: jest.fn()
}));

import { fetchIngredientsApi } from '../../utils/burger-api';

const mockItems = [
  { _id: 'bun1', type: 'bun', name: 'Булка', price: 100 } as any,
  { _id: 's1', type: 'sauce', name: 'Соус', price: 50 } as any
];

describe('ingredientsSlice — unit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('возвращает initial state по умолчанию', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state).toEqual({
      items: [],
      isLoading: false,
      error: null
    });
  });

  it('pending: isLoading=true и error=null', () => {
    const next = reducer(undefined, { type: fetchIngredients.pending.type });
    expect(next.isLoading).toBe(true);
    expect(next.error).toBeNull();
  });

  it('fulfilled: кладёт items и снимает isLoading', () => {
    const prev = { items: [], isLoading: true, error: null };
    const next = reducer(prev as any, {
      type: fetchIngredients.fulfilled.type,
      payload: mockItems
    });
    expect(next.isLoading).toBe(false);
    expect(next.items).toEqual(mockItems);
    expect(next.error).toBeNull();
  });

  it('rejected: пишет message в error и снимает isLoading', () => {
    const prev = { items: [], isLoading: true, error: null };
    const next = reducer(prev as any, {
      type: fetchIngredients.rejected.type,
      error: { message: 'Network error' }
    });
    expect(next.isLoading).toBe(false);
    expect(next.error).toBe('Network error');
  });

  it('rejected без message: дефолтное сообщение', () => {
    const next = reducer(undefined, {
      type: fetchIngredients.rejected.type,
      error: {}
    });
    expect(next.error).toBe('Не удалось загрузить ингредиенты');
  });
});

describe('ingredientsSlice — thunk через тестовый store', () => {
  const makeStore = () => configureStore({ reducer: { ingredients: reducer } });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('успех: диспатчит fulfilled и заполняет items', async () => {
    (fetchIngredientsApi as jest.Mock).mockResolvedValueOnce(mockItems);

    const store = makeStore();
    await store.dispatch<any>(fetchIngredients());

    const state: any = store.getState().ingredients;
    expect(fetchIngredientsApi).toHaveBeenCalledTimes(1);
    expect(state.isLoading).toBe(false);
    expect(state.items).toHaveLength(2);
    expect(state.error).toBeNull();
  });

  it('ошибка: диспатчит rejected и пишет error из message', async () => {
    (fetchIngredientsApi as jest.Mock).mockRejectedValueOnce(
      new Error('API down')
    );

    const store = makeStore();
    await store.dispatch<any>(fetchIngredients());

    const state: any = store.getState().ingredients;
    expect(fetchIngredientsApi).toHaveBeenCalledTimes(1);
    expect(state.isLoading).toBe(false);
    expect(state.items).toHaveLength(0);
    expect(state.error).toBe('API down');
  });
});
