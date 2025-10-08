import { Navigate, useLocation } from 'react-router-dom';
import { FC } from 'react';
import { useAppSelector } from '../../services/store';

type ProtectedRouteProps = {
  element: JSX.Element;
  onlyUnAuth?: boolean; // true — если маршрут только для неавторизованных (например /login)
};

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  element,
  onlyUnAuth = false
}) => {
  const location = useLocation();
  const { user, isAuthChecked } = useAppSelector((state) => state.user);

  // пока не проверили токен — можно вернуть null или лоадер
  if (!isAuthChecked) {
    return null;
  }

  // если маршрут только для неавторизованных, а юзер уже залогинен — отправляем на главную
  if (onlyUnAuth && user) {
    return <Navigate to='/' replace />;
  }

  // если маршрут защищённый, а юзер не залогинен — перенаправляем на /login
  if (!onlyUnAuth && !user) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // если всё ок — рендерим переданный элемент
  return element;
};
