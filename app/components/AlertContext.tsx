import React, { createContext, ReactNode, useContext, useState } from 'react';
import { GlobalAlert } from './GlobalAlert';

interface AlertContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alert, setAlert] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  }>({
    visible: false,
    type: 'success',
    message: '',
  });

  const showSuccess = (message: string) => {
    setAlert({
      visible: true,
      type: 'success',
      message,
    });
  };

  const showError = (message: string) => {
    setAlert({
      visible: true,
      type: 'error',
      message,
    });
  };

  const showWarning = (message: string) => {
    setAlert({
      visible: true,
      type: 'warning',
      message,
    });
  };

  const showInfo = (message: string) => {
    setAlert({
      visible: true,
      type: 'info',
      message,
    });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, visible: false }));
  };

  return (
    <AlertContext.Provider value={{ showSuccess, showError, showWarning, showInfo }}>
      {children}
      <GlobalAlert
        visible={alert.visible}
        type={alert.type}
        message={alert.message}
        onHide={hideAlert}
      />
    </AlertContext.Provider>
  );
};