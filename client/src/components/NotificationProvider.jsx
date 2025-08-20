import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info', duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && <Toast message={notification.message} type={notification.type} />}
    </NotificationContext.Provider>
  );
}

function Toast({ message, type }) {
  const colors = {
    info: '#3b82f6',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e42',
  };
  return (
    <div style={{
      position: 'fixed',
      top: 24,
      right: 24,
      background: colors[type] || colors.info,
      color: '#fff',
      padding: '12px 24px',
      borderRadius: 8,
      boxShadow: '0 2px 8px #0002',
      zIndex: 9999,
      fontWeight: 600,
      fontSize: 16,
    }}>
      {message}
    </div>
  );
}
