// src/services/slices/userSlice.test.ts
import { configureStore } from '@reduxjs/toolkit';
import reducer, {
  setUser,
  getUser,
  loginUser,
  registerUser,
  updateUser,
  logout,
  checkUserAuth
} from './userSlice';

// Мокаем API-функции из burger-api
jest.mock('../../utils/burger-api', () => ({
  getUserApi: jest.fn(),
  loginUserApi: jest.fn(),
  registerUserApi: jest.fn(),
  updateUserApi: jest.fn(),
  logoutApi: jest.fn(),
  refreshToken: jest.fn(),
  forgotPasswordApi: jest.fn(),
  resetPasswordApi: jest.fn()
}));

import {
  getUserApi,
  loginUserApi,
  registerUserApi,
  updateUserApi,
  logoutApi,
  refreshToken
} from '../../utils/burger-api';

const mockUser = { name: 'Neo', email: 'neo@matrix' } as any;

const makeStore = () =>
  configureStore({
    reducer: { user: reducer }
  });

// Тестовое окружение: cookie и localStorage
beforeAll(() => {
  // @ts-ignore
  global.document = { cookie: '' };
  // @ts-ignore
  global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn()
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  (document as any).cookie = '';
  (localStorage.getItem as jest.Mock).mockReset();
  (localStorage.setItem as jest.Mock).mockReset();
  (localStorage.removeItem as jest.Mock).mockReset();
});

describe('userSlice — unit reducers & simple extraReducers', () => {
  it('initial state', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state).toEqual({
      user: null,
      isAuthChecked: false,
      error: null
    });
  });

  it('setUser: кладёт пользователя', () => {
    const next = reducer(undefined, setUser(mockUser));
    expect(next.user).toEqual(mockUser);
  });

  it('getUser.fulfilled: сохраняет user', () => {
    const next = reducer(undefined, {
      type: getUser.fulfilled.type,
      payload: mockUser
    });
    expect(next.user).toEqual(mockUser);
  });

  it('getUser.rejected: обнуляет user', () => {
    const prev = { user: mockUser, isAuthChecked: false, error: null };
    const next = reducer(prev as any, { type: getUser.rejected.type });
    expect(next.user).toBeNull();
  });

  it('loginUser.rejected: пишет error из payload', () => {
    const next = reducer(undefined, {
      type: loginUser.rejected.type,
      payload: 'bad creds'
    });
    expect(next.error).toBe('bad creds');
  });

  it('registerUser.rejected: пишет error из payload', () => {
    const next = reducer(undefined, {
      type: registerUser.rejected.type,
      payload: 'email exists'
    });
    expect(next.error).toBe('email exists');
  });

  it('updateUser.rejected: пишет error из payload', () => {
    const next = reducer(undefined, {
      type: updateUser.rejected.type,
      payload: 'oops'
    });
    expect(next.error).toBe('oops');
  });

  it('logout.fulfilled: user=null, isAuthChecked=true', () => {
    const prev = { user: mockUser, isAuthChecked: false, error: null };
    const next = reducer(prev as any, { type: logout.fulfilled.type });
    expect(next.user).toBeNull();
    expect(next.isAuthChecked).toBe(true);
  });
});

describe('userSlice — thunks via test store', () => {
  it('getUser успех: сохраняет user', async () => {
    (getUserApi as jest.Mock).mockResolvedValueOnce({ user: mockUser });

    const store = makeStore();
    await store.dispatch<any>(getUser());

    const state = (store.getState() as any).user;
    expect(getUserApi).toHaveBeenCalledTimes(1);
    expect(state.user).toEqual(mockUser);
  });

  it('loginUser успех: кладёт user, ставит cookie и refreshToken', async () => {
    (loginUserApi as jest.Mock).mockResolvedValueOnce({
      accessToken: 'Bearer AAA',
      refreshToken: 'RRR',
      user: mockUser
    });

    const store = makeStore();
    await store.dispatch<any>(loginUser({ email: 'e', password: 'p' }));

    const state = (store.getState() as any).user;
    expect(loginUserApi).toHaveBeenCalledTimes(1);
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthChecked).toBe(true);
    expect(document.cookie).toContain('accessToken=AAA');
    expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'RRR');
    expect(state.error).toBeNull();
  });

  it('loginUser ошибка: пишет error из rejectValue', async () => {
    (loginUserApi as jest.Mock).mockRejectedValueOnce(
      new Error('Login failed!')
    );

    const store = makeStore();
    await store.dispatch<any>(loginUser({ email: 'e', password: 'p' }));
    const state = (store.getState() as any).user;

    expect(state.error).toBe('Login failed!');
    expect(state.user).toBeNull();
  });

  it('registerUser успех: аналогично login', async () => {
    (registerUserApi as jest.Mock).mockResolvedValueOnce({
      accessToken: 'Bearer ZZZ',
      refreshToken: 'QQQ',
      user: mockUser
    });

    const store = makeStore();
    await store.dispatch<any>(
      registerUser({ name: 'n', email: 'e', password: 'p' })
    );
    const state = (store.getState() as any).user;

    expect(registerUserApi).toHaveBeenCalledTimes(1);
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthChecked).toBe(true);
    expect(document.cookie).toContain('accessToken=ZZZ');
    expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'QQQ');
  });

  it('updateUser успех: обновляет user', async () => {
    (updateUserApi as jest.Mock).mockResolvedValueOnce({
      user: { name: 'Trinity', email: 't@io' }
    });

    const store = makeStore();
    await store.dispatch<any>(updateUser({ name: 'Trinity' }));
    const state = (store.getState() as any).user;

    expect(updateUserApi).toHaveBeenCalledTimes(1);
    expect(state.user).toEqual({ name: 'Trinity', email: 't@io' });
    expect(state.error).toBeNull();
  });

  it('logout успех: вызывает API и чистит токены', async () => {
    (logoutApi as jest.Mock).mockResolvedValueOnce(undefined);

    const store = makeStore();
    await store.dispatch<any>(logout());

    expect(logoutApi).toHaveBeenCalledTimes(1);
    expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    // clearTokens устанавливает cookie с Max-Age=0
    expect(document.cookie).toContain('accessToken=');
  });

  describe('checkUserAuth сценарии', () => {
    it('успех сразу: getUserApi успешен', async () => {
      (getUserApi as jest.Mock).mockResolvedValueOnce({ user: mockUser });

      const store = makeStore();
      await store.dispatch<any>(checkUserAuth());

      const state = (store.getState() as any).user;
      expect(getUserApi).toHaveBeenCalledTimes(1);
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthChecked).toBe(true);
      expect(state.error).toBeNull();
    });

    it('нет refreshToken: первый вызов падает, isAuthChecked=true, error=null', async () => {
      (getUserApi as jest.Mock).mockRejectedValueOnce(new Error('401'));
      (localStorage.getItem as jest.Mock).mockReturnValueOnce(null);

      const store = makeStore();
      await store.dispatch<any>(checkUserAuth());

      const state = (store.getState() as any).user;
      expect(getUserApi).toHaveBeenCalledTimes(1);
      expect(state.user).toBeNull();
      expect(state.isAuthChecked).toBe(true);
      expect(state.error).toBeNull(); // reason === 'no tokens'
    });

    it('рефреш успешен: первый getUserApi падает, refreshToken есть, затем ok', async () => {
      (getUserApi as jest.Mock)
        .mockRejectedValueOnce(new Error('401')) // первый вызов упал
        .mockResolvedValueOnce({ user: mockUser }); // второй успешный
      (localStorage.getItem as jest.Mock).mockReturnValueOnce('REFRESH');
      (refreshToken as jest.Mock).mockResolvedValueOnce({
        accessToken: 'Bearer NEW',
        refreshToken: 'NEW_REFRESH'
      });

      const store = makeStore();
      await store.dispatch<any>(checkUserAuth());

      const state = (store.getState() as any).user;
      expect(refreshToken).toHaveBeenCalledTimes(1);
      expect(document.cookie).toContain('accessToken=NEW');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'refreshToken',
        'NEW_REFRESH'
      );
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthChecked).toBe(true);
      expect(state.error).toBeNull();
    });

    it('рефреш упал: error=сообщение, user=null, isAuthChecked=true', async () => {
      (getUserApi as jest.Mock).mockRejectedValueOnce(new Error('401'));
      (localStorage.getItem as jest.Mock).mockReturnValueOnce('REFRESH');
      (refreshToken as jest.Mock).mockRejectedValueOnce(
        new Error('refresh broke')
      );

      const store = makeStore();
      await store.dispatch<any>(checkUserAuth());

      const state = (store.getState() as any).user;
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(document.cookie).toContain('accessToken='); // сброшено
      expect(state.user).toBeNull();
      expect(state.isAuthChecked).toBe(true);
      expect(state.error).toBe('refresh broke');
    });
  });
});
