import { useState } from 'react';

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [admin, setAdmin] = useState<any>(() => {
    const stored = localStorage.getItem('admin');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (token: string, admin: any) => {
    setToken(token);
    setAdmin(admin);
    localStorage.setItem('token', token);
    localStorage.setItem('admin', JSON.stringify(admin));
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
  };

  return { token, admin, login, logout };
}
