import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import { format } from 'date-fns';
import { ActivityLog as ActivityLogType, ActivityType } from '../../types';
import LoadingIndicator from '../common/LoadingIndicator';
import ErrorMessage from '../common/ErrorMessage';
import { getActivityLogs, ActivityLogFilters } from '../../services/activityService';

const activityTypeLabels: Record<ActivityType, string> = {
  [ActivityType.TASK_CREATED]: '작업 생성',
  [ActivityType.TASK_UPDATED]: '작업 수정',
  [ActivityType.TASK_DELETED]: '작업 삭제',
  [ActivityType.TASK_STATUS_CHANGED]: '작업 상태 변경',
  [ActivityType.COMMENT_CREATED]: '댓글 작성',
  [ActivityType.COMMENT_UPDATED]: '댓글 수정',
  [ActivityType.COMMENT_DELETED]: '댓글 삭제',
};

const ActivityLog: React.FC = () => {
  const [activities, setActivities] = useState<ActivityLogType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState<ActivityLogFilters>({
    type: undefined,
    userId: undefined,
    taskId: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  const fetchActivityLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getActivityLogs(page, rowsPerPage, filters);

      if (response && response.content) {
        setActivities(response.content);
        setTotalElements(response.totalElements || 0);
      } else {
        setActivities([]);
        setTotalElements(0);
      }
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setError('활동 로그를 불러오는데 실패했습니다. 다시 시도해주세요.');
      setActivities([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (name: keyof ActivityLogFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value === '' ? undefined : value,
    }));
    setPage(0);
  };

  if (loading) {
    return <LoadingIndicator message="활동 로그를 불러오는 중..." fullHeight />;
  }

  if (error) {
    return <ErrorMessage message={error} fullHeight onRetry={fetchActivityLogs} />;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
          활동 로그
        </Typography>

        {/* 필터 섹션 */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ width: { xs: '100%', sm: '47%', md: '23%' } }}>
              <FormControl fullWidth size="small">
                <InputLabel>활동 유형</InputLabel>
                <Select
                  value={filters.type || ''}
                  label="활동 유형"
                  onChange={(e) => handleFilterChange('type', e.target.value as ActivityType)}
                >
                  <MenuItem value="">전체</MenuItem>
                  {Object.entries(activityTypeLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '47%', md: '23%' } }}>
              <TextField
                fullWidth
                size="small"
                label="작업 ID"
                value={filters.taskId || ''}
                onChange={(e) => handleFilterChange('taskId', e.target.value)}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '47%', md: '23%' } }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="시작일"
                InputLabelProps={{ shrink: true }}
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '47%', md: '23%' } }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="종료일"
                InputLabelProps={{ shrink: true }}
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </Box>
          </Box>
        </Paper>

        {/* 활동 로그 테이블 */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>시간</TableCell>
                <TableCell>사용자</TableCell>
                <TableCell>활동 유형</TableCell>
                <TableCell>작업 ID</TableCell>
                <TableCell>변경 내용</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activities && activities.length > 0 ? (
                activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      {format(new Date(activity.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </TableCell>
                    <TableCell>{activity.user?.name || '알 수 없음'}</TableCell>
                    <TableCell>
                      <Chip
                        label={activityTypeLabels[activity.type] || activity.type}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>{activity.taskId || '-'}</TableCell>
                    <TableCell>{activity.description || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      활동 로그가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalElements}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </TableContainer>
      </Box>
    </Container>
  );
};

export default ActivityLog; 