import React, { FC } from 'react';
import {
  Button,
  ConstructorElement,
  CurrencyIcon
} from '@zlden/react-developer-burger-ui-components';
import styles from './burger-constructor.module.css';
import { BurgerConstructorUIProps } from './type';
import { TConstructorIngredient } from '@utils-types';
import { BurgerConstructorElement, Modal } from '@components';
import { Preloader, OrderDetailsUI } from '@ui';

export const BurgerConstructorUI: FC<BurgerConstructorUIProps> = ({
  constructorItems,
  orderRequest,
  price,
  orderModalData,
  onOrderClick,
  closeOrderModal
}) => {
  const bun = constructorItems.bun;
  const ingredients = constructorItems.ingredients;

  type IngredientWithUuid = TConstructorIngredient & { uuid: string };

  return (
    <section className={styles.burger_constructor}>
      {bun ? (
        <div
          data-testid='constructor-buns'
          className={`${styles.element} mb-4 mr-4`}
        >
          <ConstructorElement
            type='top'
            isLocked
            text={`${bun.name} (верх)`}
            price={bun.price}
            thumbnail={bun.image}
          />
        </div>
      ) : (
        <div
          data-testid='constructor-buns'
          className={`${styles.noBuns} ${styles.noBunsTop} ml-8 mb-4 mr-5 text text_type_main-default`}
        >
          Выберите булки
        </div>
      )}

      <ul className={styles.elements} data-testid='constructor-fillings'>
        {ingredients?.length > 0 ? (
          (ingredients as IngredientWithUuid[]).map((item, index) => (
            <BurgerConstructorElement
              ingredient={item}
              index={index}
              totalItems={ingredients.length}
              key={item.uuid}
            />
          ))
        ) : (
          <div
            className={`${styles.noBuns} ml-8 mb-4 mr-5 text text_type_main-default`}
          >
            Выберите начинку
          </div>
        )}
      </ul>

      {bun ? (
        <div className={`${styles.element} mt-4 mr-4`}>
          <ConstructorElement
            type='bottom'
            isLocked
            text={`${bun.name} (низ)`}
            price={bun.price}
            thumbnail={bun.image}
          />
        </div>
      ) : (
        <div
          className={`${styles.noBuns} ${styles.noBunsBottom} ml-8 mb-4 mr-5 text text_type_main-default`}
        >
          Выберите булки
        </div>
      )}

      <div className={`${styles.total} mt-10 mr-4`}>
        <div className={`${styles.cost} mr-10`}>
          <p className={`text ${styles.text} mr-2`}>{price}</p>
          <CurrencyIcon type='primary' />
        </div>
        <Button
          data-testid='order-button'
          htmlType='button'
          type='primary'
          size='large'
          onClick={onOrderClick}
          disabled={!bun || orderRequest}
        >
          {orderRequest ? 'Оформляем...' : 'Оформить заказ'}
        </Button>
      </div>

      {orderRequest && (
        <div data-testid='modal' style={{ display: 'contents' }}>
          <Modal onClose={closeOrderModal} title='Оформляем заказ...'>
            <Preloader />
          </Modal>
        </div>
      )}
      {orderModalData && (
        <div data-testid='modal' style={{ display: 'contents' }}>
          <Modal
            onClose={closeOrderModal}
            title={orderRequest ? 'Оформляем заказ...' : ''}
          >
            <OrderDetailsUI orderNumber={orderModalData.number} />
          </Modal>
        </div>
      )}
    </section>
  );
};
