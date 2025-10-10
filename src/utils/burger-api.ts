import { setCookie, getCookie } from './cookie';
import { TIngredient, TOrder, TUser } from './types';

const URL = process.env.REACT_APP_BURGER_API_URL!;

// ================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==================

const checkResponse = async <T>(res: Response): Promise<T> => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof (data as any).message === 'string'
        ? (data as any).message
        : `Ошибка ${res.status}: ${res.statusText}`;
    throw new Error(message);
  }
  return data;
};

type TServerResponse<T> = {
  success: boolean;
} & T;

// тип ответа при обновлении токена
type TRefreshResponse = TServerResponse<{
  refreshToken: string;
  accessToken: string;
}>;

// ================== ОБНОВЛЕНИЕ ТОКЕНА ==================

export const refreshToken = (): Promise<TRefreshResponse> =>
  fetch(`${URL}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json;charset=utf-8' },
    body: JSON.stringify({
      token: localStorage.getItem('refreshToken')
    })
  }).then((res) => checkResponse<TRefreshResponse>(res));

// ================== ОБЕРТКА С ОБНОВЛЕНИЕМ ТОКЕНА ==================

export const fetchWithRefresh = async <T>(
  url: string,
  options: RequestInit
): Promise<T> => {
  try {
    const res = await fetch(url, options);
    return await checkResponse<T>(res);
  } catch (err: any) {
    if (err.message === 'jwt expired' || err.message === 'jwt malformed') {
      const refreshData = await refreshToken();

      if (!refreshData.success) return Promise.reject(refreshData);

      localStorage.setItem('refreshToken', refreshData.refreshToken);
      setCookie('accessToken', refreshData.accessToken.split('Bearer ')[1]);

      const res = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: refreshData.accessToken
        }
      });

      return await checkResponse<T>(res);
    } else {
      return Promise.reject(err);
    }
  }
};

// ================== АВТОРИЗАЦИЯ ==================

export type TRegisterData = {
  name: string;
  email: string;
  password: string;
};

export const registerUserApi = (data: TRegisterData) =>
  fetch(`${URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json;charset=utf-8' },
    body: JSON.stringify(data)
  })
    .then((res) => checkResponse<any>(res))
    .then((data) => {
      if (data.success) {
        setCookie('accessToken', data.accessToken.split('Bearer ')[1]);
        localStorage.setItem('refreshToken', data.refreshToken);
        return data;
      }
      return Promise.reject(data);
    });

export type TLoginData = {
  email: string;
  password: string;
};

export const loginUserApi = (data: TLoginData) =>
  fetch(`${URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json;charset=utf-8' },
    body: JSON.stringify(data)
  })
    .then((res) => checkResponse<any>(res))
    .then((data) => {
      if (data.success) {
        setCookie('accessToken', data.accessToken.split('Bearer ')[1]);
        localStorage.setItem('refreshToken', data.refreshToken);
        return data;
      }
      return Promise.reject(data);
    });

// ================== ПРОФИЛЬ ==================

export const getUserApi = () =>
  fetchWithRefresh(`${URL}/auth/user`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      Authorization: 'Bearer ' + getCookie('accessToken')
    }
  });

export const updateUserApi = (data: Partial<TUser>) =>
  fetchWithRefresh(`${URL}/auth/user`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      Authorization: 'Bearer ' + getCookie('accessToken')
    },
    body: JSON.stringify(data)
  });

export const logoutApi = () =>
  fetch(`${URL}/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json;charset=utf-8' },
    body: JSON.stringify({
      token: localStorage.getItem('refreshToken')
    })
  }).then((res) => checkResponse<any>(res));
