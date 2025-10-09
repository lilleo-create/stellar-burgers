// src/pages/feed/feed.tsx
import { FC, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../services/hooks';
import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { getFeeds } from '../../services/slices/feedSlice';

export const Feed: FC = () => {
  const dispatch = useAppDispatch();
  const { orders, feedRequest } = useAppSelector((state) => state.feed);
  useEffect(() => {
    console.log('Feed rendered');
  }, []);

  // Загружаем ленту заказов
  useEffect(() => {
    dispatch(getFeeds());
  }, [dispatch]);

  if (feedRequest || !orders.length) {
    return <Preloader />;
  }

  return <FeedUI orders={orders} handleGetFeeds={() => dispatch(getFeeds())} />;
};
