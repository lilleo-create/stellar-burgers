import { useEffect } from 'react';
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  Location
} from 'react-router-dom';

import { ConstructorPage } from '../../pages/constructor-page';
import { Feed } from '../../pages/feed';
import { Login } from '../../pages/login';
import { Register } from '../../pages/register';
import { AppHeader } from '../app-header/app-header';
import { ForgotPassword } from '../../pages/forgot-password';
import { ResetPassword } from '../../pages/reset-password';
import { Profile } from '../../pages/profile';
import { ProfileOrders } from '../../pages/profile-orders';
import { NotFound404 } from '../../pages/not-fount-404';
import { IngredientDetails } from '../ingredient-details/ingredient-details';
import { OrderInfo } from '../order-info/order-info';
import { Modal } from '../modal/modal';
import { ProtectedRoute } from '../protected-route/protected-route';

import { useAppDispatch, useAppSelector } from '../../services/store';
import { checkUserAuth } from '../../services/slices/userSlice';
import { fetchIngredients } from '../../services/slices/ingredientsSlice';

const isModalPath = (p: string) =>
  p.startsWith('/ingredients/') ||
  p.startsWith('/feed/') ||
  p.startsWith('/profile/orders/');

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const items = useAppSelector((s) => s.ingredients.items);

  useEffect(() => {
    if (!items.length) {
      dispatch(fetchIngredients());
    }
    dispatch(checkUserAuth());
  }, [dispatch]);

  const state = location.state as { background?: Location } | undefined;
  const background =
    state?.background && isModalPath(location.pathname)
      ? state.background
      : undefined;

  const handleModalClose = () => {
    if (background) {
      requestAnimationFrame(() => navigate(-1));
      return;
    }
    const p = location.pathname;
    if (p.startsWith('/profile/orders/')) {
      navigate('/profile/orders', { replace: true });
    } else if (p.startsWith('/feed/')) {
      navigate('/feed', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <>
      <AppHeader />
      <Routes location={background || location}>
        <Route path='/' element={<ConstructorPage />} />
        <Route path='/feed' element={<Feed />} />
        <Route path='/ingredients/:id' element={<IngredientDetails />} />
        <Route path='/feed/:number' element={<OrderInfo />} />
        <Route
          path='/profile'
          element={<ProtectedRoute element={<Profile />} />}
        />
        <Route
          path='/profile/orders'
          element={<ProtectedRoute element={<ProfileOrders />} />}
        />
        <Route
          path='/profile/orders/:number'
          element={<ProtectedRoute element={<OrderInfo />} />}
        />
        <Route
          path='/login'
          element={<ProtectedRoute onlyUnAuth element={<Login />} />}
        />
        <Route
          path='/register'
          element={<ProtectedRoute onlyUnAuth element={<Register />} />}
        />
        <Route
          path='/forgot-password'
          element={<ProtectedRoute onlyUnAuth element={<ForgotPassword />} />}
        />
        <Route
          path='/reset-password'
          element={<ProtectedRoute onlyUnAuth element={<ResetPassword />} />}
        />

        <Route path='*' element={<NotFound404 />} />
      </Routes>

      {background && isModalPath(location.pathname) && (
        <Routes>
          <Route
            path='/ingredients/:id'
            element={
              <Modal onClose={handleModalClose} title='Детали ингредиента'>
                <IngredientDetails />
              </Modal>
            }
          />
          <Route
            path='/feed/:number'
            element={
              <Modal onClose={handleModalClose} title='Детали заказа'>
                <OrderInfo />
              </Modal>
            }
          />
          <Route
            path='/profile/orders/:number'
            element={
              <ProtectedRoute
                element={
                  <Modal onClose={handleModalClose} title='Детали заказа'>
                    <OrderInfo />
                  </Modal>
                }
              />
            }
          />
        </Routes>
      )}
    </>
  );
}

export default App;
