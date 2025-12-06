import React, { useState } from 'react';
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
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../services/authService';
import { useMock } from '../../context/MockContext';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import StorageIcon from '@mui/icons-material/Storage';
import CloudIcon from '@mui/icons-material/Cloud';
import Tooltip from '@mui/material/Tooltip';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { useMock: isMockEnabled, toggleMock } = useMock();
  const theme = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.name) {
      setError('모든 필수 항목을 입력해주세요');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });
      
      if (response.success) {
        navigate('/login', { state: { message: '회원가입이 완료되었습니다. 로그인해주세요.' } });
      } else {
        setError(response.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      setError('회원가입에 실패했습니다. 다시 시도해주세요.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          marginBottom: 8,
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
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: theme.shape.borderRadius,
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
            회원가입
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
              id="name"
              label="이름"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeOutlinedIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="아이디"
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="이메일"
              name="email"
              autoComplete="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon color="action" />
                  </InputAdornment>
                ),
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
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
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
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="비밀번호 확인"
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VerifiedUserOutlinedIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="비밀번호 확인 보기 전환"
                      onClick={handleToggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 4, 
                mb: 3, 
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
              }}
              disabled={loading}
            >
              {loading ? '가입 중...' : '회원가입'}
            </Button>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <MuiLink component={Link as any} to="/login" variant="body2" sx={{ color: 'primary.main' }}>
                이미 계정이 있으신가요? 로그인
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 