import { FC, memo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../services/store';
import { addIngredient, setBun } from '../../services/slices/constructorSlice';
import { BurgerIngredientUI } from '@ui';
import { TBurgerIngredientProps } from './type';
import { TIngredient, TConstructorIngredient } from '@utils-types';

export const BurgerIngredient: FC<TBurgerIngredientProps> = memo(
  ({ ingredient, count }) => {
    const location = useLocation();
    const dispatch = useAppDispatch();

    const handleAdd = () => {
      if (ingredient.type === 'bun') {
        // 🧩 кастим TIngredient → TConstructorIngredient, чтобы TS не ругался
        dispatch(setBun(ingredient as TConstructorIngredient));
      } else {
        dispatch(addIngredient(ingredient as TConstructorIngredient));
      }
    };

    return (
      <BurgerIngredientUI
        ingredient={ingredient}
        count={count}
        locationState={{ background: location }}
        handleAdd={handleAdd}
      />
    );
  }
);
