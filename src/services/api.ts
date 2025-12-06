import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '../types';
import { getToken } from '../utils/security';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// 로그아웃 함수를 별도로 정의하여 순환 참조 방지
const handleUnauthorized = () => {
  localStorage.removeItem('token');
  
  // 현재 경로가 인증이 필요한 페이지인 경우, 로그인 후 리디렉션을 위해 저장
  const currentPath = window.location.pathname;
  if (currentPath !== '/login' && currentPath !== '/register') {
    sessionStorage.setItem('redirectAfterLogin', currentPath);
  }
  
  window.location.href = '/login';
};

// Response interceptor for handling common responses
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // Handle unauthorized errors (401)
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      handleUnauthorized();
    }
    
    // Handle server errors (500)
    if (error.response?.status && error.response.status >= 500) {
      console.error('Server error:', error);
      // 여기서 서버 에러에 대한 전역 알림 표시 로직을 추가할 수 있음
    }
    
    // Handle network errors
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      console.error('Network error:', error);
      // 여기서 네트워크 에러에 대한 전역 알림 표시 로직을 추가할 수 있음
    }
    
    // 에러 응답이 있는 경우 해당 응답을 반환
    if (error.response?.data) {
      return error.response;
    }
    
    return Promise.reject(error);
  }
);

// Generic API request method
export const apiRequest = async <T>(
  method: string,
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await api.request<ApiResponse<T>>({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<T>;
    }

    return {
      success: false,
      message: '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.',
      data: {} as T,
      timestamp: new Date().toISOString(),
    };
  }
};

// Typed convenience methods
export const get = <T>(url: string, config?: AxiosRequestConfig) =>
  apiRequest<T>('GET', url, undefined, config);

export const post = <T>(url: string, data: any, config?: AxiosRequestConfig) =>
  apiRequest<T>('POST', url, data, config);

export const put = <T>(url: string, data: any, config?: AxiosRequestConfig) =>
  apiRequest<T>('PUT', url, data, config);

export const patch = <T>(url: string, data: any, config?: AxiosRequestConfig) =>
  apiRequest<T>('PATCH', url, data, config);

export const del = <T>(url: string, config?: AxiosRequestConfig) =>
  apiRequest<T>('DELETE', url, config);

export default api; 