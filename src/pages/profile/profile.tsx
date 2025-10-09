import { ProfileUI } from '@ui-pages';
import { FC, SyntheticEvent, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../services/hooks';
import { getUser, updateUser } from '../../services/slices/userSlice';

export const Profile: FC = () => {
  const dispatch = useAppDispatch();

  // 1️⃣ Берём пользователя из Redux store
  const user = useAppSelector((state) => state.user.user);

  // 2️⃣ При первом рендере подгружаем пользователя (если ещё не загружен)
  useEffect(() => {
    if (!user) {
      dispatch(getUser());
    }
  }, [dispatch, user]);

  // 3️⃣ Локальный стейт формы
  const [formValue, setFormValue] = useState({
    name: '',
    email: '',
    password: ''
  });

  // 4️⃣ Обновляем поля формы, когда данные пользователя приходят
  useEffect(() => {
    if (user) {
      setFormValue({
        name: user.name,
        email: user.email,
        password: ''
      });
    }
  }, [user]);

  const isFormChanged =
    formValue.name !== user?.name ||
    formValue.email !== user?.email ||
    !!formValue.password;

  // 5️⃣ Сабмит обновления
  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    dispatch(updateUser(formValue));
  };

  const handleCancel = (e: SyntheticEvent) => {
    e.preventDefault();
    if (user) {
      setFormValue({
        name: user.name,
        email: user.email,
        password: ''
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValue((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <ProfileUI
      formValue={formValue}
      isFormChanged={isFormChanged}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
    />
  );
};
