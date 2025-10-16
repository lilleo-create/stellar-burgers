import { setCookie, getCookie } from './cookie';
import { TIngredient, TOrder, TUser, TUserResponse } from './types';

const URL =
  process.env.REACT_APP_BURGER_API_URL ||
  'https://norma.nomoreparties.space/api';

const checkResponse = async <T>(res: unknown): Promise<T> => {
  const response = res as Response;

  let data: any;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const message =
      typeof data?.message === 'string'
        ? data.message
        : `Ошибка ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  return data as T;
};

// ======================== REFRESH TOKEN ========================
type TRefreshResponse = {
  success: boolean;
  refreshToken: string;
  accessToken: string;
};

export const refreshToken = (): Promise<TRefreshResponse> =>
  fetch(`${URL}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json;charset=utf-8' },
    body: JSON.stringify({ token: localStorage.getItem('refreshToken') })
  }).then((res) => checkResponse<TRefreshResponse>(res));

export const fetchWithRefresh = async <T>(
  url: string,
  options: RequestInit
): Promise<T> => {
  try {
    const res = await fetch(url, options);
    return await checkResponse<T>(res);
  } catch (err: any) {
    const msg = String(err?.message || '').toLowerCase();

    // Триггеры для рефреша:
    const shouldRefresh =
      msg.includes('jwt expired') ||
      msg.includes('jwt malformed') ||
      msg.includes('you should be authorised') || // частое сообщение у /auth/user
      msg.includes('not authorized') ||
      msg.includes('forbidden'); // на всякий случай

    if (shouldRefresh) {
      const refreshData = await refreshToken();
      // сохранить новые токены
      localStorage.setItem('refreshToken', refreshData.refreshToken);
      const access = refreshData.accessToken.startsWith('Bearer ')
        ? refreshData.accessToken.split('Bearer ')[1]
        : refreshData.accessToken;
      setCookie('accessToken', access);

      // повтор запроса с новым токеном
      const res2 = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${access}`
        }
      });
      return await checkResponse<T>(res2);
    }

    return Promise.reject(err);
  }
};

// ======================== AUTH ========================
export const registerUserApi = (data: {
  name: string;
  email: string;
  password: string;
}) =>
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

export const loginUserApi = (data: { email: string; password: string }) =>
  fetch(`${URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json;charset=utf-8' },
    body: JSON.stringify(data)
  })
    .then((res) => checkResponse<any>(res))
    .then((data) => {
      fetchWithRefresh;
      if (data.success) {
        setCookie('accessToken', data.accessToken.split('Bearer ')[1]);
        localStorage.setItem('refreshToken', data.refreshToken);
        return data;
      }
      return Promise.reject(data);
    });

export const getUserApi = (): Promise<TUserResponse> => {
  const access = getCookie('accessToken'); // чистый токен (без "Bearer")
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (access) headers.Authorization = `Bearer ${access}`; // НЕ добавляем, если токена нет

  // важно: через fetchWithRefresh, чтобы сработал рефреш при невалидном токене
  return fetchWithRefresh<TUserResponse>(`${URL}/auth/user`, {
    method: 'GET',
    headers
  });
};

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
    body: JSON.stringify({ token: localStorage.getItem('refreshToken') })
  }).then((res) => checkResponse<any>(res));

// ======================== PASSWORD ========================
export const forgotPasswordApi = (data: { email: string }) =>
  fetch(`${URL}/password-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json;charset=utf-8' },
    body: JSON.stringify(data)
  }).then((res) => checkResponse<any>(res));

export const resetPasswordApi = (data: { password: string; token: string }) =>
  fetch(`${URL}/password-reset/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json;charset=utf-8' },
    body: JSON.stringify(data)
  }).then((res) => checkResponse<any>(res));

// ======================== INGREDIENTS ========================
export const fetchIngredientsApi = async (): Promise<TIngredient[]> => {
  const res = await fetch(`${URL}/ingredients`);
  const data = await checkResponse<{ data: TIngredient[] }>(res);
  return data.data;
};

// ======================== ORDERS ========================
export const orderBurgerApi = (ingredients: string[]) =>
  fetchWithRefresh<{ order: TOrder }>(`${URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      Authorization: 'Bearer ' + getCookie('accessToken')
    },
    body: JSON.stringify({ ingredients })
  });

// ======================== FEED ========================
export const getFeedsApi = () =>
  fetch(`${URL}/orders/all`).then((res) =>
    checkResponse<{ orders: TOrder[]; total: number; totalToday: number }>(res)
  );
