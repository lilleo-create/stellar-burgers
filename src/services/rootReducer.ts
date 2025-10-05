import { combineReducers } from '@reduxjs/toolkit';
import ingredientsReducer from './slices/ingredientsSlice';

const rootReducer = combineReducers({
  ingredients: ingredientsReducer
});

export default rootReducer;
