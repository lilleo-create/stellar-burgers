import React, { FC } from 'react';
import styles from './app-header.module.css';
import { TAppHeaderUIProps } from './type';
import {
  BurgerIcon,
  ListIcon,
  Logo,
  ProfileIcon
} from '@zlden/react-developer-burger-ui-components';

export const AppHeaderUI: FC<TAppHeaderUIProps> = ({
  userName,
  onConstructorClick,
  onFeedClick,
  onProfileClick,
  activePath = ''
}) => (
  <header className={styles.header}>
    <nav className={`${styles.menu} p-4`}>
      <div className={styles.menu_part_left}>
        <div
          className={styles.link}
          onClick={onConstructorClick}
          role='button'
          tabIndex={0}
        >
          <BurgerIcon type={activePath === '/' ? 'primary' : 'secondary'} />
          <p className='text text_type_main-default ml-2 mr-10'>Конструктор</p>
        </div>

        <div
          className={styles.link}
          onClick={onFeedClick}
          role='button'
          tabIndex={0}
        >
          <ListIcon
            type={activePath.startsWith('/feed') ? 'primary' : 'secondary'}
          />
          <p className='text text_type_main-default ml-2'>Лента заказов</p>
        </div>
      </div>

      <div className={styles.logo} onClick={onConstructorClick}>
        <Logo className='' />
      </div>

      <div
        className={styles.link_position_last}
        onClick={onProfileClick}
        role='button'
        tabIndex={0}
      >
        <ProfileIcon
          type={activePath.startsWith('/profile') ? 'primary' : 'secondary'}
        />
        <p className='text text_type_main-default ml-2'>
          {userName || 'Личный кабинет'}
        </p>
      </div>
    </nav>
  </header>
);
