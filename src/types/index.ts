// Task Types
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: number;
  assignee?: User;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  assigneeId: number;
  dueDate?: string;
}

// User Types
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
  password?: string; // Mock 데이터 및 업데이트 시 사용 (보안상 실제 API 응답에는 포함되지 않음)
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  name: string;
}

// Team Types
export interface Team {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  members?: User[];
}

export interface CreateTeamRequest {
  name: string;
  description: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
}

export interface AddMemberRequest {
  userId: number;
}

// Comment Types
export interface Comment {
  id: number;
  taskId: number;
  userId: number;
  user?: User;
  content: string;
  parentId?: number; // null for top-level comments, set for replies
  replies?: Comment[]; // nested replies
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
  parentId?: number; // For creating replies
}

// Activity Types
export interface Activity {
  id: number;
  userId: number;
  user?: User;
  action: string;
  targetType: string;
  targetId: number;
  description: string;
  createdAt: string;
}

// Dashboard Types
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  overdueTasks: number;
  teamProgress: number;
  myTasksToday: number;
  completionRate: number;
}

export interface MyTaskSummary {
  todayTasks: Task[];
  upcomingTasks: Task[];
  overdueTasks: Task[];
}

// Common API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface PagedApiResponse<T> extends ApiResponse<PagedResponse<T>> {}

export interface ActivityLog {
  id: number;
  type: ActivityType;
  userId: number;
  user: User;
  taskId?: number;
  timestamp: string;
  description: string;
}

export enum ActivityType {
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_DELETED = 'TASK_DELETED',
  TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED',
  COMMENT_CREATED = 'COMMENT_CREATED',
  COMMENT_UPDATED = 'COMMENT_UPDATED',
  COMMENT_DELETED = 'COMMENT_DELETED',
}

export interface WithdrawRequest {
  password: string;
} 