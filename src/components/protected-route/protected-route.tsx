import { Navigate, useLocation } from 'react-router-dom';
import { FC } from 'react';
import { useAppSelector } from '../../services/store';

type ProtectedRouteProps = {
  element: JSX.Element;
  onlyUnAuth?: boolean;
};

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  element,
  onlyUnAuth = false
}) => {
  const location = useLocation();
  const { user, isAuthChecked } = useAppSelector((state) => state.user);

  if (!isAuthChecked) return null;

  if (onlyUnAuth && user) {
    return <Navigate to='/' replace />;
  }
  if (!onlyUnAuth && !user) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }
  return element;
};
