import { FC, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient, TOrder } from '@utils-types';
import { useAppSelector, useAppDispatch } from '../../services/store';
import { getFeeds } from '../../services/slices/feedSlice';

export const OrderInfo: FC = () => {
  const { number } = useParams<{ number?: string }>();
  const dispatch = useAppDispatch();

  const orderData = useAppSelector((state) => state.order.orderData);
  const feedOrders = useAppSelector((state) => state.feed.orders);
  const ingredients = useAppSelector((state) => state.ingredients.items);

  // если в feed.orders пусто — подгружаем
  useEffect(() => {
    if (!feedOrders.length && number) {
      dispatch(getFeeds());
    }
  }, [dispatch, feedOrders.length, number]);

  // выбираем источник данных
  const currentOrder: TOrder | null = useMemo(() => {
    if (orderData) return orderData;
    if (number && feedOrders.length) {
      return feedOrders.find((o) => o.number === Number(number)) || null;
    }
    return null;
  }, [orderData, feedOrders, number]);

  // собираем подробную инфу
  const orderInfo = useMemo(() => {
    if (!currentOrder || !ingredients.length) return null;

    const date = new Date(currentOrder.createdAt);

    const ingredientsInfo = currentOrder.ingredients.reduce(
      (acc: Record<string, TIngredient & { count: number }>, item) => {
        const ingredient = ingredients.find((ing) => ing._id === item);
        if (ingredient) {
          if (acc[item]) acc[item].count++;
          else acc[item] = { ...ingredient, count: 1 };
        }
        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...currentOrder,
      ingredientsInfo,
      date,
      total
    };
  }, [currentOrder, ingredients]);

  if (!orderInfo) return <Preloader />;

  return <OrderInfoUI orderInfo={orderInfo} />;
};
