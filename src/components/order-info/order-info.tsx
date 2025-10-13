import { FC, useMemo, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient, TOrder } from '@utils-types';
import { useAppSelector, useAppDispatch } from '../../services/store';
import { getFeeds } from '../../services/slices/feedSlice';
import { fetchIngredients } from '../../services/slices/ingredientsSlice';

export const OrderInfo: FC = () => {
  const { number } = useParams<{ number?: string }>();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const ingredients = useAppSelector((state) => state.ingredients.items);
  const feedOrders = useAppSelector((state) => state.feed.orders);
  const isLoading = useAppSelector((state) => state.feed.feedRequest);
  const { isAuthChecked } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (!ingredients.length) {
      dispatch(fetchIngredients());
    }
  }, [dispatch, ingredients.length]);

  useEffect(() => {
    if (!feedOrders.length && number && isAuthChecked) {
      dispatch(getFeeds());
    }
  }, [dispatch, feedOrders.length, number, isAuthChecked]);

  const currentOrder: TOrder | null = useMemo(() => {
    if (feedOrders.length && number) {
      return feedOrders.find((o) => o.number === Number(number)) || null;
    }
    return null;
  }, [feedOrders, number]);

  const orderInfo = useMemo(() => {
    if (!currentOrder || !ingredients.length) return null;

    const date = new Date(currentOrder.createdAt);

    const ingredientsInfo = currentOrder.ingredients.reduce(
      (acc: Record<string, TIngredient & { count: number }>, id) => {
        const ingredient = ingredients.find((ing) => ing._id === id);
        if (ingredient) {
          if (acc[id]) acc[id].count++;
          else acc[id] = { ...ingredient, count: 1 };
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

  if (!isAuthChecked || isLoading || !orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
