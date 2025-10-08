import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../services/store';
import { Preloader } from '../ui/preloader';
import { IngredientDetailsUI } from '../ui/ingredient-details';
import { TIngredient } from '../../utils/types';

export const IngredientDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const ingredients = useAppSelector((state) => state.ingredients.items);

  const ingredientData = ingredients.find(
    (item: TIngredient) => item._id === id
  );

  if (!ingredientData) {
    return <Preloader />;
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
