import { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppHeaderUI } from '@ui';

export const AppHeader: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleConstructorClick = () => navigate('/');
  const handleFeedClick = () => navigate('/feed');
  const handleProfileClick = () => navigate('/profile');

  return (
    <AppHeaderUI
      userName=''
      onConstructorClick={handleConstructorClick}
      onFeedClick={handleFeedClick}
      onProfileClick={handleProfileClick}
      activePath={location.pathname}
    />
  );
};
