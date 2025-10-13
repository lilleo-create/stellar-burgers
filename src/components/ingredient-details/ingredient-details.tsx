import { FC, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../services/store';
import { Preloader } from '../ui/preloader';
import { IngredientDetailsUI } from '../ui/ingredient-details';
import { TIngredient } from '../../utils/types';
import { fetchIngredients } from '../../services/slices/ingredientsSlice';

export const IngredientDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const {
    items: ingredients,
    isLoading,
    error
  } = useAppSelector((state) => state.ingredients);

  useEffect(() => {
    if (ingredients.length === 0) {
      dispatch(fetchIngredients());
    }
  }, [dispatch, ingredients.length]);

  const ingredientData: TIngredient | undefined = ingredients.find(
    (item) => item._id === id
  );

  if (isLoading || !ingredientData) {
    return <Preloader />;
  }

  if (error) {
    return (
      <p className='text text_type_main-default text_color_inactive'>
        Ошибка загрузки ингредиентов: {error}
      </p>
    );
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
