import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TConstructorIngredient, TOrder } from '../../utils/types';

// 🔹 Тип состояния конструктора
interface ConstructorState {
  bun: TConstructorIngredient | null;
  ingredients: TConstructorIngredient[];
  orderRequest: boolean;
  orderModalData: TOrder | null;
}

// 🔹 Начальное состояние
const initialState: ConstructorState = {
  bun: null,
  ingredients: [],
  orderRequest: false,
  orderModalData: null
};

// 🔹 Срез состояния (slice)
const constructorSlice = createSlice({
  name: 'constructor',
  initialState,
  reducers: {
    // Устанавливаем булку
    setBun(state, action: PayloadAction<TConstructorIngredient>) {
      state.bun = action.payload;
    },

    // Добавляем ингредиент
    addIngredient(state, action: PayloadAction<TConstructorIngredient>) {
      state.ingredients.push(action.payload);
    },

    // Удаляем ингредиент по id
    removeIngredient(state, action: PayloadAction<string>) {
      state.ingredients = state.ingredients.filter(
        (item) => item._id !== action.payload
      );
    },

    // Полностью очищаем конструктор
    clearConstructor(state) {
      state.bun = null;
      state.ingredients = [];
      state.orderRequest = false;
      state.orderModalData = null;
    },

    // Устанавливаем флаг загрузки заказа
    setOrderRequest(state, action: PayloadAction<boolean>) {
      state.orderRequest = action.payload;
    },

    // Сохраняем данные заказа для модалки
    setOrderModalData(state, action: PayloadAction<TOrder | null>) {
      state.orderModalData = action.payload;
    }
  }
});

// 🔹 Экспорт экшенов
export const {
  setBun,
  addIngredient,
  removeIngredient,
  clearConstructor,
  setOrderRequest,
  setOrderModalData
} = constructorSlice.actions;

// 🔹 Экспорт редьюсера по умолчанию
export default constructorSlice.reducer;
