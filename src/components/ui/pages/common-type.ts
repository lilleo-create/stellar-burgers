import { Dispatch, SetStateAction, FormEvent } from 'react';

export type PageUIProps = {
  errorText: string | undefined;
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
};
