import React, { createContext, useContext, useEffect, useState } from 'react';
import { setUseMock as setGlobalUseMock } from '../services/mockConfig';

interface MockContextType {
  useMock: boolean;
  toggleMock: () => void;
}

const MockContext = createContext<MockContextType>({
  useMock: true,
  toggleMock: () => {},
});

export const useMock = () => useContext(MockContext);

export const MockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [useMock, setUseMock] = useState<boolean>(() => {
    // localStorage에서 설정 불러오기 (기본값: true)
    const savedMockSetting = localStorage.getItem('useMock');
    const initialValue = savedMockSetting !== null ? savedMockSetting === 'true' : true;
    // 전역 설정도 초기화
    setGlobalUseMock(initialValue);
    return initialValue;
  });

  useEffect(() => {
    // 설정 변경시 localStorage에 저장하고 전역 설정 업데이트
    localStorage.setItem('useMock', useMock.toString());
    setGlobalUseMock(useMock);
  }, [useMock]);

  const toggleMock = () => {
    setUseMock(prev => !prev);
  };

  const value = {
    useMock,
    toggleMock,
  };

  return <MockContext.Provider value={value}>{children}</MockContext.Provider>;
};
