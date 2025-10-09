import { FC, SyntheticEvent, useState } from 'react';
import { useAppDispatch } from '../../services/store';
import { loginUserApi } from '../../utils/burger-api';
import { setUser } from '../../services/slices/userSlice';
import { LoginUI } from '@ui-pages';

export const Login: FC = () => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorText, setErrorText] = useState('');

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setErrorText('');

    try {
      const data = await loginUserApi({ email, password });
      if (data.success) {
        localStorage.setItem('refreshToken', data.refreshToken);
        document.cookie = `accessToken=${data.accessToken}`;
        dispatch(setUser(data.user));
      }
    } catch (err) {
      console.error('Ошибка авторизации:', err);
      setErrorText(
        err instanceof Error ? err.message : 'Ошибка при авторизации'
      );
    }
  };

  return (
    <LoginUI
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
      errorText={errorText}
    />
  );
};
