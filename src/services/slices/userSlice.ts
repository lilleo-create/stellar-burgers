import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  getUserApi,
  loginUserApi,
  registerUserApi,
  updateUserApi,
  logoutApi
} from '../../utils/burger-api';
import { TUser } from '../../utils/types';

// Тип состояния
type UserState = {
  user: TUser | null;
  isAuthChecked: boolean;
  error: string | null;
};

const initialState: UserState = {
  user: null,
  isAuthChecked: false,
  error: null
};

//
// === Проверка авторизации при загрузке приложения ===
//
export const checkUserAuth = createAsyncThunk(
  'user/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getUserApi(); // ✅ вызываем API напрямую
      return res.user;
    } catch (err) {
      return rejectWithValue('Auth check failed');
    }
  }
);

//
// === Логин ===
//
export const loginUser = createAsyncThunk(
  'user/login',
  async (
    formData: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await loginUserApi(formData);
      return res.user;
    } catch (err) {
      return rejectWithValue('Login failed');
    }
  }
);

//
// === Регистрация ===
//
export const registerUser = createAsyncThunk(
  'user/register',
  async (
    formData: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await registerUserApi(formData);
      return res.user;
    } catch (err) {
      return rejectWithValue('Registration failed');
    }
  }
);

//
// === Обновление данных профиля ===
//
export const updateUser = createAsyncThunk(
  'user/update',
  async (formData: Partial<TUser>, { rejectWithValue }) => {
    try {
      const res = await updateUserApi(formData);
      return res.user;
    } catch (err) {
      return rejectWithValue('Update failed');
    }
  }
);

//
// === Логаут ===
//
export const logout = createAsyncThunk('user/logout', async () => {
  await logoutApi();
  localStorage.removeItem('refreshToken');
  document.cookie =
    'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
});

//
// === Slice ===
//
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
      // checkAuth
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(checkUserAuth.rejected, (state) => {
        state.user = null;
        state.isAuthChecked = true;
      })

      // login
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // register
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // update
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      });
  }
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
