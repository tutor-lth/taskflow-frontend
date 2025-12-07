import { Team, User, CreateTeamRequest, UpdateTeamRequest, AddMemberRequest } from '../types';
import { get, post, put, del } from './api';
import { mockTeamService } from './mockBackend';
import { getUseMock } from './mockConfig';

// Team Service API
export const getTeams = async () => {
  if (getUseMock()) {
    return mockTeamService.getTeams();
  }
  return get<Team[]>('/teams');
};

export const getTeamById = async (id: number) => {
  if (getUseMock()) {
    return mockTeamService.getTeamById(id);
  }
  return get<Team>(`/teams/${id}`);
};

export const getTeamMembers = async (teamId: number) => {
  if (getUseMock()) {
    return mockTeamService.getTeamMembers(teamId);
  }
  return get<User[]>(`/teams/${teamId}/members`);
};

export const createTeam = async (request: CreateTeamRequest) => {
  if (getUseMock()) {
    return mockTeamService.createTeam(request);
  }
  return post<Team>('/teams', request);
};

export const updateTeam = async (id: number, request: UpdateTeamRequest) => {
  if (getUseMock()) {
    return mockTeamService.updateTeam(id, request);
  }
  return put<Team>(`/teams/${id}`, request);
};

export const deleteTeam = async (id: number) => {
  if (getUseMock()) {
    return mockTeamService.deleteTeam(id);
  }
  return del(`/teams/${id}`);
};

export const addTeamMember = async (teamId: number, request: AddMemberRequest) => {
  if (getUseMock()) {
    return mockTeamService.addMember(teamId, request);
  }
  return post<Team>(`/teams/${teamId}/members`, request);
};

export const removeTeamMember = async (teamId: number, userId: number) => {
  if (getUseMock()) {
    return mockTeamService.removeMember(teamId, userId);
  }
  return del(`/teams/${teamId}/members/${userId}`);
};

export const getAvailableUsers = async (teamId?: number) => {
  if (getUseMock()) {
    return mockTeamService.getAvailableUsers(teamId);
  }
  return get<User[]>(`/users/available${teamId ? `?teamId=${teamId}` : ''}`);
}; 