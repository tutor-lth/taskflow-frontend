// Mock 설정을 관리하는 전역 객체
// MockContext에서 이 값을 업데이트하고, 각 service에서 참조합니다.
export const mockConfig = {
  useMock: true,
};

export const setUseMock = (value: boolean) => {
  mockConfig.useMock = value;
};

export const getUseMock = () => mockConfig.useMock;
