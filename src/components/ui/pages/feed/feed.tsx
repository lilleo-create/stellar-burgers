import { FC, memo } from 'react';
import styles from './feed.module.css';
import { FeedUIProps } from './type';
import { OrdersList, FeedInfo } from '@components';
import { RefreshButton } from '@zlden/react-developer-burger-ui-components';

export const FeedUI: FC<FeedUIProps> = memo(
  ({ orders = [], handleGetFeeds }) => {
    if (Array.isArray(orders)) {
      const ids = orders.map((o) => o._id);
      const unique = new Set(ids);
      const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    }

    return (
      <div className={styles.containerMain}>
        <div className={`${styles.titleBox} mt-10 mb-5`}>
          <h1 className={`${styles.title} text text_type_main-large`}>
            Лента заказов
          </h1>
          <RefreshButton
            text='Обновить'
            onClick={handleGetFeeds}
            extraClass='ml-30'
          />
        </div>

        <div className={styles.main}>
          <div className={styles.columnOrders}>
            {Array.isArray(orders) && orders.length > 0 ? (
              <OrdersList orders={orders} />
            ) : (
              <p className='text text_type_main-medium mt-10'>Нет заказов</p>
            )}
          </div>
          <div className={styles.columnInfo}>
            <FeedInfo />
          </div>
        </div>
      </div>
    );
  }
);
