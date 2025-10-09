import { FC, FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { registerUser } from '../../services/slices/userSlice';
import { RegisterUI } from '@ui-pages';
import { SyntheticEvent } from 'react';

export const Register: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { error } = useAppSelector((state) => state.user);

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();

    console.log('📤 Register submit fired:', {
      name: userName,
      email,
      password
    });

    dispatch(registerUser({ name: userName, email, password }))
      .unwrap()
      .then(() => navigate('/login'))
      .catch((err: unknown) => console.error('❌ Registration error:', err));
  };

  return (
    <RegisterUI
      errorText={error || ''}
      email={email}
      userName={userName}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      setUserName={setUserName}
      handleSubmit={handleSubmit}
    />
  );
};
