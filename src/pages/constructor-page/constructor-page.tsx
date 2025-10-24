import { FC } from 'react';
import { useAppSelector } from '../../services/store';

import styles from './constructor-page.module.css';
import { BurgerIngredients, BurgerConstructor } from '../../components';
import { Preloader } from '../../components/ui';

export const ConstructorPage: FC = () => {
  const { items, isLoading, error } = useAppSelector(
    (state) => state.ingredients
  );

  const waiting = isLoading || items.length === 0;

  return (
    <main className={styles.containerMain}>
      <h1
        className={`${styles.title} text text_type_main-large mt-10 mb-5 pl-5`}
      >
        Соберите бургер
      </h1>

      <div className={`${styles.main} pl-5 pr-5`}>
        {waiting && <Preloader />}
        {error && (
          <p className='text text_type_main-default text-center'>{error}</p>
        )}
        {!waiting && !error && (
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
