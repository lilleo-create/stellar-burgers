import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchIngredientsApi } from '../../utils/burger-api';
import { TIngredient } from '../../utils/types';

export const fetchIngredients = createAsyncThunk(
  'ingredients/fetchIngredients',
  async () => {
    console.log('→ fetchIngredients вызван');
    const res = await fetchIngredientsApi();
    console.log('→ Ответ API:', res);
    return res;
  }
);

export interface IngredientsState {
  items: TIngredient[];
  isLoading: boolean;
  error: string | null;
  currentIngredient: TIngredient | null;
}

const initialState: IngredientsState = {
  items: [],
  isLoading: false,
  error: null,
  currentIngredient: null
};

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchIngredients.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.error.message || 'Ошибка при загрузке ингредиентов';
      });
  }
});

export default ingredientsSlice.reducer;
