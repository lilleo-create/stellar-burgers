import { combineReducers } from '@reduxjs/toolkit';
import ingredientsReducer from './slices/ingredientsSlice';
import order from './slices/orderSlice';
import constructorReducer from './slices/constructorSlice'; 

const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  order,
  constructor: constructorReducer,
});

export default rootReducer;
