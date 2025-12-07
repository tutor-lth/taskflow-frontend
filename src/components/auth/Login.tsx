import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  useTheme,
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useMock } from '../../context/MockContext';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import StorageIcon from '@mui/icons-material/Storage';
import CloudIcon from '@mui/icons-material/Cloud';
import Tooltip from '@mui/material/Tooltip';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser, isAuthenticated } = useAuth();
  const { useMock: isMockEnabled, toggleMock } = useMock();
  const theme = useTheme();

  // 이미 로그인되어 있으면 홈으로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('아이디와 비밀번호를 모두 입력해주세요');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await login({ username, password });
      
      if (response.success && response.data && response.data.token) {
        // refreshUser를 통해 인증 상태와 사용자 정보 업데이트
        await refreshUser();
        
        // 이전 페이지 또는 홈으로 리다이렉트
        // const from = location.state?.from?.pathname || 
        // sessionStorage.getItem('redirectAfterLogin') || '/';
        // sessionStorage.removeItem('redirectAfterLogin');
        // navigate(from);
        
        // 프로필 페이지로 리다이렉트
        navigate('/profile');
      } else {
        setError(response.message || '아이디 또는 비밀번호가 일치하지 않습니다');
      }
    } catch (err) {
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleDemoLogin = async () => {
    setUsername('admin');
    setPassword('password');

    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 300);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '80vh',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: { xs: 2, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            overflow: 'visible',
            position: 'relative',
          }}
        >
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <Tooltip title={isMockEnabled ? "Mock 데이터 사용 중" : "실제 API 사용 중"}>
              <IconButton
                onClick={toggleMock}
                sx={{
                  bgcolor: isMockEnabled ? 'warning.light' : 'primary.light',
                  color: 'white',
                  '&:hover': {
                    bgcolor: isMockEnabled ? 'warning.main' : 'primary.main',
                  },
                }}
              >
                {isMockEnabled ? <StorageIcon /> : <CloudIcon />}
              </IconButton>
            </Tooltip>
          </Box>

          <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'primary.main' }}>
            태스크플로우
          </Typography>
          <Typography component="h2" variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            팀 작업 관리 시스템
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="아이디"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 1,
                } 
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="비밀번호"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="비밀번호 보기 전환"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 1,
                } 
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 4, 
                mb: 2,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 1,
              }}
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              sx={{ 
                mb: 3,
                py: 1.5,
                fontSize: '0.9rem',
                borderRadius: 1,
              }}
              onClick={handleDemoLogin}
              disabled={loading}
            >
              데모 계정으로 로그인
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <MuiLink component={Link} to="/register" variant="body2" sx={{ color: 'primary.main' }}>
                계정이 없으신가요? 회원가입
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 