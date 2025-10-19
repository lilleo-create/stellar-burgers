import { FC, SyntheticEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../services/store';
import { resetPassword } from '../../services/slices/userSlice';
import { ResetPasswordUI } from '@ui-pages';

export const ResetPassword: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (!localStorage.getItem('resetPassword')) {
      navigate('/forgot-password', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setErrorText(null);

    try {
      await dispatch(resetPassword({ password, token })).unwrap();
      localStorage.removeItem('resetPassword');
      navigate('/login', { replace: true });
    } catch (err: any) {
      setErrorText(err?.message || 'Не удалось сменить пароль');
    }
  };

  return (
    <ResetPasswordUI
      errorText={errorText ?? undefined}
      password={password}
      token={token}
      setPassword={setPassword}
      setToken={setToken}
      handleSubmit={handleSubmit}
    />
  );
};
