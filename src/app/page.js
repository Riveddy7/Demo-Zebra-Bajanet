
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
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

// Tema oscuro con estilo Apple Glass
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#007AFF', // iOS Blue
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF3B30', // iOS Red
    },
    background: {
      default: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #0F0F23 100%)',
      paper: 'rgba(28, 28, 30, 0.8)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.6)',
    },
    divider: 'rgba(255, 255, 255, 0.1)',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
    h3: {
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(28, 28, 30, 0.8)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(28, 28, 30, 0.8)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 2px 16px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(28, 28, 30, 0.8)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          background: 'rgba(0, 122, 255, 0.9)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '&:hover': {
            background: 'rgba(0, 122, 255, 1)',
          },
        },
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
  const intervalRef = useRef(null);
  const tagHistoryRef = useRef(new Map());
  const scanCountRef = useRef(0);

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
        
        // Solicitar permiso para notificaciones del navegador
        if (Notification.permission === 'granted') {
          new Notification('IAMET RFID Alert', {
            body: notification.message,
            icon: '/favicon.ico'
          });
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
    // Solicitar permisos de notificación
    if (Notification.permission === 'default') {
      Notification.requestPermission();
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #0F0F23 100%)',
        position: 'relative'
      }}>
        <AppBar position="static" elevation={0}>
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography
                variant="h4"
                sx={{
                  background: 'linear-gradient(45deg, #007AFF 30%, #5AC8FA 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                }}
              >
                IAMET
              </Typography>
              <Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                  Real Time Tracker
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
                  RFID Monitoring System
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center" gap={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isScanning}
                    onChange={toggleScanning}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#007AFF',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#007AFF',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {isScanning ? 'Escaneando' : 'Pausado'}
                  </Typography>
                }
              />
            </Box>
          </Toolbar>
        </AppBar>

        <Container component="main" sx={{ py: 4, px: { xs: 2, md: 4 } }}>
          {/* Status Bar */}
          <Paper sx={{ 
            p: 3, 
            mb: 3, 
            background: 'rgba(28, 28, 30, 0.6)',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box display="flex" gap={3}>
                <Box>
                  <Typography variant="h3" sx={{ color: '#007AFF', fontWeight: 700 }}>
                    {displayData.reduce((sum, antenna) => sum + (antenna.tags?.length || 0), 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Tags Detectados
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h3" sx={{ color: '#30D158', fontWeight: 700 }}>
                    {displayData.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Antenas Activas
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h3" sx={{ color: '#FF9F0A', fontWeight: 700 }}>
                    {tagAlerts.size}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Alertas Activas
                  </Typography>
                </Box>
              </Box>
              
              {lastUpdate && (
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                  Última actualización: {new Date(lastUpdate).toLocaleString('es-ES')}
                </Typography>
              )}
            </Box>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 3, 
              background: 'rgba(255, 59, 48, 0.1)',
              border: '1px solid rgba(255, 59, 48, 0.2)',
              '& .MuiAlert-message': { color: '#FF3B30' }
            }}>
              {error}
            </Alert>
          )}

          <InventoryDisplay 
            antennaData={displayData}
            alertedTags={alertedTags}
            onAddAlert={addTagAlert}
            onRemoveAlert={removeTagAlert}
          />
        </Container>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 64,
            height: 64,
            zIndex: 1000,
          }}
          onClick={toggleScanning}
        >
          {isScanning ? <PauseIcon sx={{ fontSize: 28 }} /> : <PlayArrowIcon sx={{ fontSize: 28 }} />}
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
                background: 'rgba(28, 28, 30, 0.95)',
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 59, 48, 0.3)',
                color: '#FF3B30'
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
