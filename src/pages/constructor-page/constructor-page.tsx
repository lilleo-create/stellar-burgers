import { FC, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { fetchIngredients } from '../../services/slices/ingredientsSlice';

import styles from './constructor-page.module.css';
import { BurgerIngredients } from '../../components';
import { BurgerConstructor } from '../../components';
import { Preloader } from '../../components/ui';

export const ConstructorPage: FC = () => {
  const dispatch = useAppDispatch();
  const { items, isLoading, error } = useAppSelector(
    (state) => state.ingredients
  );

  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchIngredients());
    }
  }, [dispatch, items.length]);

  return (
    <main className={styles.containerMain}>
      <h1
        className={`${styles.title} text text_type_main-large mt-10 mb-5 pl-5`}
      >
        Соберите бургер
      </h1>

      <div className={`${styles.main} pl-5 pr-5`}>
        {isLoading && <Preloader />}
        {error && (
          <p className='text text_type_main-default text-center'>{error}</p>
        )}
        {!isLoading && !error && (
          <>
            <BurgerIngredients />
            <BurgerConstructor />
          </>
        )}
      </div>
    </main>
  );
};

export default ConstructorPage;
