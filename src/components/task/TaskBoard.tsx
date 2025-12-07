import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
  updateTaskStatus,
} from '../../services/taskService';
import { getUsers } from '../../services/authService';
import { Task, TaskPriority, TaskStatus, User, CreateTaskRequest } from '../../types';
import { truncateText, formatDate } from '../../utils/formatters';
import LoadingIndicator from '../common/LoadingIndicator';
import ErrorMessage from '../common/ErrorMessage';

const priorityLabels = {
  [TaskPriority.LOW]: '낮음',
  [TaskPriority.MEDIUM]: '중간',
  [TaskPriority.HIGH]: '높음',
};

const priorityColors = {
  [TaskPriority.LOW]: 'success',
  [TaskPriority.MEDIUM]: 'warning',
  [TaskPriority.HIGH]: 'error',
};

const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<{ [key in TaskStatus]: Task[] }>({
    [TaskStatus.TODO]: [],
    [TaskStatus.IN_PROGRESS]: [],
    [TaskStatus.DONE]: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [taskForm, setTaskForm] = useState<CreateTaskRequest>({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    assigneeId: 0,
    dueDate: '',
  });
  
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      
      const todoResponse = await getTasks(0, 100, TaskStatus.TODO);
      const inProgressResponse = await getTasks(0, 100, TaskStatus.IN_PROGRESS);
      const doneResponse = await getTasks(0, 100, TaskStatus.DONE);

      if (todoResponse.success && inProgressResponse.success && doneResponse.success) {
        setTasks({
          [TaskStatus.TODO]: todoResponse.data.content,
          [TaskStatus.IN_PROGRESS]: inProgressResponse.data.content,
          [TaskStatus.DONE]: doneResponse.data.content,
        });
      } else {
        setError('하나 이상의 작업 목록을 불러오는데 실패했습니다');
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('작업을 불러오는데 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // 유효한 영역 밖으로 드롭된 경우
    if (!destination) return;

    // 움직임이 없는 경우
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const taskId = parseInt(draggableId);
    const sourceStatus = source.droppableId as TaskStatus;
    const destinationStatus = destination.droppableId as TaskStatus;

    // 열 간 이동인 경우 작업 상태 업데이트
    if (sourceStatus !== destinationStatus) {
      try {
        const taskToMove = tasks[sourceStatus].find(task => task.id === taskId);
        if (!taskToMove) return;

        // 상태 업데이트를 한 번에 처리
        setTasks(prevTasks => {
          const sourceColumn = [...prevTasks[sourceStatus]];
          const destinationColumn = [...prevTasks[destinationStatus]];
          
          const [movedTask] = sourceColumn.splice(source.index, 1);
          destinationColumn.splice(destination.index, 0, { ...movedTask, status: destinationStatus });

          return {
            ...prevTasks,
            [sourceStatus]: sourceColumn,
            [destinationStatus]: destinationColumn,
          };
        });

        // 백엔드에서 업데이트
        await updateTaskStatus(taskId, destinationStatus);
      } catch (err) {
        console.error('Error updating task status:', err);
        fetchTasks();
      }
    } else {
      // 같은 열 내 재정렬
      setTasks(prevTasks => {
        const column = [...prevTasks[sourceStatus]];
        const [movedTask] = column.splice(source.index, 1);
        column.splice(destination.index, 0, movedTask);

        return {
          ...prevTasks,
          [sourceStatus]: column,
        };
      });
    }
  };

  const handleOpenDialog = (task: Task | null = null) => {
    if (task) {
      setEditingTask(task);
      setTaskForm({
        title: task.title,
        description: task.description,
        priority: task.priority,
        assigneeId: task.assigneeId,
        dueDate: task.dueDate,
      });
    } else {
      setEditingTask(null);
      setTaskForm({
        title: '',
        description: '',
        priority: TaskPriority.MEDIUM,
        assigneeId: user?.id || 0,
        dueDate: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setTaskForm({
      ...taskForm,
      [name as string]: value,
    });
  };

  const handleSaveTask = async () => {
    try {
      if (editingTask) {
        // 기존 작업 업데이트
        const response = await updateTask(editingTask.id, {
          ...editingTask,
          ...taskForm,
          dueDate: taskForm.dueDate ? taskForm.dueDate.replace('Z', '') : taskForm.dueDate // Remove 'Z' suffix if exists
        });
        if (response.success) {
          fetchTasks();
        }
      } else {
        // 새 작업 생성
        const response = await createTask({
          ...taskForm,
          dueDate: taskForm.dueDate ? taskForm.dueDate.replace('Z', '') : taskForm.dueDate // Remove 'Z' suffix if exists
        });
        if (response.success) {
          fetchTasks();
        }
      }
    } catch (err) {
      console.error('Error saving task:', err);
    } finally {
      handleCloseDialog();
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm('이 작업을 삭제하시겠습니까?')) return;
    
    try {
      await deleteTask(taskId);
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleTaskClick = (taskId: number) => {
    navigate(`/tasks/${taskId}`);
  };

  if (loading) {
    return <LoadingIndicator message="작업을 불러오는 중..." fullHeight />;
  }

  if (error) {
    return <ErrorMessage message={error} fullHeight onRetry={fetchTasks} />;
  }

  const getColumnTitle = (status: TaskStatus) => {
    const titles = {
      [TaskStatus.TODO]: '할 일',
      [TaskStatus.IN_PROGRESS]: '진행 중',
      [TaskStatus.DONE]: '완료',
    };
    return `${titles[status]} (${tasks[status].length})`;
  };
  
  const getColumnColor = (status: TaskStatus) => {
    const colors = {
      [TaskStatus.TODO]: 'warning.light',
      [TaskStatus.IN_PROGRESS]: 'info.light',
      [TaskStatus.DONE]: 'success.light',
    };
    return colors[status];
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, pt: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'primary.main' }}>
          작업 보드
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ 
            py: 1,
            px: 3,
            fontWeight: 600,
            borderRadius: theme.shape.borderRadius,
          }}
        >
          새 작업
        </Button>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', margin: -1.5 }}>
          {Object.entries(tasks).map(([status, columnTasks]) => (
            <Box key={status} sx={{ width: { xs: '100%', md: '33.33%' }, padding: 1.5 }}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: 'background.default',
                  height: '100%',
                  minHeight: '70vh',
                  borderRadius: theme.shape.borderRadius,
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    p: 1.5,
                    bgcolor: getColumnColor(status as TaskStatus),
                    borderRadius: theme.shape.borderRadius,
                    mb: 2,
                    fontWeight: 600,
                    textAlign: 'center',
                  }}
                >
                  {getColumnTitle(status as TaskStatus)}
                </Typography>
                
                <Droppable droppableId={status}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{ minHeight: '60vh' }}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                          {(provided) => (
                            <Paper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => handleTaskClick(task.id)}
                              sx={{
                                p: 2,
                                mb: 2,
                                bgcolor: 'background.paper',
                                boxShadow: theme.shadows[1],
                                position: 'relative',
                                borderRadius: theme.shape.borderRadius,
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                cursor: 'pointer',
                                ':hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: theme.shadows[4],
                                },
                              }}
                            >
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                {task.title}
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                                {truncateText(task.description, 100)}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                  <Chip
                                    label={priorityLabels[task.priority]}
                                    color={priorityColors[task.priority] as any}
                                    size="small"
                                    sx={{ mr: 1 }}
                                  />
                                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                                    기한: {formatDate(task.dueDate)}
                                  </Typography>
                                </Box>
                                <Box onClick={(e) => e.stopPropagation()}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenDialog(task)}
                                    sx={{ mr: 1 }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteTask(task.id)}
                                    color="error"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Paper>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Paper>
            </Box>
          ))}
        </Box>
      </DragDropContext>

      {/* 작업 다이얼로그 폼 */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: theme.shape.borderRadius,
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingTask ? '작업 수정' : '새 작업'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="제목"
              name="title"
              value={taskForm.title}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="설명"
              name="description"
              multiline
              rows={4}
              value={taskForm.description}
              onChange={handleInputChange}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1, mx: -1 }}>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1 }}>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>우선순위</InputLabel>
                  <Select
                    name="priority"
                    value={taskForm.priority}
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
                    <MenuItem value={TaskPriority.LOW}>낮음</MenuItem>
                    <MenuItem value={TaskPriority.MEDIUM}>중간</MenuItem>
                    <MenuItem value={TaskPriority.HIGH}>높음</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1 }}>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>담당자</InputLabel>
                  <Select
                    name="assigneeId"
                    value={taskForm.assigneeId}
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
              </Box>
            </Box>
            <Box sx={{ width: '100%', px: 1, mt: 2 }}>
              <TextField
                fullWidth
                label="마감일"
                name="dueDate"
                type="datetime-local"
                value={taskForm.dueDate ? taskForm.dueDate.substring(0, 16) : ''}
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
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ fontWeight: 500 }}
          >
            취소
          </Button>
          <Button 
            onClick={handleSaveTask} 
            variant="contained" 
            color="primary"
            sx={{ fontWeight: 500, px: 3 }}
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TaskBoard; 