import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Pages
import Dashboard from './components/dashboard/Dashboard';
import TaskBoard from './components/task/TaskBoard';
import TaskDetail from './components/task/TaskDetail';
import TeamView from './components/team/TeamView';
import Search from './components/search/Search';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/profile/Profile';
import ActivityLog from './components/activity/ActivityLog';

// Components
import PrivateRoute from './components/common/PrivateRoute';

// Context
import { AuthProvider } from './context/AuthContext';
import { MockProvider } from './context/MockContext';

const App: React.FC = () => {
  return (
    <>
      <CssBaseline />
      <MockProvider>
        <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<TaskBoard />} />
              <Route path="/tasks/:id" element={<TaskDetail />} />
              <Route path="/team" element={<TeamView />} />
              <Route path="/search" element={<Search />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/activities" element={<ActivityLog />} />
            </Route>
          </Route>
          
          {/* Redirect to dashboard if no route matches */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AuthProvider>
      </MockProvider>
    </>
  );
};

export default App; 