import { TConstructorIngredient, TOrder } from '@utils-types';

export type TConstructorItem = TConstructorIngredient & { uuid: string };

export type BurgerConstructorUIProps = {
  constructorItems: {
    bun: TConstructorIngredient | null;
    ingredients: TConstructorItem[];
  };
  orderRequest: boolean;
  price: number;
  orderModalData: TOrder | null;
  onOrderClick: () => void;
  closeOrderModal: () => void;

  onRemoveIngredient: (uuid: string) => void;
  onMoveIngredient: (fromIndex: number, toIndex: number) => void;
};
