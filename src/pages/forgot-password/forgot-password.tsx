import { FC, useState, SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../services/store';
import { forgotPassword } from '../../services/slices/userSlice';
import { ForgotPasswordUI } from '@ui-pages';

export const ForgotPassword: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [errorText, setErrorText] = useState<string | undefined>(undefined);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setErrorText(undefined);

    try {
      await dispatch(forgotPassword({ email })).unwrap();
      localStorage.setItem('resetPassword', 'true');
      navigate('/reset-password', { replace: true });
    } catch (err: any) {
      setErrorText(err?.message || 'Не удалось отправить письмо');
    }
  };

  return (
    <ForgotPasswordUI
      errorText={errorText}
      email={email}
      setEmail={setEmail}
      handleSubmit={handleSubmit}
    />
  );
};
