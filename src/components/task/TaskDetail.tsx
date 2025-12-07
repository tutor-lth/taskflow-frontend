import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getTaskById, updateTask, updateTaskStatus, deleteTask } from '../../services/taskService';
import Comments from './Comments';
import { getUsers } from '../../services/authService';
import { Task, TaskStatus, TaskPriority, User } from '../../types';
import { useAuth } from '../../context/AuthContext';

const priorityColors = {
  [TaskPriority.LOW]: 'success',
  [TaskPriority.MEDIUM]: 'warning',
  [TaskPriority.HIGH]: 'error',
};

const statusColors = {
  [TaskStatus.TODO]: 'warning',
  [TaskStatus.IN_PROGRESS]: 'info',
  [TaskStatus.DONE]: 'success',
};

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const taskId = parseInt(id || '0');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [task, setTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});

  useEffect(() => {
    if (taskId) {
      fetchTaskData();
      fetchUsers();
    }
  }, [taskId]);

  const fetchTaskData = async () => {
    try {
      setLoading(true);
      const taskResponse = await getTaskById(taskId);
      
      if (taskResponse.success) {
        setTask(taskResponse.data);
      }
    } catch (err) {
      console.error('Error fetching task data:', err);
      setError('Failed to load task data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      if (response.success) {
        setUsers(response.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;
    
    try {
      const response = await updateTaskStatus(taskId, newStatus);
      if (response.success) {
        setTask({ ...task, status: newStatus });
      }
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };



  const handleOpenEditDialog = () => {
    if (!task) return;
    
    setEditedTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      assigneeId: task.assignee?.id || task.assigneeId,
      dueDate: task.dueDate,
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setEditedTask({
      ...editedTask,
      [name as string]: value,
    });
  };

  const handleSaveTask = async () => {
    if (!editedTask) return;
    
    try {
      const response = await updateTask(taskId, {
        ...editedTask,
        dueDate: editedTask.dueDate ? editedTask.dueDate.replace('Z', '') : editedTask.dueDate
      });
      
      if (response.success && response.data) {
        setTask(response.data);
        handleCloseEditDialog();
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('이 작업을 삭제하시겠습니까?')) return;
    
    try {
      await deleteTask(taskId);
      navigate('/tasks');
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !task) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography color="error">{error || 'Task not found'}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Button 
          startIcon={<BackIcon />} 
          onClick={() => navigate('/tasks')}
          sx={{ mb: 2 }}
        >
          뒤로 돌아가기
        </Button>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {task.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip 
                label={task.status} 
                color={statusColors[task.status] as any} 
              />
              <Chip 
                label={task.priority} 
                color={priorityColors[task.priority] as any} 
              />
              <Chip 
                label={`마감일: ${format(new Date(task.dueDate), 'PP')}`}
              />
            </Box>
          </Box>
          <Box>
            <IconButton onClick={handleOpenEditDialog} color="primary" sx={{ mr: 1 }}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={handleDeleteTask} color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              설명
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {task.description || '설명이 없습니다.'}
            </Typography>
          </Paper>

          <Comments taskId={taskId} />
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              상세
            </Typography>
            
            <Box sx={{ mb: 2, mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                상태
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                >
                  <MenuItem value={TaskStatus.TODO}>TODO</MenuItem>
                  <MenuItem value={TaskStatus.IN_PROGRESS}>IN_PROGRESS</MenuItem>
                  <MenuItem value={TaskStatus.DONE}>DONE</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                담당자
              </Typography>
              <Typography variant="body1">
                {task.assignee?.name || 'Unassigned'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                마감일
              </Typography>
              <Typography variant="body1">
                {format(new Date(task.dueDate), 'PP')}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                생성일
              </Typography>
              <Typography variant="body1">
                {format(new Date(task.createdAt), 'PP')}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                수정일
              </Typography>
              <Typography variant="body1">
                {format(new Date(task.updatedAt), 'PP p')}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Task Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>작업 수정</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="제목"
              name="title"
              value={editedTask.title || ''}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="설명"
              name="description"
              multiline
              rows={4}
              value={editedTask.description || ''}
              onChange={handleInputChange}
            />
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>우선순위</InputLabel>
                  <Select
                    name="priority"
                    value={editedTask.priority || TaskPriority.MEDIUM}
                    label="우선순위"
                    onChange={(e) => {
                      const value = e.target.value;
                      handleInputChange({
                        target: {
                          name: 'priority',
                          value
                        }
                      } as any);
                    }}
                  >
                    <MenuItem value={TaskPriority.LOW}>Low</MenuItem>
                    <MenuItem value={TaskPriority.MEDIUM}>Medium</MenuItem>
                    <MenuItem value={TaskPriority.HIGH}>High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>담당자</InputLabel>
                  <Select
                    name="assigneeId"
                    value={editedTask.assigneeId || 0}
                    label="담당자"
                    onChange={(e) => {
                      const value = e.target.value;
                      handleInputChange({
                        target: {
                          name: 'assigneeId',
                          value
                        }
                      } as any);
                    }}
                  >
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="마감일"
                  name="dueDate"
                  type="datetime-local"
                  value={editedTask.dueDate ? editedTask.dueDate.substring(0, 16) : ''}
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    // Format: "2025-06-18T03:12:00" without 'Z' suffix
                    const formattedDate = dateValue ? `${dateValue}:00` : '';
                    handleInputChange({
                      target: {
                        name: 'dueDate',
                        value: formattedDate
                      }
                    } as any);
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>취소</Button>
          <Button onClick={handleSaveTask} variant="contained" color="primary">
            수정
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TaskDetail; 