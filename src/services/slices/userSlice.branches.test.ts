import { configureStore } from '@reduxjs/toolkit';
import reducer, {
  initialState as userInitial,
  loginUser,
  registerUser,
  checkUserAuth,
  logout
} from './userSlice';

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
  logoutApi,
  refreshToken,
  forgotPasswordApi,
  resetPasswordApi
} from '../../utils/burger-api';

const makeStore = () => configureStore({ reducer: { user: reducer } });
const mockUser = { name: 'Max', email: 'm@x' } as any;

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

test('initial state совпадает с экспортируемым initialState из слайса', () => {
  const state = reducer(undefined, { type: 'unknown' });
  expect(state).toEqual(userInitial);
});

test('loginUser: accessToken без "Bearer " записывается как есть', async () => {
  (loginUserApi as jest.Mock).mockResolvedValueOnce({
    accessToken: 'RAW',
    refreshToken: 'R',
    user: mockUser
  });
  const store = makeStore();
  await store.dispatch<any>(loginUser({ email: 'e', password: 'p' }));
  expect(document.cookie).toContain('accessToken=RAW');
});

test('registerUser: accessToken без "Bearer "', async () => {
  (registerUserApi as jest.Mock).mockResolvedValueOnce({
    accessToken: 'PLAIN',
    refreshToken: 'Q',
    user: mockUser
  });
  const store = makeStore();
  await store.dispatch<any>(
    registerUser({ name: 'n', email: 'e', password: 'p' } as any)
  );
  expect(document.cookie).toContain('accessToken=PLAIN');
});

test('checkUserAuth.rejected без reason => error="Auth failed"', async () => {
  const state = reducer(undefined, {
    type: checkUserAuth.rejected.type
  } as any);
  expect(state.isAuthChecked).toBe(true);
  expect(state.user).toBeNull();
  expect(state.error).toBe('Auth failed');
});

test('forgotPassword: успех и ошибка (покрываем try/catch в thunk)', async () => {
  (forgotPasswordApi as jest.Mock).mockResolvedValueOnce(undefined);
  (forgotPasswordApi as jest.Mock).mockRejectedValueOnce(
    new Error('mail error')
  );

  const mod = await import('./userSlice');
  const store = makeStore();
  await store.dispatch<any>(mod.forgotPassword({ email: 'a@a' }));
  await store.dispatch<any>(mod.forgotPassword({ email: 'a@a' }));
});

test('resetPassword: успех и ошибка (try/catch в thunk)', async () => {
  (resetPasswordApi as jest.Mock).mockResolvedValueOnce(undefined);
  (resetPasswordApi as jest.Mock).mockRejectedValueOnce(
    new Error('reset error')
  );

  const mod = await import('./userSlice');
  const store = makeStore();
  await store.dispatch<any>(mod.resetPassword({ password: 'x', token: 't' }));
  await store.dispatch<any>(mod.resetPassword({ password: 'x', token: 't' }));
});

test('logout: даже при ошибке API токены чистятся в finally', async () => {
  (logoutApi as jest.Mock).mockRejectedValueOnce(new Error('server down'));
  const store = makeStore();
  await store.dispatch<any>(logout());
  expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
  expect(document.cookie).toContain('accessToken=');
});
