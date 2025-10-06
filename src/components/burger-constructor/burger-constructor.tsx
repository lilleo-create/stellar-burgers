// src/components/burger-constructor/burger-constructor.tsx
import { FC, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../../services/store';
import { BurgerConstructorUI } from '../ui/burger-constructor';
import { sendOrder, closeOrderModal } from '../../services/slices/orderSlice';

export const BurgerConstructor: FC = () => {
  const dispatch = useAppDispatch();

  // ✅ Берём данные из state.constructor (не state.constructorItems!)
  const constructorItems = useAppSelector((state) => state.constructor);
  const orderRequest = useAppSelector((state) => state.order.orderRequest);
  const orderModalData = useAppSelector((state) => state.order.orderModalData);

  // ✅ Считаем цену с типизацией
  const price = useMemo(() => {
    const bunPrice = constructorItems.bun ? constructorItems.bun.price * 2 : 0;
    const ingredientsPrice = constructorItems.ingredients.reduce(
      (sum: number, item) => sum + item.price,
      0
    );
    return bunPrice + ingredientsPrice;
  }, [constructorItems]);

  // ✅ Отправка заказа
  const onOrderClick = () => {
    if (!constructorItems.bun || orderRequest) return;

    const ingredientIds = [
      constructorItems.bun._id,
      ...constructorItems.ingredients.map((item) => item._id),
      constructorItems.bun._id
    ];

    dispatch(sendOrder(ingredientIds));
  };

  // ✅ Закрыть модалку
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
