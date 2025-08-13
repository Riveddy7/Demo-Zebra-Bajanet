
'use client';

import React, { useState, useEffect, useRef } from 'react';
import InventoryDisplay from '@/components/InventoryDisplay';
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Toolbar,
  Typography,
  ThemeProvider,
  createTheme,
  Fab,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
  Paper,
  IconButton,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

// Material Design Shrine-inspired theme
const createShrineTheme = (darkMode) => createTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: {
      main: darkMode ? '#FFCDD2' : '#E91E63', // Shrine Pink
      light: darkMode ? '#FFECF0' : '#F8BBD9',
      dark: darkMode ? '#F8BBD9' : '#C2185B',
      contrastText: darkMode ? '#1A0E13' : '#FFFFFF',
    },
    secondary: {
      main: darkMode ? '#D7CCC8' : '#6D4C41', // Shrine Brown
      light: darkMode ? '#EFEBE9' : '#8D6E63',
      dark: darkMode ? '#A1887F' : '#5D4037',
      contrastText: darkMode ? '#1A1717' : '#FFFFFF',
    },
    background: {
      default: darkMode ? '#1A0E13' : '#FFFBFA', // Shrine Cream/Dark
      paper: darkMode ? '#2D1518' : '#FFFFFF',
    },
    surface: {
      main: darkMode ? '#2D1518' : '#FFFBFA',
    },
    text: {
      primary: darkMode ? '#FFECF0' : '#1A0E13',
      secondary: darkMode ? 'rgba(255, 236, 240, 0.7)' : 'rgba(26, 14, 19, 0.6)',
    },
    divider: darkMode ? 'rgba(255, 236, 240, 0.12)' : 'rgba(26, 14, 19, 0.08)',
    error: {
      main: '#F44336',
    },
    warning: {
      main: '#FF9800',
    },
    success: {
      main: '#4CAF50',
    },
  },
  typography: {
    fontFamily: '"Rubik", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 500,
      fontSize: '2.2rem',
      letterSpacing: '0.02em',
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.8rem',
      letterSpacing: '0.01em',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: darkMode 
            ? '0 2px 8px rgba(0, 0, 0, 0.3)'
            : '0 1px 3px rgba(26, 14, 19, 0.12), 0 1px 2px rgba(26, 14, 19, 0.24)',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: darkMode
              ? '0 4px 12px rgba(0, 0, 0, 0.4)'
              : '0 2px 6px rgba(26, 14, 19, 0.15), 0 2px 4px rgba(26, 14, 19, 0.3)',
            transform: 'translateY(-1px)',
          },
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          background: darkMode
            ? 'rgba(45, 21, 24, 0.95)'
            : 'rgba(255, 251, 250, 0.95)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: darkMode
            ? '0 2px 8px rgba(0, 0, 0, 0.3)'
            : '0 1px 3px rgba(26, 14, 19, 0.12)',
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: darkMode
            ? '0 1px 3px rgba(0, 0, 0, 0.2)'
            : '0 1px 3px rgba(26, 14, 19, 0.12)',
        }),
      },
    },
    MuiFab: {
      styleOverrides: {
        root: ({ theme }) => ({
          background: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          '&:hover': {
            background: theme.palette.primary.dark,
            transform: 'scale(1.05)',
          },
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 16,
          fontWeight: 500,
        }),
      },
    },
  },
});

export default function Home() {
  const [antennaData, setAntennaData] = useState([]);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [frozenData, setFrozenData] = useState([]);
  const [alertedTags, setAlertedTags] = useState(new Set());
  const [tagAlerts, setTagAlerts] = useState(new Map());
  const [notifications, setNotifications] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  // Cargar preferencia de tema desde localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('shrine-dark-mode');
      if (savedTheme) {
        setDarkMode(JSON.parse(savedTheme));
      }
    }
  }, []);
  const intervalRef = useRef(null);
  const tagHistoryRef = useRef(new Map());
  const scanCountRef = useRef(0);

  const theme = createShrineTheme(darkMode);

  // Sistema de alertas y notificaciones
  const checkTagAlerts = (currentData) => {
    scanCountRef.current++;
    const currentTags = new Set();
    
    // Recopilar todos los tags actuales
    currentData.forEach(antenna => {
      antenna.tags.forEach(tag => {
        currentTags.add(tag.idHex);
        tagHistoryRef.current.set(tag.idHex, scanCountRef.current);
      });
    });
    
    // Verificar tags con alertas que han desaparecido
    tagAlerts.forEach((alertData, tagId) => {
      const lastSeen = tagHistoryRef.current.get(tagId) || 0;
      const scansSinceLastSeen = scanCountRef.current - lastSeen;
      
      if (scansSinceLastSeen >= 2 && !notifications.find(n => n.tagId === tagId && n.active)) {
        const notification = {
          id: Date.now(),
          tagId: tagId,
          message: `¡ALERTA! Tag ${tagId.slice(0, 8)}... no detectado hace ${scansSinceLastSeen} escaneos`,
          active: true,
          timestamp: new Date(),
        };
        setNotifications(prev => [...prev, notification]);
        
        // Verificar si las notificaciones están disponibles antes de usarlas
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('IAMET RFID Alert', {
              body: notification.message,
              icon: '/favicon.ico'
            });
          } catch (error) {
            console.log('Notification not supported:', error);
          }
        }
      }
    });
  };

  const fetchInventory = async () => {
    if (!isScanning) return;
    
    try {
      const response = await fetch('/api/rfid', { cache: 'no-store' });
      
      if (!response.ok) {
        throw new Error('Error al conectar con el servidor');
      }
      
      const data = await response.json();
      
      if (data.antennas && Array.isArray(data.antennas)) {
        setAntennaData(data.antennas);
        setLastUpdate(data.timestamp);
        checkTagAlerts(data.antennas);
      } else if (data.message) {
        setAntennaData([]);
        setLastUpdate(null);
      } else {
        setAntennaData([]);
      }
      
      setError('');
    } catch (err) {
      setError(`Error de conexión: ${err.message}`);
      setAntennaData([]);
    }
  };

  const toggleScanning = () => {
    if (isScanning) {
      // Pausar - congelar datos actuales
      setFrozenData([...antennaData]);
      clearInterval(intervalRef.current);
    } else {
      // Reanudar
      startScanning();
    }
    setIsScanning(!isScanning);
  };

  const startScanning = () => {
    fetchInventory();
    intervalRef.current = setInterval(fetchInventory, 3000);
  };

  const addTagAlert = (tag) => {
    const newAlerts = new Map(tagAlerts);
    newAlerts.set(tag.idHex, { 
      tag: tag, 
      addedAt: new Date(),
      lastSeen: scanCountRef.current 
    });
    setTagAlerts(newAlerts);
    setAlertedTags(prev => new Set([...prev, tag.idHex]));
  };

  const removeTagAlert = (tagId) => {
    const newAlerts = new Map(tagAlerts);
    newAlerts.delete(tagId);
    setTagAlerts(newAlerts);
    setAlertedTags(prev => {
      const newSet = new Set(prev);
      newSet.delete(tagId);
      return newSet;
    });
    
    // Remover notificaciones activas
    setNotifications(prev => prev.filter(n => n.tagId !== tagId));
  };

  const dismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  useEffect(() => {
    // Solicitar permisos de notificación solo si están disponibles
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        if (Notification.permission === 'default') {
          Notification.requestPermission().catch(error => {
            console.log('Notification permission request failed:', error);
          });
        }
      } catch (error) {
        console.log('Notifications not supported:', error);
      }
    }
    
    startScanning();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isScanning && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [isScanning]);

  const displayData = isScanning ? antennaData : frozenData;

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shrine-dark-mode', JSON.stringify(newDarkMode));
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: 'background.default',
        position: 'relative',
        transition: 'background-color 0.3s ease',
      }}>
        <AppBar position="static" elevation={0}>
          <Toolbar sx={{ 
            justifyContent: 'space-between', 
            px: { xs: 1, md: 4 },
            py: { xs: 0.5, md: 1 },
            minHeight: { xs: 56, md: 70 }
          }}>
            <Box display="flex" alignItems="center" gap={{ xs: 1, md: 2 }}>
              <Typography
                variant={{ xs: 'h5', md: 'h4' }}
                sx={{
                  color: 'primary.main',
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                }}
              >
                SHRINE
              </Typography>
              <Box display={{ xs: 'none', sm: 'block' }}>
                <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 500 }}>
                  Inventory System
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                  RFID Asset Tracking
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton
                onClick={toggleDarkMode}
                sx={{ 
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'rgba(233, 30, 99, 0.08)',
                  },
                }}
              >
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={isScanning}
                    onChange={toggleScanning}
                    size="medium"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: 'primary.main',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: 'primary.main',
                      },
                      '& .MuiSwitch-root': {
                        '@media (max-width: 600px)': {
                          transform: 'scale(0.8)',
                        },
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ 
                    color: 'text.secondary',
                    fontSize: { xs: '0.75rem', md: '0.875rem' }
                  }}>
                    {isScanning ? 'Activo' : 'Pausado'}
                  </Typography>
                }
              />
            </Box>
          </Toolbar>
        </AppBar>

        <Container component="main" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 4 } }}>
          {/* Status Bar */}
          <Paper sx={{ 
            p: { xs: 3, md: 4 }, 
            mb: 4,
            background: darkMode 
              ? 'linear-gradient(135deg, #2D1518 0%, #3D1E22 100%)'
              : 'linear-gradient(135deg, #FFFFFF 0%, #FFFBFA 100%)',
            borderRadius: 2,
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box display="flex" gap={{ xs: 2, md: 4 }} flexWrap="wrap">
                <Box>
                  <Typography variant={{ xs: 'h4', md: 'h3' }} sx={{ color: 'primary.main', fontWeight: 500 }}>
                    {displayData.reduce((sum, antenna) => sum + (antenna.tags?.length || 0), 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Tags Detectados
                  </Typography>
                </Box>
                <Box>
                  <Typography variant={{ xs: 'h4', md: 'h3' }} sx={{ color: 'success.main', fontWeight: 500 }}>
                    {displayData.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Antenas Activas
                  </Typography>
                </Box>
                <Box>
                  <Typography variant={{ xs: 'h4', md: 'h3' }} sx={{ color: 'warning.main', fontWeight: 500 }}>
                    {tagAlerts.size}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Alertas Activas
                  </Typography>
                </Box>
              </Box>
              
              {lastUpdate && (
                <Typography variant="body2" sx={{ 
                  color: 'text.secondary', 
                  fontSize: { xs: '0.7rem', md: '0.8rem' },
                  display: { xs: 'none', sm: 'block' }
                }}>
                  Última actualización: {new Date(lastUpdate).toLocaleString('es-ES')}
                </Typography>
              )}
            </Box>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <InventoryDisplay 
            antennaData={displayData}
            alertedTags={alertedTags}
            onAddAlert={addTagAlert}
            onRemoveAlert={removeTagAlert}
            darkMode={darkMode}
          />
        </Container>

        {/* Floating Action Button with Shrine styling */}
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            width: 72,
            height: 72,
            zIndex: 1000,
            background: darkMode 
              ? 'linear-gradient(135deg, #FFCDD2 0%, #F8BBD9 100%)'
              : 'linear-gradient(135deg, #E91E63 0%, #AD1457 100%)',
            boxShadow: darkMode
              ? '0 8px 32px rgba(255, 205, 210, 0.3)'
              : '0 8px 32px rgba(233, 30, 99, 0.3)',
            '&:hover': {
              transform: 'scale(1.05) translateY(-2px)',
              boxShadow: darkMode
                ? '0 12px 40px rgba(255, 205, 210, 0.4)'
                : '0 12px 40px rgba(233, 30, 99, 0.4)',
            },
          }}
          onClick={toggleScanning}
        >
          {isScanning ? <PauseIcon sx={{ fontSize: 32 }} /> : <PlayArrowIcon sx={{ fontSize: 32 }} />}
        </Fab>

        {/* Notifications */}
        {notifications.map((notification) => (
          <Snackbar
            key={notification.id}
            open={true}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            onClose={() => dismissNotification(notification.id)}
            autoHideDuration={10000}
          >
            <Alert 
              severity="error" 
              onClose={() => dismissNotification(notification.id)}
              sx={{
                background: darkMode ? 'rgba(45, 21, 24, 0.95)' : 'rgba(255, 251, 250, 0.95)',
                backdropFilter: 'blur(20px) saturate(180%)',
                border: `1px solid ${theme.palette.error.main}30`,
                color: 'error.main'
              }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        ))}
      </Box>
    </ThemeProvider>
  );
}
