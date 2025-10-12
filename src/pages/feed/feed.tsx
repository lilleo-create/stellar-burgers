import { useEffect, useState } from 'react';
import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { getFeeds } from '../../services/slices/feedSlice';
import { fetchIngredients } from '../../services/slices/ingredientsSlice';

export const Feed = () => {
  const dispatch = useAppDispatch();

  // 🧠 Достаём нужные данные из стора
  const { orders, feedRequest } = useAppSelector((state) => state.feed);
  const { items: ingredients, isLoading: ingredientsLoading } = useAppSelector(
    (state) => state.ingredients
  );

  const [initialized, setInitialized] = useState(false);

  // 🚀 Загружаем ингредиенты и заказы при первом монтировании
  useEffect(() => {
    console.log('📡 [Feed] Монтирование — запуск загрузки данных');
    // Грузим ингредиенты, если их нет
    if (!ingredients.length) {
      dispatch(fetchIngredients());
    }
    // Грузим заказы
    dispatch(getFeeds())
      .unwrap()
      .finally(() => {
        setInitialized(true);
      });
  }, [dispatch]);

  // 🔍 Проверяем состояния
  const isLoading =
    feedRequest || ingredientsLoading || !initialized || !ingredients.length;
  const isEmpty = initialized && !isLoading && orders.length === 0;

  console.log('🧩 Feed render:', {
    feedRequest,
    ingredientsLoading,
    initialized,
    ordersCount: orders.length,
    ingredientsCount: ingredients.length
  });

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
