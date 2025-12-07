import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
  [key: string]: any;
}

// 토큰 저장 키
const TOKEN_KEY = 'taskflow_auth_token';

/**
 * Get JWT token from localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Set JWT token in localStorage
 */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove JWT token from localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Check if token exists and is not expired
 */
export const isValidToken = (): boolean => {
  const token = getToken();
  
  if (!token) {
    return false;
  }
  
  try {
    const decodedToken = jwtDecode<JwtPayload>(token);
    const currentTime = Date.now() / 1000;
    
    // 토큰이 만료되기 5분 전이면 만료된 것으로 처리 (자동 갱신 등의 작업을 위해)
    const threshold = 300; // 5 minutes in seconds
    return decodedToken.exp > (currentTime + threshold);
  } catch (error) {
    console.error('Invalid token:', error);
    removeToken(); // 유효하지 않은 토큰 제거
    return false;
  }
};

/**
 * Get user info from token
 */
export const getUserFromToken = (): JwtPayload | null => {
  const token = getToken();
  
  if (!token) {
    return null;
  }
  
  try {
    return jwtDecode<JwtPayload>(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    removeToken(); // 유효하지 않은 토큰 제거
    return null;
  }
};

/**
 * Get token expiration time in milliseconds
 */
export const getTokenExpirationTime = (): number | null => {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const decodedToken = jwtDecode<JwtPayload>(token);
    return decodedToken.exp * 1000; // Convert to milliseconds
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return null;
  }
};

/**
 * Get user ID from token
 */
export const getUserIdFromToken = (): number | null => {
  const userInfo = getUserFromToken();

  if (!userInfo || !userInfo.sub) {
    return null;
  }

  const userId = parseInt(userInfo.sub, 10);
  return isNaN(userId) ? null : userId;
}; 