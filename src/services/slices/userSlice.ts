import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  getUserApi,
  loginUserApi,
  registerUserApi,
  updateUserApi,
  logoutApi,
  refreshToken as refreshTokenApi,
  forgotPasswordApi,
  resetPasswordApi
} from '../../utils/burger-api';
import { TUser } from '../../utils/types';

type UserState = {
  user: TUser | null;
  isAuthChecked: boolean;
  error: string | null;
};

export const initialState: UserState = {
  user: null,
  isAuthChecked: false,
  error: null
};

/** Кладём в cookie «чистый» access (без "Bearer ") */
const setAccessCookie = (accessToken: string) => {
  const pure = accessToken.startsWith('Bearer ')
    ? accessToken.split('Bearer ')[1]
    : accessToken;
  document.cookie = `accessToken=${pure}; path=/;`;
  return pure;
};

const clearTokens = () => {
  localStorage.removeItem('refreshToken');
  document.cookie = 'accessToken=; Max-Age=0; path=/;';
};

/** Автологин: пробуем /auth/user; если access мёртв — рефрешим и повторяем */
export const checkUserAuth = createAsyncThunk<
  TUser,
  void,
  { rejectValue: string }
>('user/checkAuth', async (_, { rejectWithValue }) => {
  try {
    const res1 = (await getUserApi()) as { user: TUser };
    return res1.user;
  } catch (err: any) {
    const refresh = localStorage.getItem('refreshToken');
    if (!refresh) {
      return rejectWithValue('no tokens');
    }
    try {
      const data = await refreshTokenApi();
      setAccessCookie(data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      const res2 = (await getUserApi()) as { user: TUser };
      return res2.user;
    } catch (e: any) {
      clearTokens();
      return rejectWithValue(e?.message || 'refresh failed');
    }
  }
});

export const loginUser = createAsyncThunk<
  TUser,
  { email: string; password: string },
  { rejectValue: string }
>('user/login', async (formData, { rejectWithValue }) => {
  try {
    const res: any = await loginUserApi(formData);
    if (res?.accessToken) setAccessCookie(res.accessToken);
    if (res?.refreshToken)
      localStorage.setItem('refreshToken', res.refreshToken);
    return res.user as TUser;
  } catch (e: any) {
    return rejectWithValue(e?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk<
  TUser,
  { name: string; email: string; password: string },
  { rejectValue: string }
>('user/register', async (formData, { rejectWithValue }) => {
  try {
    const res: any = await registerUserApi(formData);
    if (res?.accessToken) setAccessCookie(res.accessToken);
    if (res?.refreshToken)
      localStorage.setItem('refreshToken', res.refreshToken);
    return res.user as TUser;
  } catch (e: any) {
    return rejectWithValue(e?.message || 'Registration failed');
  }
});

export const getUser = createAsyncThunk<TUser, void, { rejectValue: string }>(
  'user/getUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = (await getUserApi()) as { user: TUser };
      return res.user;
    } catch (e: any) {
      return rejectWithValue(e?.message || 'Get user failed');
    }
  }
);

export const updateUser = createAsyncThunk<
  TUser,
  Partial<TUser>,
  { rejectValue: string }
>('user/update', async (formData, { rejectWithValue }) => {
  try {
    const res = (await updateUserApi(formData)) as { user: TUser };
    return res.user;
  } catch (e: any) {
    return rejectWithValue(e?.message || 'Update failed');
  }
});

export const logout = createAsyncThunk('user/logout', async () => {
  try {
    await logoutApi();
  } finally {
    clearTokens();
  }
});

/** Восстановление/сброс пароля */
export const forgotPassword = createAsyncThunk<
  void,
  { email: string },
  { rejectValue: string }
>('user/forgotPassword', async ({ email }, { rejectWithValue }) => {
  try {
    await forgotPasswordApi({ email });
  } catch (e: any) {
    return rejectWithValue(e?.message || 'Не удалось отправить письмо');
  }
});

export const resetPassword = createAsyncThunk<
  void,
  { password: string; token: string },
  { rejectValue: string }
>('user/resetPassword', async ({ password, token }, { rejectWithValue }) => {
  try {
    await resetPasswordApi({ password, token });
  } catch (e: any) {
    return rejectWithValue(e?.message || 'Не удалось сменить пароль');
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<TUser | null>) {
      state.user = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(getUser.rejected, (state) => {
        state.user = null;
      })

      .addCase(checkUserAuth.pending, (state) => {
        state.isAuthChecked = false;
      })
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthChecked = true;
        state.error = null;
      })
      .addCase(checkUserAuth.rejected, (state, action) => {
        state.user = null;
        state.isAuthChecked = true;

        const reason = action.payload as string | undefined;

        if (reason === 'no tokens') {
          state.error = null;
        } else {
          state.error = reason || 'Auth failed';
        }
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
        state.isAuthChecked = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
        state.isAuthChecked = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthChecked = true;
      });
  }
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
