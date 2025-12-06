import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as TaskIcon,
  Group as TeamIcon,
  Search as SearchIcon,
  AccountCircle,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  ChevronLeft as ChevronLeftIcon,
  Person as ProfileIcon,
  History as ActivityIcon,
  Storage as StorageIcon,
  Cloud as CloudIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { useMock } from '../../context/MockContext';
import Logo from '../../assets/logo.svg';

const drawerWidth = 260;

const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [notificationEl, setNotificationEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useAppTheme();
  const { useMock: isMockEnabled, toggleMock } = useMock();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  // 현재 활성화된 메뉴 아이템
  const [activeItem, setActiveItem] = useState('/');

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenu = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClose = () => {
    setNotificationEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const handleSettings = () => {
    // 설정 페이지로 이동 기능 추가 가능
    handleClose();
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const menuItems = [
    { text: '대시보드', icon: <DashboardIcon />, path: '/' },
    { text: '작업 보드', icon: <TaskIcon />, path: '/tasks' },
    { text: '팀 관리', icon: <TeamIcon />, path: '/team' },
    { text: '검색', icon: <SearchIcon />, path: '/search' },
    { text: '활동 로그', icon: <ActivityIcon />, path: '/activities' },
  ];

  const userMenuItems = [
    { text: '내 프로필', icon: <ProfileIcon />, path: '/profile' },
  ];

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden',
      bgcolor: isDarkMode ? 'background.paper' : '#ffffff',
    }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}>
        {!collapsed && (
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 700, 
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <img src={Logo} alt="Logo" style={{ height: 28, marginRight: 10 }} />
            태스크플로우
          </Typography>
        )}
        <IconButton onClick={toggleCollapse} size="small" sx={{ color: 'text.secondary' }}>
          <ChevronLeftIcon sx={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
        </IconButton>
      </Box>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto', my: 2 }}>
        <List>
          {menuItems.map((item) => {
            const isActive = activeItem === item.path;
            return (
              <ListItem 
                key={item.text} 
                disablePadding 
                sx={{ display: 'block', px: collapsed ? 0.5 : 1 }}
              >
                <ListItemButton 
                  onClick={() => {
                    navigate(item.path);
                    if(mobileOpen) setMobileOpen(false);
                  }}
                  sx={{
                    minHeight: 48,
                    justifyContent: collapsed ? 'center' : 'initial',
                    px: 2.5,
                    mx: 1,
                    my: 0.5,
                    borderRadius: '12px',
                    bgcolor: isActive ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                    color: isActive ? 'primary.main' : 'text.primary',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? 0 : 2,
                      justifyContent: 'center',
                      color: isActive ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ 
                        fontWeight: isActive ? 600 : 400, 
                        fontSize: '0.95rem' 
                      }} 
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
      
      {!collapsed && (
        <Box sx={{ 
          p: 2, 
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            width: '100%',
            py: 1,
            px: 2,
            borderRadius: '12px',
            bgcolor: alpha(theme.palette.primary.main, 0.08),
          }}>
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40, 
                bgcolor: 'primary.main',
                boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.4)}`,
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ ml: 1.5, overflow: 'hidden' }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                {user?.name || '사용자'}
              </Typography>
              <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
                {user?.email || 'user@example.com'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${collapsed ? 64 : drawerWidth}px)` },
          ml: { sm: collapsed ? 64 : drawerWidth },
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          backdropFilter: 'blur(8px)',
          bgcolor: alpha(theme.palette.background.default, 0.8),
          color: 'text.primary',
          transition: 'width 0.3s, margin-left 0.3s',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
              {menuItems.find((item) => item.path === activeItem)?.text || '태스크플로우'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={isDarkMode ? "라이트 모드" : "다크 모드"}>
              <IconButton color="inherit" onClick={toggleTheme} sx={{ mx: 0.5 }}>
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title={isMockEnabled ? "Mock 데이터 사용 중" : "실제 API 사용 중"}>
              <IconButton
                color="inherit"
                onClick={toggleMock}
                sx={{
                  mx: 0.5,
                  bgcolor: isMockEnabled ? alpha(theme.palette.warning.main, 0.2) : 'transparent',
                  '&:hover': {
                    bgcolor: isMockEnabled ? alpha(theme.palette.warning.main, 0.3) : alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                {isMockEnabled ? <StorageIcon /> : <CloudIcon />}
              </IconButton>
            </Tooltip>

            {/*<Tooltip title="알림">*/}
            {/*  <IconButton */}
            {/*    color="inherit" */}
            {/*    onClick={handleNotificationMenu}*/}
            {/*    sx={{ mx: 0.5 }}*/}
            {/*  >*/}
            {/*    <Badge badgeContent={3} color="error">*/}
            {/*      <NotificationsIcon />*/}
            {/*    </Badge>*/}
            {/*  </IconButton>*/}
            {/*</Tooltip>*/}
            
            {/*<Tooltip title="설정">*/}
            {/*  <IconButton */}
            {/*    color="inherit" */}
            {/*    onClick={handleSettings}*/}
            {/*    sx={{ mx: 0.5 }}*/}
            {/*  >*/}
            {/*    <SettingsIcon />*/}
            {/*  </IconButton>*/}
            {/*</Tooltip>*/}
            
            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
              sx={{ ml: 0.5 }}
            >
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  bgcolor: 'primary.main',
                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.4)}`,
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
            
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              sx={{
                '& .MuiPaper-root': {
                  borderRadius: 2,
                  boxShadow: theme.shadows[4],
                  mt: 1,
                }
              }}
            >
              {userMenuItems.map((item) => (
                <MenuItem key={item.text} onClick={() => {
                  navigate(item.path);
                  handleClose();
                }}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  {item.text}
                </MenuItem>
              ))}
              {/*<MenuItem onClick={handleSettings}>*/}
              {/*  <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>*/}
              {/*  설정*/}
              {/*</MenuItem>*/}
              <Divider />
              <MenuItem onClick={handleLogout}>
                로그아웃
              </MenuItem>
            </Menu>
            
            <Menu
              id="notification-menu"
              anchorEl={notificationEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(notificationEl)}
              onClose={handleNotificationClose}
              sx={{
                '& .MuiPaper-root': {
                  borderRadius: 2,
                  boxShadow: theme.shadows[4],
                  width: 320,
                  mt: 1,
                }
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>알림</Typography>
              </Box>
              <Divider />
              <List sx={{ p: 0 }}>
                <ListItem sx={{ px: 2, py: 1.5 }}>
                  <ListItemText 
                    primary="새 작업이 할당되었습니다." 
                    secondary="방금 전"
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem sx={{ px: 2, py: 1.5 }}>
                  <ListItemText 
                    primary="회의 일정 변경" 
                    secondary="1시간 전"
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem sx={{ px: 2, py: 1.5 }}>
                  <ListItemText 
                    primary="김민수님이 댓글을 남겼습니다." 
                    secondary="3시간 전"
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              </List>
              <Divider />
              <Box sx={{ p: 1 }}>
                <Typography 
                  variant="body2" 
                  align="center" 
                  sx={{ 
                    py: 1, 
                    color: 'primary.main', 
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  모든 알림 보기
                </Typography>
              </Box>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ 
          width: { 
            sm: collapsed ? 64 : drawerWidth 
          }, 
          flexShrink: { sm: 0 },
          transition: 'width 0.3s',
        }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              boxShadow: theme.shadows[8],
              borderRight: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: collapsed ? 64 : drawerWidth,
              transition: 'width 0.3s',
              boxShadow: theme.shadows[2],
              border: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${collapsed ? 64 : drawerWidth}px)` },
          transition: 'width 0.3s, margin 0.3s',
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout; 