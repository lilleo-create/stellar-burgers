import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';
import { TConstructorIngredient } from '../../utils/types';

type TConstructorItem = TConstructorIngredient & { uuid: string };

type ConstructorState = {
  bun: TConstructorIngredient | null;
  ingredients: TConstructorItem[];
};

export const initialState: ConstructorState = {
  bun: null,
  ingredients: []
};

const burgerConstructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    setBun(state, action: PayloadAction<TConstructorIngredient>) {
      state.bun = action.payload;
    },

    addIngredient: {
      reducer(state, action: PayloadAction<TConstructorItem>) {
        state.ingredients.push(action.payload);
      },
      prepare(ingredient: TConstructorIngredient) {
        return { payload: { ...ingredient, uuid: nanoid() } };
      }
    },

    removeIngredient(state, action: PayloadAction<string>) {
      state.ingredients = state.ingredients.filter(
        (item) => item.uuid !== action.payload
      );
    },

    moveIngredient(
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>
    ) {
      const { fromIndex, toIndex } = action.payload;
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= state.ingredients.length ||
        toIndex >= state.ingredients.length
      )
        return;

      const [dragged] = state.ingredients.splice(fromIndex, 1);
      state.ingredients.splice(toIndex, 0, dragged);
    },

    clearConstructor(state) {
      state.bun = null;
      state.ingredients = [];
    }
  }
});

export const {
  setBun,
  addIngredient,
  removeIngredient,
  clearConstructor,
  moveIngredient
} = burgerConstructorSlice.actions;

export default burgerConstructorSlice.reducer;
