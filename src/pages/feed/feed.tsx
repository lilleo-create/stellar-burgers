import { useEffect, useState } from 'react';
import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { getFeeds } from '../../services/slices/feedSlice';

export const Feed = () => {
  const dispatch = useAppDispatch();

  const { orders, feedRequest } = useAppSelector((state) => state.feed);
  const { items: ingredients, isLoading: ingredientsLoading } = useAppSelector(
    (state) => state.ingredients
  );

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    dispatch(getFeeds())
      .unwrap()
      .finally(() => setInitialized(true));
  }, [dispatch]);

  const isLoading =
    feedRequest ||
    ingredientsLoading ||
    !initialized ||
    ingredients.length === 0;

  const isEmpty = initialized && !isLoading && orders.length === 0;

  return (
    <main className='page'>
      {isLoading ? (
        <Preloader key='loader' />
      ) : isEmpty ? (
        <p className='text text_type_main-medium mt-10 ml-10'>Нет заказов</p>
      ) : (
        <FeedUI
          key={`feed-${orders.length}`}
          orders={orders}
          handleGetFeeds={() => dispatch(getFeeds())}
        />
      )}
    </main>
  );
};
