import { useEffect } from 'react';
import { ProfileOrdersUI } from '@ui-pages';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { getFeeds } from '../../services/slices/feedSlice';
import { Preloader } from '../../components/ui/preloader';

export const ProfileOrders = () => {
  const dispatch = useAppDispatch();

  const { user, isAuthChecked } = useAppSelector((state) => state.user);
  const { orders, feedRequest, error } = useAppSelector((state) => state.feed);

  useEffect(() => {
    if (isAuthChecked && user && !orders.length) {
      dispatch(getFeeds());
    }
  }, [dispatch, isAuthChecked, user, orders.length]);

  if (!isAuthChecked || feedRequest) {
    return <Preloader />;
  }

  if (error) {
    return (
      <p className='text text_type_main-default text_color_inactive'>
        Ошибка загрузки заказов: {error}
      </p>
    );
  }

  return <ProfileOrdersUI orders={orders || []} />;
};
