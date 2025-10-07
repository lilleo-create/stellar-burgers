// src/components/burger-constructor/burger-constructor.tsx
import { FC, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../../services/store';
import { BurgerConstructorUI } from '../ui/burger-constructor';
import { sendOrder, closeOrderModal } from '../../services/slices/orderSlice';
import { TConstructorIngredient } from '../../utils/types';

export const BurgerConstructor: FC = () => {
  const dispatch = useAppDispatch();

  // Берём из стора конструктор, запрос и данные модалки
  const constructorItems = useAppSelector((state) => state.burgerConstructor);
  const orderRequest = useAppSelector((state) => state.order.orderRequest);
  const orderModalData = useAppSelector((state) => state.order.orderModalData);

  // Безопасно считаем цену
  const price = useMemo(() => {
    const bunPrice = constructorItems?.bun ? constructorItems.bun.price * 2 : 0;
    const ingredientsPrice = Array.isArray(constructorItems?.ingredients)
      ? constructorItems.ingredients.reduce(
          (sum: number, item: TConstructorIngredient) => sum + item.price,
          0
        )
      : 0;
    return bunPrice + ingredientsPrice;
  }, [constructorItems]);

  // Отправка заказа
  const onOrderClick = () => {
    if (!constructorItems.bun || orderRequest) return;

    const ingredientIds = [
      constructorItems.bun._id,
      ...constructorItems.ingredients.map(
        (item: TConstructorIngredient) => item._id
      ),
      constructorItems.bun._id
    ];

    dispatch(sendOrder(ingredientIds));
  };

  // Закрытие модалки
  const handleCloseModal = () => {
    dispatch(closeOrderModal());
  };

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={handleCloseModal}
    />
  );
};
