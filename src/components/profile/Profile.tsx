import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  useTheme,
  IconButton,
  Divider,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { withdrawAccount, updateUser, verifyPassword } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, logout, setUser } = useAuth();
  const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
  });
  const [emailError, setEmailError] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  // 이메일 형식 검증 함수
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleWithdrawAccount = async () => {
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    try {
      // 1단계: 비밀번호 확인 API 호출
      const verifyResponse = await verifyPassword(password);

      if (!verifyResponse.success) {
        setError(verifyResponse.message || '비밀번호가 일치하지 않습니다.');
        return;
      }

      // 2단계: 비밀번호 확인 성공 시 계정 삭제 API 호출
      const withdrawResponse = await withdrawAccount();

      if (withdrawResponse.success) {
        logout();
        navigate('/login');
      } else {
        setError(withdrawResponse.message || '회원탈퇴 처리 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('Error withdrawing account:', err);
      setError('회원탈퇴 처리 중 오류가 발생했습니다.');
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
    });
    setEmailError('');
    setUpdateError('');
    setUpdateSuccess('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
    });
    setEmailError('');
    setUpdateError('');
    setUpdateSuccess('');
  };

  const handleEmailChange = (email: string) => {
    setEditForm({ ...editForm, email });

    // 이메일이 비어있지 않고 형식이 잘못된 경우에만 에러 표시
    if (email && !validateEmail(email)) {
      setEmailError('올바른 이메일 형식을 입력해주세요.');
    } else {
      setEmailError('');
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    // 비밀번호 확인
    if (!editForm.currentPassword) {
      setUpdateError('변경사항을 저장하려면 현재 비밀번호를 입력해주세요.');
      return;
    }

    // 이메일 형식 검증
    if (!validateEmail(editForm.email)) {
      setEmailError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    try {
      setUpdateError('');
      setUpdateSuccess('');

      const response = await updateUser(user.id, {
        name: editForm.name,
        email: editForm.email,
        password: editForm.currentPassword, // 비밀번호 포함
      });

      if (response.success && response.data) {
        setUser(response.data);
        setIsEditing(false);
        setUpdateSuccess('프로필이 성공적으로 업데이트되었습니다.');
        setTimeout(() => setUpdateSuccess(''), 3000);
      } else {
        setUpdateError(response.message || '프로필 업데이트 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setUpdateError('프로필 업데이트 중 오류가 발생했습니다.');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
          내 프로필
        </Typography>

        <Paper sx={{ p: 4, mt: 4 }}>
          {updateSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {updateSuccess}
            </Alert>
          )}
          {updateError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {updateError}
            </Alert>
          )}

          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                기본 정보
              </Typography>
              {!isEditing && (
                <IconButton
                  onClick={handleEditClick}
                  color="primary"
                  size="small"
                >
                  <EditIcon />
                </IconButton>
              )}
            </Box>

            {isEditing ? (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="이름"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="이메일"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  error={!!emailError}
                  helperText={emailError}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="현재 비밀번호 (확인용)"
                  type="password"
                  value={editForm.currentPassword}
                  onChange={(e) => setEditForm({ ...editForm, currentPassword: e.target.value })}
                  helperText="변경사항을 저장하려면 현재 비밀번호를 입력해주세요."
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancelEdit}
                  >
                    취소
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSaveProfile}
                    disabled={!editForm.name || !editForm.email || !editForm.currentPassword || !!emailError}
                  >
                    저장
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1">
                  <strong>이름:</strong> {user?.name}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>이메일:</strong> {user?.email}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>권한:</strong> {user?.role === 'ADMIN' ? '관리자' : '일반 사용자'}
                </Typography>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ mt: 6 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'error.main' }}>
              계정 삭제
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, mb: 2, color: 'text.secondary' }}>
              계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setOpenWithdrawDialog(true)}
            >
              계정 삭제
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* 회원탈퇴 확인 다이얼로그 */}
      <Dialog
        open={openWithdrawDialog}
        onClose={() => setOpenWithdrawDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main' }}>계정 삭제 확인</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography variant="body1" sx={{ mb: 3 }}>
            계정을 삭제하시려면 비밀번호를 입력해주세요.
          </Typography>
          <TextField
            fullWidth
            type="password"
            label="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setOpenWithdrawDialog(false)}
            variant="outlined"
          >
            취소
          </Button>
          <Button
            onClick={handleWithdrawAccount}
            variant="contained"
            color="error"
            disabled={!password}
          >
            계정 삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile; 