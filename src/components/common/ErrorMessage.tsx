import React from 'react';
import { Box, Typography, Alert, Button, useTheme } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ErrorMessageProps {
  message: string;
  fullHeight?: boolean;
  onRetry?: () => void;
}

/**
 * 오류 메시지를 표시하는 컴포넌트
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  fullHeight = false,
  onRetry
}) => {
  const theme = useTheme();

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: fullHeight ? '80vh' : 'auto',
        p: 4
      }}
    >
      <Box sx={{ mb: 3, color: 'error.main' }}>
        <ErrorOutlineIcon sx={{ fontSize: 48 }} />
      </Box>
      
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 2, 
          fontWeight: 600,
          textAlign: 'center',
          color: 'text.primary'
        }}
      >
        문제가 발생했습니다
      </Typography>
      
      <Alert 
        severity="error" 
        sx={{ 
          width: '100%', 
          maxWidth: 500,
          mb: 3,
          borderRadius: theme.shape.borderRadius,
        }}
      >
        {message}
      </Alert>
      
      {onRetry && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          sx={{ 
            mt: 2,
            px: 3,
            py: 1,
            fontWeight: 600,
          }}
        >
          다시 시도
        </Button>
      )}
    </Box>
  );
};

export default ErrorMessage; 