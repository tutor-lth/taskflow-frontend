import { Activity, DashboardStats, MyTaskSummary, PagedResponse } from '../types';
import { get } from './api';
import { mockDashboardService } from './mockBackend';
import { getUseMock } from './mockConfig';
import { getUserIdFromToken } from '../utils/security';

// Dashboard & Reports Service API
export const getDashboardStats = async () => {
  if (getUseMock()) {
    return mockDashboardService.getDashboardStats();
  }
  return get<DashboardStats>('/dashboard/stats');
};

export const getMyTasks = async () => {
  if (getUseMock()) {
    return mockDashboardService.getMyTasks();
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
  return get<MyTaskSummary>(`/dashboard/tasks`);
};

export const getMyActivities = async (page = 0, size = 10) => {
  if (getUseMock()) {
    return mockDashboardService.getMyActivities(page, size);
  }

  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('size', size.toString());

  return get<PagedResponse<Activity>>(`/activities/me?${params.toString()}`);
};

export const search = async (query: string) => {
  if (getUseMock()) {
    return mockDashboardService.search(query);
  }
  return get<any>(`/search?query=${encodeURIComponent(query)}`);
};

// 주간 작업 추세 데이터 (임시 - 실제 API 구현 대기)
export const getWeeklyTrend = async () => {
  if (getUseMock()) {
    return mockDashboardService.getWeeklyTrend();
  }

  return get<any>('/dashboard/weekly-trend');
}; 