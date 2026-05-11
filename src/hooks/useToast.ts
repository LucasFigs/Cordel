import { useState, useCallback, useRef } from 'react';
import { ToastState, ToastType } from '../types';

const TOAST_DURATION = 3000; // 3 segundos

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    visible: false, type: 'success', message: '',
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((type: ToastType, message: string, duration = TOAST_DURATION) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ visible: true, type, message });

    // Loading não some sozinho — precisa de hide() explícito
    if (type !== 'loading') {
      timerRef.current = setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, duration);
    }
  }, []);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  const showSuccess = useCallback((msg: string) => show('success', msg), [show]);
  const showError   = useCallback((msg: string) => show('error', msg),   [show]);
  const showLoading = useCallback((msg = 'Carregando…')  => show('loading', msg), [show]);

  return { toast, show, hide, showSuccess, showError, showLoading };
}
