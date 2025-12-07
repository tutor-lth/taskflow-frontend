import { Comment, CreateCommentRequest, PagedResponse } from '../types';
import { get, post, put, del } from './api';
import { mockCommentService } from './mockBackend';
import { getUseMock } from './mockConfig';

// Comment Service API
export const getTaskComments = async (taskId: number, page: number = 0, size: number = 10, sortOrder: 'newest' | 'oldest' = 'newest') => {
  if (getUseMock()) {
    return mockCommentService.getTaskComments(taskId, page, size, sortOrder);
  }
  
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('size', size.toString());
  params.append('sort', sortOrder);
  
  return get<PagedResponse<Comment>>(`/tasks/${taskId}/comments?${params.toString()}`);
};

export const createComment = async (taskId: number, comment: CreateCommentRequest) => {
  if (getUseMock()) {
    return mockCommentService.createComment(taskId, comment);
  }
  return post<Comment>(`/tasks/${taskId}/comments`, comment);
};

export const updateComment = async (taskId: number, commentId: number, content: string) => {
  if (getUseMock()) {
    return mockCommentService.updateComment(commentId, content);
  }
  return put<Comment>(`/tasks/${taskId}/comments/${commentId}`, { content });
};

export const deleteComment = async (taskId: number, commentId: number) => {
  if (getUseMock()) {
    return mockCommentService.deleteComment(taskId, commentId);
  }
  return del<{ success: boolean; message: string; data: null; timestamp: string }>(
    `/tasks/${taskId}/comments/${commentId}`
  );
}; 