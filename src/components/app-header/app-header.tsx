import { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppHeaderUI } from '@ui';

export const AppHeader: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <AppHeaderUI
      userName=''
      // пробрасываем обработчики в UI
      onConstructorClick={() => handleNavigate('/')}
      onFeedClick={() => handleNavigate('/feed')}
      onProfileClick={() => handleNavigate('/profile')}
      activePath={location.pathname} // можно для подсветки
    />
  );
};
