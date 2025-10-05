// src/pages/constructor-page/constructor-page.tsx
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { fetchIngredients } from '../../services/slices/ingredientsSlice';

import styles from './constructor-page.module.css';
import { BurgerIngredients } from '../../components';
import { BurgerConstructor } from '../../components';
import { Preloader } from '../../components/ui';

export const ConstructorPage = () => {
  const dispatch = useAppDispatch();
  const { items, isLoading, error } = useAppSelector(
    (state) => state.ingredients
  );

  useEffect(() => {
    dispatch(fetchIngredients());
  }, [dispatch]);

  if (isLoading) return <Preloader />;
  if (error)
    return <p className='text text_type_main-default text-center'>{error}</p>;

  return (
    <main className={styles.containerMain}>
      <h1
        className={`${styles.title} text text_type_main-large mt-10 mb-5 pl-5`}
      >
        Соберите бургер
      </h1>
      <div className={`${styles.main} pl-5 pr-5`}>
        <BurgerIngredients />
        <BurgerConstructor />
      </div>
    </main>
  );
};
export default ConstructorPage;
