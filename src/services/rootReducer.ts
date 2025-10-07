import { combineReducers } from '@reduxjs/toolkit';
import ingredientsReducer from './slices/ingredientsSlice';
import orderReducer from './slices/orderSlice';
import constructorReducer from './slices/constructorSlice';
import feedReducer from './slices/feedSlice';

const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  order: orderReducer,
  constructor: constructorReducer,
  feed: feedReducer
});
console.log(
  '✅ rootReducer keys:',
  Object.keys(rootReducer(undefined, { type: '' }))
);

export default rootReducer;
