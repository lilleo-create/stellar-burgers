import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import {
  getUserApi,
  loginUserApi,
  registerUserApi,
  updateUserApi,
  logoutApi
} from '../../utils/burger-api';
import { TUser } from '../../utils/types';

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

export const checkUserAuth = createAsyncThunk(
  'user/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const res = (await getUserApi()) as { user: TUser };
      return res.user;
    } catch (err: any) {
      console.warn('❌ Auth check failed:', err);

      if (
        err?.message?.includes('jwt expired') ||
        err?.message?.includes('invalid token') ||
        err?.message?.includes('token missing')
      ) {
        localStorage.removeItem('refreshToken');
        document.cookie = 'accessToken=; Max-Age=0; path=/;';
      }

      return rejectWithValue('Auth failed');
    }
  }
);

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
export const getUser = createAsyncThunk(
  'user/getUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = (await getUserApi()) as { user: TUser };
      return res.user;
    } catch (err) {
      return rejectWithValue('Get user failed');
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/update',
  async (formData: Partial<TUser>, { rejectWithValue }) => {
    try {
      const res = (await getUserApi()) as { user: TUser };
      return res.user;
    } catch (err) {
      return rejectWithValue('Update failed');
    }
  }
);

export const logout = createAsyncThunk('user/logout', async () => {
  await logoutApi();
  localStorage.removeItem('refreshToken');
  document.cookie =
    'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
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

      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(checkUserAuth.rejected, (state) => {
        state.user = null;
        state.isAuthChecked = true;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
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
      });
  }
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
