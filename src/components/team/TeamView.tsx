import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Fab,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { 
  getTeams, 
  getTeamMembers, 
  createTeam, 
  updateTeam, 
  deleteTeam, 
  addTeamMember, 
  removeTeamMember, 
  getAvailableUsers 
} from '../../services/teamService';
import { getTasks } from '../../services/taskService';
import { Team, User, Task, TaskStatus, CreateTeamRequest, UpdateTeamRequest, AddMemberRequest } from '../../types';

const TeamView: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [members, setMembers] = useState<User[]>([]);
  const [memberTasks, setMemberTasks] = useState<{ [key: number]: Task[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dialog states
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [editTeamOpen, setEditTeamOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [deleteTeamOpen, setDeleteTeamOpen] = useState(false);
  
  // Form states
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [memberMenuAnchor, setMemberMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  
  // Notification state
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchTeamMembers(selectedTeam.id);
    }
  }, [selectedTeam]);

  useEffect(() => {
    if (members.length > 0) {
      members.forEach(member => {
        fetchMemberTasks(member.id);
      });
    }
  }, [members]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await getTeams();
      if (response.success) {
        setTeams(response.data);
        if (response.data.length > 0) {
          setSelectedTeam(response.data[0]);
          setSelectedTabIndex(0);
        }
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to load teams. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTabIndex(newValue);
    if (teams[newValue]) {
      setSelectedTeam(teams[newValue]);
    }
  };

  const fetchTeamMembers = async (teamId: number) => {
    try {
      const response = await getTeamMembers(teamId);
      if (response.success && response.data) {
        setMembers(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
    }
  };

  const fetchMemberTasks = async (userId: number) => {
    try {
      // Get tasks where user is assignee
      const response = await getTasks(0, 100, undefined, undefined, userId);
      if (response.success) {
        setMemberTasks(prev => ({
          ...prev,
          [userId]: response.data.content,
        }));
      }
    } catch (err) {
      console.error(`Error fetching tasks for user ${userId}:`, err);
    }
  };

  const getMemberStats = (userId: number) => {
    const tasks = memberTasks[userId] || [];
    return {
      total: tasks.length,
      completed: tasks.filter(task => task.status === TaskStatus.DONE).length,
      inProgress: tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length,
      todo: tasks.filter(task => task.status === TaskStatus.TODO).length,
    };
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      showNotification('팀 이름을 입력해주세요.', 'error');
      return;
    }

    try {
      const request: CreateTeamRequest = {
        name: teamName.trim(),
        description: teamDescription.trim(),
      };

      const response = await createTeam(request);
      if (response.success && response.data) {
        // 중복 방지를 위해 기존 팀 목록에 새 팀이 이미 있는지 확인
        const isTeamAlreadyExists = teams.some(team => team.id === response.data!.id);
        
        if (!isTeamAlreadyExists) {
          const newTeams = [...teams, response.data];
          setTeams(newTeams);
          setSelectedTeam(response.data); // 새로 생성된 팀을 자동으로 선택
          setSelectedTabIndex(newTeams.length - 1); // 새 팀 탭으로 이동
        } else {
          // 이미 존재하는 경우 해당 팀으로 이동만 수행
          const existingTeamIndex = teams.findIndex(team => team.id === response.data!.id);
          setSelectedTeam(response.data);
          setSelectedTabIndex(existingTeamIndex);
        }
        
        setCreateTeamOpen(false);
        setTeamName('');
        setTeamDescription('');
        showNotification('팀이 성공적으로 생성되었습니다.');
      } else {
        showNotification(response.message, 'error');
      }
    } catch (err) {
      console.error('Error creating team:', err);
      showNotification('팀 생성 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleEditTeam = async () => {
    if (!selectedTeam || !teamName.trim()) {
      showNotification('팀 이름을 입력해주세요.', 'error');
      return;
    }

    try {
      const request: UpdateTeamRequest = {
        name: teamName.trim(),
        description: teamDescription.trim(),
      };

      const response = await updateTeam(selectedTeam.id, request);
      if (response.success && response.data) {
        // 팀 목록에서 해당 팀만 업데이트
        const updatedTeams = teams.map(team => 
          team.id === selectedTeam.id ? response.data! : team
        );
        setTeams(updatedTeams);
        setSelectedTeam(response.data);
        setEditTeamOpen(false);
        setTeamName('');
        setTeamDescription('');
        showNotification('팀 정보가 성공적으로 업데이트되었습니다.');
      } else {
        showNotification(response.message, 'error');
      }
    } catch (err) {
      console.error('Error updating team:', err);
      showNotification('팀 수정 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return;

    try {
      const response = await deleteTeam(selectedTeam.id);
      if (response.success) {
        const currentIndex = teams.findIndex(team => team.id === selectedTeam.id);
        const remainingTeams = teams.filter(team => team.id !== selectedTeam.id);
        setTeams(remainingTeams);
        
        // 탭 인덱스 조정
        if (remainingTeams.length > 0) {
          const newIndex = currentIndex >= remainingTeams.length ? remainingTeams.length - 1 : currentIndex;
          setSelectedTabIndex(newIndex);
          setSelectedTeam(remainingTeams[newIndex]);
        } else {
          setSelectedTabIndex(0);
          setSelectedTeam(null);
        }
        
        setDeleteTeamOpen(false);
        showNotification('팀이 성공적으로 삭제되었습니다.');
      } else {
        showNotification(response.message, 'error');
      }
    } catch (err) {
      console.error('Error deleting team:', err);
      showNotification('팀 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleAddMember = async () => {
    if (!selectedTeam || !selectedUserId) {
      showNotification('사용자를 선택해주세요.', 'error');
      return;
    }

    try {
      const request: AddMemberRequest = {
        userId: selectedUserId as number,
      };

      const response = await addTeamMember(selectedTeam.id, request);
      if (response.success && response.data) {
        // 팀 목록에서 해당 팀만 업데이트
        const updatedTeams = teams.map(team => 
          team.id === selectedTeam.id ? response.data! : team
        );
        setTeams(updatedTeams);
        setSelectedTeam(response.data);
        setMembers(response.data.members || []);
        setAddMemberOpen(false);
        setSelectedUserId('');
        showNotification('멤버가 성공적으로 추가되었습니다.');
      } else {
        showNotification(response.message, 'error');
      }
    } catch (err) {
      console.error('Error adding member:', err);
      showNotification('멤버 추가 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!selectedTeam) return;

    try {
      const response = await removeTeamMember(selectedTeam.id, userId);
      if (response.success && response.data) {
        const updatedTeams = teams.map(team => 
          team.id === selectedTeam.id ? response.data as Team : team
        );
        setTeams(updatedTeams);
        setSelectedTeam(response.data as Team);
        setMembers((response.data as Team).members || []);
        showNotification('멤버가 성공적으로 제거되었습니다.');
      } else {
        showNotification(response.message, 'error');
      }
    } catch (err) {
      console.error('Error removing member:', err);
      showNotification('멤버 제거 중 오류가 발생했습니다.', 'error');
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await getAvailableUsers(selectedTeam?.id);
      if (response.success && response.data) {
        setAvailableUsers(response.data);
      }
    } catch (err) {
      console.error('Error fetching available users:', err);
    }
  };

  const openCreateTeamDialog = () => {
    setTeamName('');
    setTeamDescription('');
    setCreateTeamOpen(true);
  };

  const openEditTeamDialog = () => {
    if (selectedTeam) {
      setTeamName(selectedTeam.name);
      setTeamDescription(selectedTeam.description);
      setEditTeamOpen(true);
    }
    setAnchorEl(null);
  };

  const openAddMemberDialog = () => {
    setSelectedUserId('');
    fetchAvailableUsers();
    setAddMemberOpen(true);
  };

  const openDeleteTeamDialog = () => {
    setDeleteTeamOpen(true);
    setAnchorEl(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Team View
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateTeamDialog}
        >
          새 팀 만들기
        </Button>
      </Box>

      {teams.length > 0 && (
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={selectedTabIndex}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {teams.map((team, index) => (
              <Tab
                key={team.id}
                label={team.name}
                sx={{
                  textTransform: 'none',
                  fontWeight: selectedTabIndex === index ? 'bold' : 'normal',
                }}
              />
            ))}
          </Tabs>
        </Paper>
      )}

      {selectedTeam ? (
        <Box>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h5" gutterBottom>
                  {selectedTeam.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {selectedTeam.description}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {members.length} Members
                </Typography>
              </Box>
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                size="small"
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Team Members
            </Typography>
            <Button
              variant="outlined"
              startIcon={<PersonAddIcon />}
              onClick={openAddMemberDialog}
            >
              멤버 추가
            </Button>
          </Box>

          <Grid container spacing={3}>
            {members.map(member => {
              const stats = getMemberStats(member.id);
              const completionRate = stats.total > 0 
                ? Math.round((stats.completed / stats.total) * 100)
                : 0;

              return (
                <Grid item xs={12} md={6} key={member.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                            {member.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="h6">{member.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {member.email}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveMember(member.id)}
                          title="멤버 제거"
                        >
                          <PersonRemoveIcon />
                        </IconButton>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle1" gutterBottom>
                        Task Progress
                      </Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Completion Rate:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {completionRate}%
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                        <Chip
                          label={`${stats.total} Total`}
                          size="small"
                        />
                        <Chip
                          label={`${stats.todo} To Do`}
                          color="warning"
                          size="small"
                        />
                        <Chip
                          label={`${stats.inProgress} In Progress`}
                          color="info"
                          size="small"
                        />
                        <Chip
                          label={`${stats.completed} Completed`}
                          color="success"
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}

            {members.length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1">No team members found.</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">No teams found.</Typography>
        </Paper>
      )}

      {/* Team Management Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={openEditTeamDialog}>
          <EditIcon sx={{ mr: 1 }} />
          팀 편집
        </MenuItem>
        <MenuItem onClick={openDeleteTeamDialog} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          팀 삭제
        </MenuItem>
      </Menu>

      {/* Create Team Dialog */}
      <Dialog open={createTeamOpen} onClose={() => setCreateTeamOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>새 팀 만들기</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="팀 이름"
            fullWidth
            variant="outlined"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="팀 설명"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateTeamOpen(false)}>취소</Button>
          <Button onClick={handleCreateTeam} variant="contained">생성</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={editTeamOpen} onClose={() => setEditTeamOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>팀 편집</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="팀 이름"
            fullWidth
            variant="outlined"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="팀 설명"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTeamOpen(false)}>취소</Button>
          <Button onClick={handleEditTeam} variant="contained">저장</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Team Dialog */}
      <Dialog open={deleteTeamOpen} onClose={() => setDeleteTeamOpen(false)}>
        <DialogTitle>팀 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            정말로 "{selectedTeam?.name}" 팀을 삭제하시겠습니까?
            이 작업은 취소할 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTeamOpen(false)}>취소</Button>
          <Button onClick={handleDeleteTeam} color="error" variant="contained">삭제</Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={addMemberOpen} onClose={() => setAddMemberOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>멤버 추가</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>사용자 선택</InputLabel>
            <Select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value as number)}
              label="사용자 선택"
            >
              {availableUsers.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {availableUsers.length === 0 && (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              추가할 수 있는 사용자가 없습니다.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMemberOpen(false)}>취소</Button>
          <Button 
            onClick={handleAddMember} 
            variant="contained"
            disabled={!selectedUserId}
          >
            추가
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TeamView; 