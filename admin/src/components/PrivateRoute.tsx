import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../hooks/AuthContext';

const PrivateRoute: React.FC = () => {
  const { token } = useAuthContext();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
