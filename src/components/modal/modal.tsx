import { FC, memo, useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { useLocation } from 'react-router-dom';
import { TModalProps } from './type';
import { ModalUI } from '@ui';

const modalRoot = document.getElementById('modals');

export const Modal: FC<TModalProps> = memo(({ title, onClose, children }) => {
  const el = useMemo(() => document.createElement('div'), []);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!modalRoot) return;

    modalRoot.appendChild(el);
    setMounted(true);

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('keydown', handleEsc);

      // 💡 Безопасный unmount с проверкой через MutationObserver
      const safeRemove = () => {
        if (!modalRoot) return;
        if (modalRoot.contains(el)) {
          try {
            modalRoot.removeChild(el);
          } catch {
            // если узел уже удалён ReactDOM — игнорируем
          }
        }
      };

      // ждём пока React завершит переход и размонтирование
      setTimeout(safeRemove, 0);
    };
  }, [el, onClose, location.key]);

  if (!mounted || !modalRoot) return null;

  return ReactDOM.createPortal(
    <ModalUI title={title} onClose={onClose}>
      {children}
    </ModalUI>,
    el
  );
});
