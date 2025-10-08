import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import ingredientsReducer from './slices/ingredientsSlice';
import constructorReducer from './slices/constructorSlice';
import orderReducer from './slices/orderSlice';
import feedReducer from './slices/feedSlice';
import userReducer from './slices/userSlice'; // ✅ проверь, чтобы путь совпадал

export const store = configureStore({
  reducer: {
    ingredients: ingredientsReducer,
    burgerConstructor: constructorReducer,
    order: orderReducer,
    feed: feedReducer,
    user: userReducer // ✅ теперь поле user зарегистрировано
  },
  devTools: process.env.NODE_ENV !== 'production'
});

// Типы и хуки
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
