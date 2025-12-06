import { ActivityLog, PagedResponse, PagedApiResponse, ActivityType } from '../types';
import { get } from './api';
import { mockActivityService } from './mockBackend';
import { getUseMock } from './mockConfig';

export interface ActivityLogFilters {
  type?: ActivityType;
  userId?: string;
  taskId?: string;
  startDate?: string;
  endDate?: string;
}

export const getActivityLogs = async (
  page: number = 0,
  size: number = 10,
  filters: ActivityLogFilters = {}
): Promise<PagedResponse<ActivityLog>> => {
  try {
    if (getUseMock()) {
      const response = await mockActivityService.getActivityLogs(page, size, filters);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch activity logs');
      }
      return response.data;
    }

    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value.toString());
      }
    });

    const response = await get<PagedResponse<ActivityLog>>(`/activities?${params.toString()}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch activity logs');
    }
    return response.data;
  } catch (error) {
    console.error('Get activity logs error:', error);
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: size,
      number: page
    };
  }
}; 