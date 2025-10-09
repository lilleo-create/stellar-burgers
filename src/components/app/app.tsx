import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
import { useAppDispatch } from '../../services/store';
import { checkUserAuth } from '../../services/slices/userSlice';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // 👇 Проверяем токен при загрузке приложения
  useEffect(() => {
    dispatch(checkUserAuth());
  }, [dispatch]);

  // если в location есть background — значит, модалка открывается поверх
  const background = location.state?.background;

  const handleModalClose = () => {
    navigate(-1);
  };

  return (
    <>
      <AppHeader />

      {/* Основные страницы */}
      <Routes location={background || location}>
        {/* Общедоступные страницы */}
        <Route path='/' element={<ConstructorPage />} />
        <Route path='/feed' element={<Feed />} />
        <Route path='/feed/:number' element={<OrderInfo />} />
        <Route path='/ingredients/:id' element={<IngredientDetails />} />

        {/* Только для НЕавторизованных */}
        <Route path='/login' element={<ProtectedRoute onlyUnAuth element={<Login />} />} />
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

        {/* Только для авторизованных */}
        <Route path='/profile' element={<ProtectedRoute element={<Profile />} />} />
        <Route
          path='/profile/orders'
          element={<ProtectedRoute element={<ProfileOrders />} />}
        />
        <Route
          path='/profile/orders/:number'
          element={<ProtectedRoute element={<OrderInfo />} />}
        />

        {/* 404 */}
        <Route path='*' element={<NotFound404 />} />
      </Routes>

      {/* Модальные окна (работают только при наличии background) */}
      {background && (
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
