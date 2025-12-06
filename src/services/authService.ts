import { LoginRequest, LoginResponse, RegisterRequest, User } from '../types';
import {del, get, post, put} from './api';
import { mockAuthService } from './mockBackend';
import { getToken, setToken, removeToken, isValidToken, getUserIdFromToken } from '../utils/security';
import { getUseMock } from './mockConfig';

export const login = async (credentials: LoginRequest) => {
  try {
    if (getUseMock()) {
      const response = await mockAuthService.login(credentials.username, credentials.password);
      if (response.success && response.data && response.data.token) {
        setToken(response.data.token);
      }
      return response;
    }
    const response = await post<LoginResponse>('/auth/login', credentials);
    if (response.success && response.data && response.data.token) {
      setToken(response.data.token);
    }
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: '로그인 처리 중 오류가 발생했습니다.',
      data: null,
      timestamp: new Date().toISOString()
    };
  }
};

export const register = async (userData: RegisterRequest) => {
  try {
    if (getUseMock()) {
      return mockAuthService.register(userData);
    }
    return post<User>('/users', userData);
  } catch (error) {
    console.error('Register error:', error);
    return {
      success: false,
      message: '회원가입 처리 중 오류가 발생했습니다.',
      data: null,
      timestamp: new Date().toISOString()
    };
  }
};

export const logout = () => {
  removeToken();
  
  // 로그아웃 시 원래 페이지로 돌아갈 수 있도록 현재 경로 저장
  const currentPath = window.location.pathname;
  if (currentPath !== '/login' && currentPath !== '/register') {
    sessionStorage.setItem('redirectAfterLogin', currentPath);
  }
  
  window.location.href = '/login';
};

export const getCurrentUser = async () => {
  try {
    if (getUseMock()) {
      return mockAuthService.getCurrentUser();
    }
    const userId = getUserIdFromToken();
    if (!userId) {
      return {
        success: false,
        message: '사용자 ID를 가져올 수 없습니다.',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
    return get<User>(`/users/${userId}`);
  } catch (error) {
    console.error('Get current user error:', error);
    return {
      success: false,
      message: '사용자 정보를 가져오는 중 오류가 발생했습니다.',
      data: null,
      timestamp: new Date().toISOString()
    };
  }
};

export const getUsers = async () => {
  try {
    if (getUseMock()) {
      return mockAuthService.getUsers();
    }
    return get<User[]>('/users');
  } catch (error) {
    console.error('Get users error:', error);
    return {
      success: false,
      message: '사용자 목록을 가져오는 중 오류가 발생했습니다.',
      data: [],
      timestamp: new Date().toISOString()
    };
  }
};

export const updateUser = async (id: number, userData: Partial<User>) => {
  try {
    if (getUseMock()) {
      return mockAuthService.updateUser?.(id, userData) ||
        { success: false, message: 'Not implemented', data: null, timestamp: new Date().toISOString() };
    }
    return put<User>(`/users/${id}`, userData);
  } catch (error) {
    console.error('Update user error:', error);
    return {
      success: false,
      message: '사용자 정보 업데이트 중 오류가 발생했습니다.',
      data: null,
      timestamp: new Date().toISOString()
    };
  }
};

export const isAuthenticated = (): boolean => {
  try {
    if (getUseMock()) {
      return !!getToken();
    }
    
    return isValidToken();
  } catch (error) {
    console.error('Authentication check error:', error);
    return false;
  }
};

export const verifyPassword = async (password: string) => {
  try {
    if (getUseMock()) {
      return mockAuthService.verifyPassword(password);
    }
    return post<{ valid: boolean }>('/users/verify-password', { password });
  } catch (error) {
    console.error('Verify password error:', error);
    return {
      success: false,
      message: '비밀번호 확인 중 오류가 발생했습니다.',
      data: null,
      timestamp: new Date().toISOString()
    };
  }
};

export const withdrawAccount = async () => {
  try {
    if (getUseMock()) {
      return mockAuthService.withdrawAccount();
    }
    const userId = getUserIdFromToken();
    if (!userId) {
      return {
        success: false,
        message: '사용자 ID를 가져올 수 없습니다.',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
    return del<void>(`/users/${userId}`);
  } catch (error) {
    console.error('Withdraw account error:', error);
    return {
      success: false,
      message: '회원탈퇴 처리 중 오류가 발생했습니다.',
      data: null,
      timestamp: new Date().toISOString()
    };
  }
}; 