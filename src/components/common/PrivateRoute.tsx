import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';
import { isAuthenticated } from '../../services/authService';

const PrivateRoute: React.FC = () => {
  const { isAuthenticated: contextAuth, loading, refreshUser } = useAuth();
  const [initializing, setInitializing] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // 페이지 이동 시 토큰 유효성 다시 확인
    const verifyAuth = async () => {
      if (!loading && !contextAuth && isAuthenticated()) {
        await refreshUser();
      }
      setInitializing(false);
    };

    verifyAuth();
  }, [location.pathname, contextAuth, loading, refreshUser]);

  if (loading || initializing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return contextAuth ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute; 