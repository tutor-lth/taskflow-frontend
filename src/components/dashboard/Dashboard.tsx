/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  Avatar,
  Divider,
  useTheme,
  alpha,
  IconButton,
  Tooltip as MuiTooltip,
  Menu,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  Assignment as TaskIcon,
  CheckCircle as DoneIcon,
  Error as OverdueIcon,
  Timeline as ProgressIcon,
  MoreVert as MoreIcon,
  TrendingUp as TrendingUpIcon,
  Flag as FlagIcon,
  CalendarToday as CalendarIcon,
  Dashboard as DashboardIcon,
  BarChart as ChartIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getMyTasks, getMyActivities, getWeeklyTrend } from '../../services/dashboardService';
import { DashboardStats, Activity, Task } from '../../types';
import LoadingIndicator from '../common/LoadingIndicator';
import ErrorMessage from '../common/ErrorMessage';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

// 주간 추세 데이터 (API에서 가져올 예정)
interface TrendData {
  name: string;
  tasks: number;
  completed: number;
  date?: string;
}

// DashboardStats 타입 확장
interface EnhancedDashboardStats extends DashboardStats {
  totalTasksChange?: number;
  delayRate?: number;
  progressRate?: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 4 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  };
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<EnhancedDashboardStats | null>(null);
  const [myTasks, setMyTasks] = useState<{ todayTasks: Task[], upcomingTasks: Task[], overdueTasks: Task[] } | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsResponse = await getDashboardStats();
        const tasksResponse = await getMyTasks();
        const activitiesResponse = await getMyActivities();
        const trendResponse = await getWeeklyTrend();

        if (statsResponse.success) {
          // 실제 계산된 데이터 추가
          const delayRate = statsResponse.data.totalTasks > 0 
            ? Math.round((statsResponse.data.overdueTasks / statsResponse.data.totalTasks) * 100)
            : 0;
          
          // 진행률 계산 (진행중 작업 / 전체 작업 * 100)
          const progressRate = statsResponse.data.totalTasks > 0
            ? Math.round((statsResponse.data.inProgressTasks / statsResponse.data.totalTasks) * 100)
            : 0;
            
          const enhancedStats: EnhancedDashboardStats = {
            ...statsResponse.data,
            totalTasksChange: 0,
            delayRate,
            progressRate
          };
          setStats(enhancedStats);
        }
        
        if (tasksResponse.success) {
          setMyTasks(tasksResponse.data);
        }
        
        if (activitiesResponse.success) {
          setActivities(Array.isArray(activitiesResponse.data) 
            ? activitiesResponse.data 
            : activitiesResponse.data.content || []);
        }
        
        if (trendResponse.success) {
          setTrendData(trendResponse.data || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('대시보드 데이터를 불러오는데 실패했습니다. 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 중복된 활동 제거
  const uniqueActivities = useMemo(() => {
    const seen = new Set<number>();
    return activities.filter(activity => {
      if (seen.has(activity.id)) {
        return false;
      }
      seen.add(activity.id);
      return true;
    });
  }, [activities]);

  // 차트 데이터 준비
  const getTaskStatusData = () => {
    if (stats) {
      return [
        { name: '할 일', value: stats.todoTasks },
        { name: '진행 중', value: stats.inProgressTasks },
        { name: '완료', value: stats.completedTasks },
      ];
    }
    
    return [
      { name: '할 일', value: 0 },
      { name: '진행 중', value: 0 },
      { name: '완료', value: 0 },
    ];
  };

  const getProgressData = () => {
    if (stats) {
      return [
        { name: '내 진행률', value: stats.completionRate },
        { name: '팀 진행률', value: stats.teamProgress },
      ];
    }
    
    return [
      { name: '내 진행률', value: 0 },
      { name: '팀 진행률', value: 0 },
    ];
  };

  const COLORS = [theme.palette.warning.main, theme.palette.info.main, theme.palette.success.main];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return <LoadingIndicator message="대시보드를 불러오는 중..." fullHeight />;
  }

  if (error) {
    return <ErrorMessage message={error} fullHeight />;
  }

  return (
    <Container maxWidth="xl" sx={{ pb: 6, px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        mt: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 3, sm: 0 }
      }}>
        <Box>
          <Typography variant="h3" component="h1" sx={{ 
            fontWeight: 700,
            color: 'text.primary',
            mb: 2,
          }}>
            대시보드
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
            안녕하세요, {user?.name || '사용자'}님! 오늘의 프로젝트 현황을 확인하세요.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            mr: 3,
            p: 2,
            px: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            borderRadius: 2,
            width: { xs: '100%', sm: 'auto' }
          }}>
            <CalendarIcon sx={{ fontSize: 24, color: 'primary.main', mr: 1.5 }} />
            <Typography variant="body1" fontWeight={500}>
              {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 탭 네비게이션 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="대시보드 탭"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              minHeight: 60,
              '&.Mui-selected': {
                color: 'primary.main',
              }
            }
          }}
        >
          <Tab 
            icon={<DashboardIcon />} 
            iconPosition="start"
            label="개요" 
            {...a11yProps(0)} 
            sx={{ mr: 2 }}
          />
          <Tab 
            icon={<ChartIcon />} 
            iconPosition="start"
            label="통계 및 차트" 
            {...a11yProps(1)} 
          />
        </Tabs>
      </Box>

      {/* 첫 번째 탭: 개요 */}
      <TabPanel value={tabValue} index={0}>
        {/* 통계 카드: 2줄(2x2)로 넓게 */}
        {/* @ts-ignore */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {/* @ts-ignore */}
          <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
            <Card sx={{ 
              minWidth: 320,
              width: '100%',
              height: 200,
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              ':hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.09)',
              }
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: -20, 
                right: -20, 
                width: '100px', 
                height: '100px',
                borderRadius: '50%',
                background: alpha(theme.palette.primary.main, 0.08),
                zIndex: 0
              }} />
              <CardContent sx={{ position: 'relative', zIndex: 1, p: 5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body1" color="text.secondary" fontWeight={600}>
                    전체 작업
                  </Typography>
                  <Box sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1), 
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 2,
                  }}>
                    <TaskIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h2" sx={{ fontWeight: 700, lineHeight: 1, mb: 1 }}>
                    {stats?.totalTasks || 0}
                  </Typography>
                  <Typography variant="body1" color="success.main" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon sx={{ fontSize: 18, mr: 0.5 }} />
                    {stats?.totalTasksChange || 0}% 증가
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          {/* @ts-ignore */}
          <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
            <Card sx={{ 
              minWidth: 320,
              width: '100%',
              height: 200,
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              ':hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.09)',
              }
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: -20, 
                right: -20, 
                width: '100px', 
                height: '100px',
                borderRadius: '50%',
                background: alpha(theme.palette.success.main, 0.08),
                zIndex: 0
              }} />
              <CardContent sx={{ position: 'relative', zIndex: 1, p: 5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body1" color="text.secondary" fontWeight={600}>
                    완료
                  </Typography>
                  <Box sx={{ 
                    bgcolor: alpha(theme.palette.success.main, 0.1), 
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 2,
                  }}>
                    <DoneIcon sx={{ fontSize: 32, color: 'success.main' }} />
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h2" sx={{ fontWeight: 700, lineHeight: 1, mb: 1 }}>
                    {stats?.completedTasks || 0}
                  </Typography>
                  <Typography variant="body1" color="success.main" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon sx={{ fontSize: 18, mr: 0.5 }} />
                    {stats?.completionRate || 0}% 완료율
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          {/* @ts-ignore */}
          <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
            <Card sx={{ 
              minWidth: 320,
              width: '100%',
              height: 200,
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              ':hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.09)',
              }
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: -20, 
                right: -20, 
                width: '100px', 
                height: '100px',
                borderRadius: '50%',
                background: alpha(theme.palette.info.main, 0.08),
                zIndex: 0
              }} />
              <CardContent sx={{ position: 'relative', zIndex: 1, p: 5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body1" color="text.secondary" fontWeight={600}>
                    진행 중
                  </Typography>
                  <Box sx={{ 
                    bgcolor: alpha(theme.palette.info.main, 0.1), 
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 2,
                  }}>
                    <ProgressIcon sx={{ fontSize: 32, color: 'info.main' }} />
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h2" sx={{ fontWeight: 700, lineHeight: 1, mb: 1 }}>
                    {stats?.inProgressTasks || 0}
                  </Typography>
                  <Typography variant="body1" color="info.main" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon sx={{ fontSize: 18, mr: 0.5 }} />
                    진행률 {stats?.progressRate || 0}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          {/* @ts-ignore */}
          <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
            <Card sx={{ 
              minWidth: 320,
              width: '100%',
              height: 200,
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              ':hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.09)',
              }
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: -20, 
                right: -20, 
                width: '100px', 
                height: '100px',
                borderRadius: '50%',
                background: alpha(theme.palette.error.main, 0.08),
                zIndex: 0
              }} />
              <CardContent sx={{ position: 'relative', zIndex: 1, p: 5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body1" color="text.secondary" fontWeight={600}>
                    기한 초과
                  </Typography>
                  <Box sx={{ 
                    bgcolor: alpha(theme.palette.error.main, 0.1), 
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 2,
                  }}>
                    <OverdueIcon sx={{ fontSize: 32, color: 'error.main' }} />
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h2" sx={{ fontWeight: 700, lineHeight: 1, mb: 1 }}>
                    {stats?.overdueTasks || 0}
                  </Typography>
                  <Typography variant="body1" color="error.main" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon sx={{ fontSize: 18, mr: 0.5, transform: 'rotate(180deg)' }} />
                    지연율 {stats?.delayRate || 0}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 내 작업과 활동 피드 (내 작업 더 넓게) */}
        {/* @ts-ignore */}
        <Grid container spacing={2} alignItems="stretch">
          {/* 내 작업 */}
          {/* @ts-ignore */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              width: '100%',
              p: 2, 
              height: '100%',
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <Box sx={{ 
                p: 4, 
                bgcolor: alpha(theme.palette.primary.main, 0.03),
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h5" fontWeight={700}>
                    내 작업
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      py: 1, 
                      px: 2, 
                      borderRadius: 1.5, 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main',
                      fontWeight: 600,
                    }}
                  >
                    오늘 ({myTasks?.todayTasks?.length || 0})
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: 1, p: 2 }}>
                {myTasks?.todayTasks && myTasks.todayTasks.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {myTasks.todayTasks.slice(0, 3).map((task) => (
                      <ListItem key={task.id} sx={{ px: 2, py: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: task.priority === 'HIGH' ? 'error.main' : 
                                       task.priority === 'MEDIUM' ? 'warning.main' : 'success.main'
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={500} noWrap>
                              {task.title}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {task.assignee?.name || '미지정'}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                    {myTasks.todayTasks.length > 3 && (
                      <ListItem sx={{ px: 2, py: 1 }}>
                        <ListItemText>
                          <Typography
                              variant="h6"
                              textAlign="center"
                              color="secondary.main"
                              onClick={() => navigate('/tasks')}
                              sx={{
                                cursor: 'pointer',
                                fontWeight: 600,
                                ':hover': { textDecoration: 'underline' },
                              }}
                          >
                            +{myTasks.todayTasks.length - 3}개 더 보기
                          </Typography>
                        </ListItemText>
                      </ListItem>
                    )}
                  </List>
                ) : (
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                    <Typography variant="h5" color="text.secondary" textAlign="center">
                      오늘 예정된 작업이 없습니다.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* 활동 피드 */}
          {/* @ts-ignore */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              width: '100%',
              p: 2, 
              height: '100%',
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <Box sx={{ 
                p: 4, 
                bgcolor: alpha(theme.palette.secondary.main, 0.03),
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}>
                <Typography variant="h5" fontWeight={700}>
                  활동 피드
                </Typography>
              </Box>
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {uniqueActivities && uniqueActivities.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {uniqueActivities.slice(0, 3).map((activity, index) => (
                      <React.Fragment key={activity.id}>
                        <ListItem
                          alignItems="flex-start"
                          sx={{
                            px: 4,
                            py: 3,
                            transition: 'background-color 0.2s',
                            ':hover': {
                              bgcolor: alpha(theme.palette.secondary.main, 0.03),
                            },
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
                              {activity.user?.name?.charAt(0) || '?'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                                {activity.description}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                                {new Date(activity.createdAt).toLocaleDateString('ko-KR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {index < Math.min(uniqueActivities.length, 3) - 1 && <Divider component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8 }}>
                    <Typography variant="h5" color="text.secondary" textAlign="center">
                      최근 활동이 없습니다.
                    </Typography>
                  </Box>
                )}
              </Box>
              {uniqueActivities && uniqueActivities.length > 3 && (
                <Box sx={{
                  p: 4,
                  textAlign: 'center',
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}>
                  <Typography
                    variant="h6"
                    color="secondary.main"
                    onClick={() => navigate('/activities')}
                    sx={{
                      cursor: 'pointer',
                      fontWeight: 600,
                      ':hover': { textDecoration: 'underline' },
                    }}
                  >
                    +{uniqueActivities.length - 3}개 활동 더 보기
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* 두 번째 탭: 통계 및 차트 (두 줄 레이아웃) */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ 
          width: '100%',
          maxWidth: '100%',
          overflowX: 'auto',
          pb: 2
        }}>
          <Box sx={{
            minWidth: '1400px',
            width: '100%',
            px: { xs: 1, md: 2 }
          }}>
            {/* 첫 줄: 작업 상태와 진행률 */}
            {/* @ts-ignore */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {/* @ts-ignore */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: { xs: 2, md: 3 }, 
                  height: { xs: 480, md: 540 },
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                  minWidth: '650px',
                  width: '100%'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: { xs: 3, md: 4 },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 2, sm: 0 }
                  }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                        작업 상태
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        현재 작업 상태별 통계
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 380 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getTaskStatusData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={90}
                          outerRadius={150}
                          paddingAngle={6}
                          fill="#8884d8"
                          dataKey="value"
                          stroke="none"
                          startAngle={90}
                          endAngle={-270}
                        >
                          {getTaskStatusData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: theme.palette.background.paper,
                            borderRadius: 8,
                            boxShadow: theme.shadows[3],
                            border: 'none',
                            padding: '12px 16px',
                            fontSize: 13,
                            minWidth: '150px'
                          }}
                        />
                        <Legend 
                          verticalAlign="bottom"
                          height={36}
                          iconSize={10}
                          iconType="circle"
                          wrapperStyle={{
                            width: '100%',
                            paddingLeft: '10%',
                            paddingRight: '10%'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
              {/* @ts-ignore */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: { xs: 2, md: 3 }, 
                  height: { xs: 480, md: 540 },
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                  minWidth: '650px',
                  width: '100%'
                }}>
                  <Box sx={{ mb: { xs: 3, md: 4 } }}>
                    <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                      진행률
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      현재 진행률별 통계
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    mt: -2,
                    height: 400
                  }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getProgressData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={6}
                          fill="#8884d8"
                          dataKey="value"
                          stroke="none"
                          startAngle={90}
                          endAngle={-270}
                        >
                          {getProgressData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={[theme.palette.primary.main, theme.palette.info.main][index]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: theme.palette.background.paper,
                            borderRadius: 8,
                            boxShadow: theme.shadows[3],
                            border: 'none',
                            padding: '12px 16px',
                            fontSize: 13,
                            minWidth: '150px'
                          }}
                        />
                        <Legend 
                          verticalAlign="bottom"
                          height={36}
                          iconSize={10}
                          iconType="circle"
                          wrapperStyle={{
                            width: '100%',
                            paddingLeft: '10%',
                            paddingRight: '10%'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* 두 번째 줄: 주간 작업 추세 */}
            {/* @ts-ignore */}
            <Grid container spacing={3}>
              {/* @ts-ignore */}
              <Grid item xs={12}>
                <Paper sx={{ 
                  p: { xs: 2, md: 3 }, 
                  height: { xs: 520, md: 580 },
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                  minWidth: '1400px',
                  width: '100%'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: { xs: 3, md: 4 },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 2, sm: 0 }
                  }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                        주간 작업 추세
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        이번 주 작업 완료 현황
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1,
                      bgcolor: alpha(theme.palette.background.default, 0.8),
                      p: 1,
                      borderRadius: 2,
                    }}>
                      <Box sx={{ 
                        py: 1.5, 
                        px: 3, 
                        borderRadius: 1.5, 
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                      }}>
                        주간
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ width: '100%', height: { xs: 420, md: 480 } }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={trendData}
                        margin={{
                          top: 20,
                          right: 20,
                          left: 0,
                          bottom: 20,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.2)} />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ 
                            fontSize: 13, 
                            fill: theme.palette.text.secondary,
                            fontWeight: 500
                          }}
                          interval={0}
                          padding={{ left: 0, right: 0 }}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ 
                            fontSize: 13, 
                            fill: theme.palette.text.secondary,
                            fontWeight: 500
                          }}
                          width={40}
                        />
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: theme.palette.background.paper,
                            borderRadius: 8,
                            boxShadow: theme.shadows[3],
                            border: 'none',
                            padding: '12px 16px',
                            fontSize: 13,
                            minWidth: '150px'
                          }}
                        />
                        <Legend 
                          verticalAlign="top" 
                          height={36}
                          iconSize={10}
                          iconType="circle"
                          wrapperStyle={{
                            width: '100%',
                            paddingLeft: '10%',
                            paddingRight: '10%'
                          }}
                          formatter={(value) => (
                            <span style={{ 
                              color: theme.palette.text.primary, 
                              fontSize: 13, 
                              fontWeight: 500,
                              marginLeft: 8,
                              width: '100%'
                            }}>
                              {value}
                            </span>
                          )}
                        />
                        <Line
                          type="monotone"
                          dataKey="tasks"
                          stroke={theme.palette.primary.main}
                          strokeWidth={2.5}
                          dot={{ r: 5, fill: theme.palette.primary.main, strokeWidth: 0 }}
                          activeDot={{ r: 7, fill: theme.palette.primary.main }}
                          name="총 작업"
                        />
                        <Line
                          type="monotone"
                          dataKey="completed"
                          stroke={theme.palette.success.main}
                          strokeWidth={2.5}
                          dot={{ r: 5, fill: theme.palette.success.main, strokeWidth: 0 }}
                          activeDot={{ r: 7, fill: theme.palette.success.main }}
                          name="완료된 작업"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </TabPanel>
    </Container>
  );
};

export default Dashboard;