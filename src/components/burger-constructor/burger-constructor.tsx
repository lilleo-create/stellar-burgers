import { FC, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../../services/store';
import { BurgerConstructorUI } from '../ui/burger-constructor';
import { sendOrder, closeOrderModal } from '../../services/slices/orderSlice';
import { TConstructorIngredient } from '../../utils/types';
import { useNavigate } from 'react-router-dom';

export const BurgerConstructor: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const constructorItems = useAppSelector((state) => state.burgerConstructor);
  const orderRequest = useAppSelector((state) => state.order.orderRequest);
  const orderModalData = useAppSelector((state) => state.order.orderModalData);
  const user = useAppSelector((state) => state.user.user);

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

  const onOrderClick = () => {
    if (!constructorItems.bun || orderRequest) return;

    if (!user) {
      navigate('/login', { state: { from: '/' } });
      return;
    }

    const ingredientIds = [
      constructorItems.bun._id,
      ...constructorItems.ingredients.map(
        (item: TConstructorIngredient) => item._id
      ),
      constructorItems.bun._id
    ];

    dispatch(sendOrder(ingredientIds));
  };

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
