import { TConstructorIngredient } from '@utils-types';

export type TConstructorItem = TConstructorIngredient & { uuid: string };

export type BurgerConstructorElementProps = {
  ingredient: TConstructorItem;
  index: number;
  totalItems: number;
};
