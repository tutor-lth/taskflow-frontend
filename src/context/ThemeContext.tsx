import React, { createContext, useContext, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, responsiveFontSizes, alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from '../hooks/useTheme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'system',
  isDarkMode: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const useAppTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { themeMode, isDarkMode, toggleTheme, setTheme } = useTheme();

  // 한국 서비스에 맞는 모던한 테마 생성
  const theme = useMemo(() => {
    const baseTheme = createTheme({
      palette: {
        mode: isDarkMode ? 'dark' : 'light',
        primary: {
          main: '#4776E6', // 한국 기업들이 많이 사용하는 파란색 계열
          light: '#8E54E9',
          dark: '#2858c7',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#FF4B6F', // 생동감 있는 핑크/레드 계열
          light: '#FF8095',
          dark: '#CC3C5B',
          contrastText: '#ffffff',
        },
        error: {
          main: '#FF5252',
          light: '#FF7C7C',
          dark: '#C62828',
        },
        warning: {
          main: '#FFB830',
          light: '#FFCC60',
          dark: '#E6A428',
        },
        info: {
          main: '#2196F3',
          light: '#64B6F7',
          dark: '#0B79D0',
        },
        success: {
          main: '#4CAF50',
          light: '#80C683',
          dark: '#3B873E',
        },
        background: {
          default: isDarkMode ? '#121212' : '#F9FAFC',
          paper: isDarkMode ? '#1E1E1E' : '#FFFFFF',
        },
        text: {
          primary: isDarkMode ? '#FFFFFF' : '#2A3549',
          secondary: isDarkMode ? '#B0B7C3' : '#697586',
        },
      },
      typography: {
        fontFamily: [
          'Noto Sans KR', // 한국어 지원 폰트
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ].join(','),
        h1: {
          fontWeight: 700,
          fontSize: '2.5rem',
          lineHeight: 1.3,
        },
        h2: {
          fontWeight: 700,
          fontSize: '2rem',
          lineHeight: 1.3,
        },
        h3: {
          fontWeight: 700,
          fontSize: '1.75rem',
          lineHeight: 1.3,
        },
        h4: {
          fontWeight: 700,
          fontSize: '1.5rem',
          lineHeight: 1.3,
        },
        h5: {
          fontWeight: 600,
          fontSize: '1.25rem',
          lineHeight: 1.4,
        },
        h6: {
          fontWeight: 600,
          fontSize: '1rem',
          lineHeight: 1.4,
        },
        subtitle1: {
          fontWeight: 500,
          fontSize: '1rem',
          lineHeight: 1.5,
        },
        subtitle2: {
          fontWeight: 500,
          fontSize: '0.875rem',
          lineHeight: 1.5,
        },
        body1: {
          fontSize: '1rem',
          lineHeight: 1.6,
        },
        body2: {
          fontSize: '0.875rem',
          lineHeight: 1.6,
        },
        button: {
          fontWeight: 500,
          fontSize: '0.875rem',
          textTransform: 'none',
        },
      },
      shape: {
        borderRadius: 4,
      },
      shadows: [
        'none',
        isDarkMode ? '0 2px 4px rgba(0,0,0,0.4)' : '0 2px 4px rgba(0,0,0,0.05)',
        isDarkMode ? '0 3px 6px rgba(0,0,0,0.4)' : '0 3px 6px rgba(0,0,0,0.07)',
        isDarkMode ? '0 4px 8px rgba(0,0,0,0.4)' : '0 4px 8px rgba(0,0,0,0.09)',
        isDarkMode ? '0 6px 10px rgba(0,0,0,0.4)' : '0 6px 10px rgba(0,0,0,0.11)',
        isDarkMode ? '0 8px 12px rgba(0,0,0,0.4)' : '0 8px 12px rgba(0,0,0,0.13)',
        isDarkMode ? '0 9px 14px rgba(0,0,0,0.4)' : '0 9px 14px rgba(0,0,0,0.15)',
        isDarkMode ? '0 10px 16px rgba(0,0,0,0.4)' : '0 10px 16px rgba(0,0,0,0.17)',
        isDarkMode ? '0 11px 18px rgba(0,0,0,0.4)' : '0 11px 18px rgba(0,0,0,0.19)',
        isDarkMode ? '0 12px 20px rgba(0,0,0,0.4)' : '0 12px 20px rgba(0,0,0,0.21)',
        isDarkMode ? '0 13px 22px rgba(0,0,0,0.4)' : '0 13px 22px rgba(0,0,0,0.23)',
        isDarkMode ? '0 14px 24px rgba(0,0,0,0.4)' : '0 14px 24px rgba(0,0,0,0.25)',
        isDarkMode ? '0 15px 26px rgba(0,0,0,0.4)' : '0 15px 26px rgba(0,0,0,0.27)',
        isDarkMode ? '0 16px 28px rgba(0,0,0,0.4)' : '0 16px 28px rgba(0,0,0,0.29)',
        isDarkMode ? '0 17px 30px rgba(0,0,0,0.4)' : '0 17px 30px rgba(0,0,0,0.31)',
        isDarkMode ? '0 18px 32px rgba(0,0,0,0.4)' : '0 18px 32px rgba(0,0,0,0.33)',
        isDarkMode ? '0 19px 34px rgba(0,0,0,0.4)' : '0 19px 34px rgba(0,0,0,0.35)',
        isDarkMode ? '0 20px 36px rgba(0,0,0,0.4)' : '0 20px 36px rgba(0,0,0,0.37)',
        isDarkMode ? '0 21px 38px rgba(0,0,0,0.4)' : '0 21px 38px rgba(0,0,0,0.39)',
        isDarkMode ? '0 22px 40px rgba(0,0,0,0.4)' : '0 22px 40px rgba(0,0,0,0.41)',
        isDarkMode ? '0 23px 42px rgba(0,0,0,0.4)' : '0 23px 42px rgba(0,0,0,0.43)',
        isDarkMode ? '0 24px 44px rgba(0,0,0,0.4)' : '0 24px 44px rgba(0,0,0,0.45)',
        isDarkMode ? '0 25px 46px rgba(0,0,0,0.4)' : '0 25px 46px rgba(0,0,0,0.47)',
        isDarkMode ? '0 26px 48px rgba(0,0,0,0.4)' : '0 26px 48px rgba(0,0,0,0.49)',
        isDarkMode ? '0 28px 50px rgba(0,0,0,0.4)' : '0 28px 50px rgba(0,0,0,0.51)',
      ],
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            '*': {
              boxSizing: 'border-box',
              margin: 0,
              padding: 0,
            },
            html: {
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              height: '100%',
              width: '100%',
            },
            body: {
              height: '100%',
              width: '100%',
              backgroundColor: isDarkMode ? '#121212' : '#F9FAFC',
            },
            a: {
              textDecoration: 'none',
              color: 'inherit',
            },
            '#root': {
              height: '100%',
              width: '100%',
            },
            '.MuiCardHeader-action': {
              alignSelf: 'center',
            },
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: isDarkMode ? alpha('#FFFFFF', 0.2) : alpha('#000000', 0.2),
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
            },
            '@keyframes pulse': {
              '0%': {
                boxShadow: '0 0 0 0 rgba(71, 118, 230, 0.4)',
              },
              '70%': {
                boxShadow: '0 0 0 10px rgba(71, 118, 230, 0)',
              },
              '100%': {
                boxShadow: '0 0 0 0 rgba(71, 118, 230, 0)',
              },
            },
            '@keyframes fadeIn': {
              '0%': {
                opacity: 0,
                transform: 'translateY(10px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
            '@keyframes slideInFromRight': {
              '0%': {
                opacity: 0,
                transform: 'translateX(10px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateX(0)',
              },
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: 'none',
              transition: 'all 0.2s ease-in-out',
              ':hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              },
            },
            contained: {
              padding: '10px 20px',
              borderRadius: 8,
              '&.MuiButton-containedPrimary': {
                background: `linear-gradient(45deg, ${isDarkMode ? '#4776E6' : '#4776E6'}, ${isDarkMode ? '#8E54E9' : '#8E54E9'})`,
                backgroundSize: '200% auto',
                transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
                ':hover': {
                  backgroundPosition: 'right center',
                  boxShadow: '0 8px 16px rgba(71, 118, 230, 0.25)',
                },
              },
              '&.MuiButton-containedSecondary': {
                background: `linear-gradient(45deg, ${isDarkMode ? '#FF4B6F' : '#FF4B6F'}, ${isDarkMode ? '#FF8095' : '#FF8095'})`,
                backgroundSize: '200% auto',
                transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
                ':hover': {
                  backgroundPosition: 'right center',
                  boxShadow: '0 8px 16px rgba(255, 75, 111, 0.25)',
                },
              },
            },
            outlined: {
              padding: '9px 19px',
              borderRadius: 8,
              borderWidth: 2,
              '&.MuiButton-outlinedPrimary': {
                borderColor: alpha('#4776E6', 0.5),
                ':hover': {
                  borderColor: '#4776E6',
                  backgroundColor: alpha('#4776E6', 0.05),
                },
              },
              '&.MuiButton-outlinedSecondary': {
                borderColor: alpha('#FF4B6F', 0.5),
                ':hover': {
                  borderColor: '#FF4B6F',
                  backgroundColor: alpha('#FF4B6F', 0.05),
                },
              },
            },
            text: {
              '&.MuiButton-textPrimary': {
                position: 'relative',
                '::after': {
                  content: '""',
                  position: 'absolute',
                  width: '0%',
                  height: '2px',
                  bottom: 0,
                  left: '50%',
                  backgroundColor: '#4776E6',
                  transition: 'all 0.3s ease-in-out',
                  transform: 'translateX(-50%)',
                },
                ':hover::after': {
                  width: '80%',
                },
              },
            },
            sizeLarge: {
              padding: '12px 24px',
              fontSize: '1rem',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              boxShadow: isDarkMode 
                ? '0 2px 8px rgba(0, 0, 0, 0.25)' 
                : '0 2px 12px rgba(0, 0, 0, 0.05)',
              backgroundImage: 'none',
            },
            rounded: {
              borderRadius: 12,
            },
            elevation1: {
              boxShadow: isDarkMode 
                ? '0 2px 8px rgba(0, 0, 0, 0.25)' 
                : '0 2px 12px rgba(0, 0, 0, 0.05)',
            },
            elevation2: {
              boxShadow: isDarkMode 
                ? '0 4px 12px rgba(0, 0, 0, 0.25)' 
                : '0 4px 16px rgba(0, 0, 0, 0.08)',
            },
            elevation3: {
              boxShadow: isDarkMode 
                ? '0 6px 16px rgba(0, 0, 0, 0.25)' 
                : '0 6px 20px rgba(0, 0, 0, 0.1)',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              overflow: 'hidden',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              ':hover': {
                transform: 'translateY(-4px)',
                boxShadow: isDarkMode 
                ? '0 12px 28px rgba(0, 0, 0, 0.3)'
                : '0 12px 28px rgba(0, 0, 0, 0.12)',
              },
            },
          },
        },
        MuiCardContent: {
          styleOverrides: {
            root: {
              padding: '24px',
              '&:last-child': {
                paddingBottom: '24px',
              },
            },
          },
        },
        MuiCardHeader: {
          styleOverrides: {
            root: {
              padding: '24px',
            },
            title: {
              fontWeight: 600,
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: 8,
                transition: 'box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out',
                '&:hover': {
                  borderColor: isDarkMode ? alpha('#4776E6', 0.7) : '#4776E6',
                },
                '&.Mui-focused': {
                  boxShadow: `0 0 0 3px ${alpha('#4776E6', 0.15)}`,
                },
              },
            },
          },
        },
        MuiInputBase: {
          styleOverrides: {
            input: {
              '&::placeholder': {
                opacity: 0.7,
              },
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            notchedOutline: {
              transition: 'border-color 0.2s ease-in-out',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              boxShadow: isDarkMode
                ? '0 1px 3px rgba(0, 0, 0, 0.3)'
                : '0 1px 3px rgba(0, 0, 0, 0.08)',
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              padding: '16px 24px',
              borderBottom: `1px solid ${isDarkMode ? alpha('#FFFFFF', 0.1) : alpha('#000000', 0.1)}`,
            },
            head: {
              fontWeight: 600,
              backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F7FA',
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              fontWeight: 500,
              transition: 'all 0.2s ease-in-out',
              '&.MuiChip-colorPrimary': {
                background: `linear-gradient(45deg, ${isDarkMode ? '#4776E6' : '#4776E6'}, ${isDarkMode ? '#8E54E9' : '#8E54E9'})`,
                color: '#fff',
              },
              '&.MuiChip-colorSecondary': {
                background: `linear-gradient(45deg, ${isDarkMode ? '#FF4B6F' : '#FF4B6F'}, ${isDarkMode ? '#FF8095' : '#FF8095'})`,
                color: '#fff',
              },
              '&.MuiChip-outlined': {
                borderWidth: 2,
              },
              '&:hover': {
                transform: 'translateY(-2px)',
              },
            },
          },
        },
        MuiMenuItem: {
          styleOverrides: {
            root: {
              padding: '10px 16px',
              borderRadius: 4,
              margin: '0 8px',
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: isDarkMode ? alpha('#FFFFFF', 0.05) : alpha('#000000', 0.04),
              },
              '&.Mui-selected': {
                backgroundColor: isDarkMode ? alpha('#4776E6', 0.15) : alpha('#4776E6', 0.08),
                '&:hover': {
                  backgroundColor: isDarkMode ? alpha('#4776E6', 0.25) : alpha('#4776E6', 0.12),
                },
              },
            },
          },
        },
        MuiListItemButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              transition: 'all 0.2s',
              '&.Mui-selected': {
                backgroundColor: isDarkMode ? alpha('#4776E6', 0.15) : alpha('#4776E6', 0.08),
                '&:hover': {
                  backgroundColor: isDarkMode ? alpha('#4776E6', 0.25) : alpha('#4776E6', 0.12),
                },
              },
            },
          },
        },
        MuiDivider: {
          styleOverrides: {
            root: {
              backgroundColor: isDarkMode ? alpha('#FFFFFF', 0.1) : alpha('#000000', 0.1),
            },
          },
        },
        MuiAvatar: {
          styleOverrides: {
            root: {
              boxShadow: `0 2px 8px ${alpha('#000000', 0.1)}`,
            },
          },
        },
        MuiTooltip: {
          styleOverrides: {
            tooltip: {
              backgroundColor: isDarkMode ? '#343538' : '#232323',
              fontSize: '0.75rem',
              padding: '8px 12px',
              borderRadius: 6,
              boxShadow: `0 4px 8px ${alpha('#000000', 0.1)}`,
            },
            arrow: {
              color: isDarkMode ? '#343538' : '#232323',
            },
          },
        },
        MuiTabs: {
          styleOverrides: {
            indicator: {
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
            root: {
              '& .MuiTab-root': {
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: isDarkMode ? alpha('#FFFFFF', 0.05) : alpha('#000000', 0.04),
                },
              },
            },
          },
        },
      },
    });

    return responsiveFontSizes(baseTheme);
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ themeMode, isDarkMode, toggleTheme, setTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 