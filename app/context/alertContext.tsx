import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert } from '@/components/Alert';
import { View } from 'react-native';

type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertContextType {
  showAlert: (type: AlertType, message: string) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

const AlertContext = createContext<AlertContextType>({} as AlertContextType);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<
    Array<{
      id: number;
      type: AlertType;
      message: string;
    }>
  >([]);

  const showAlert = useCallback((type: AlertType, message: string) => {
    const id = Date.now();
    setAlerts((current) => [...current, { id, type, message }]);
  }, []);

  const showSuccess = useCallback(
    (message: string) => {
      showAlert('success', message);
    },
    [showAlert]
  );

  const showError = useCallback(
    (message: string) => {
      showAlert('error', message);
    },
    [showAlert]
  );

  const showInfo = useCallback(
    (message: string) => {
      showAlert('info', message);
    },
    [showAlert]
  );

  const showWarning = useCallback(
    (message: string) => {
      showAlert('warning', message);
    },
    [showAlert]
  );

  const removeAlert = useCallback((id: number) => {
    setAlerts((current) => current.filter((alert) => alert.id !== id));
  }, []);

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        showSuccess,
        showError,
        showInfo,
        showWarning,
      }}
    >
      {children}
      <View
        style={{
          position: 'absolute',
          bottom: 120,
          left: 0,
          right: 0,
          zIndex: 999999,
          elevation: 99999,
        }}
      >
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            type={alert.type}
            message={alert.message}
            onClose={() => removeAlert(alert.id)}
          />
        ))}
      </View>
    </AlertContext.Provider>
  );
}

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
