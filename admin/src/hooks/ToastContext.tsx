import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';
import type { ToastMessage } from '../components/Toast';

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info', duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'warning' | 'info', duration = 5000) => {
      const id = `${Date.now()}-${Math.random()}`;
      const newToast: ToastMessage = { id, message, type, duration };
      setToasts((prevToasts) => [...prevToasts, newToast]);
    },
    [],
  );

  const showSuccess = useCallback(
    (message: string, duration = 5000) => showToast(message, 'success', duration),
    [showToast],
  );

  const showError = useCallback(
    (message: string, duration = 5000) => showToast(message, 'error', duration),
    [showToast],
  );

  const showWarning = useCallback(
    (message: string, duration = 5000) => showToast(message, 'warning', duration),
    [showToast],
  );

  const showInfo = useCallback(
    (message: string, duration = 5000) => showToast(message, 'info', duration),
    [showToast],
  );

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
