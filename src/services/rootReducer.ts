import { combineReducers } from '@reduxjs/toolkit';
import ingredientsReducer from './slices/ingredientsSlice';
import orderReducer from './slices/orderSlice';
import burgerConstructorReducer from './slices/constructorSlice'; // ⬅️ импорт переименован
import feedReducer from './slices/feedSlice';

const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  order: orderReducer,
  burgerConstructor: burgerConstructorReducer, // ⬅️ не 'constructor'
  feed: feedReducer
});

export default rootReducer;
