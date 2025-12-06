import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

interface LoadingIndicatorProps {
  message?: string;
  fullHeight?: boolean;
}

/**
 * 로딩 상태를 표시하는 컴포넌트
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message = '로딩 중...', 
  fullHeight = false 
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
      <CircularProgress 
        size={48} 
        thickness={4} 
        sx={{ 
          color: theme.palette.primary.main,
        }} 
      />
      {message && (
        <Typography 
          variant="body1" 
          sx={{ 
            mt: 3, 
            color: 'text.secondary',
            fontWeight: 500,
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingIndicator; 