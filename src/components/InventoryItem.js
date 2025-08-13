
'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton, Tooltip } from '@mui/material';
import NfcIcon from '@mui/icons-material/Nfc';
import SignalWifiIcon from '@mui/icons-material/SignalWifi4Bar';
import SignalWifi3BarIcon from '@mui/icons-material/SignalWifi3Bar';
import SignalWifi2BarIcon from '@mui/icons-material/SignalWifi2Bar';
import SignalWifi1BarIcon from '@mui/icons-material/SignalWifi1Bar';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';

const InventoryItem = ({ tag, hasAlert = false, isAlerting = false, onAddAlert, onRemoveAlert, layout = 'card', darkMode = false }) => {
  // Si es un string simple (legacy), usar formato antiguo
  if (typeof tag === 'string') {
    return (
      <Card sx={{ minWidth: 220, textAlign: 'center', m: 1, boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <NfcIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
              ID del Tag
            </Typography>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              {tag}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Función para obtener icono de señal basado en RSSI
  const getSignalIcon = (rssi) => {
    if (rssi >= -30) return <SignalWifiIcon sx={{ color: 'green' }} />;
    if (rssi >= -40) return <SignalWifi3BarIcon sx={{ color: 'orange' }} />;
    if (rssi >= -50) return <SignalWifi2BarIcon sx={{ color: 'orange' }} />;
    return <SignalWifi1BarIcon sx={{ color: 'red' }} />;
  };

  // Función para obtener color de card basado en estado y RSSI
  const getCardColor = (rssi) => {
    const getSignalColor = (rssi) => {
      if (rssi >= -30) return '#4CAF50'; // Success green
      if (rssi >= -40) return '#FF9800'; // Warning orange
      if (rssi >= -50) return '#FFC107'; // Warning amber
      return '#F44336'; // Error red
    };

    const signalColor = getSignalColor(rssi);
    const primaryColor = darkMode ? '#FFCDD2' : '#E91E63';
    const alertColor = darkMode ? '#FF5722' : '#F44336';
    
    if (isAlerting) {
      // Tag está alertando activamente (desaparecido)
      return {
        background: darkMode ? '#2D1518' : '#FFFFFF',
        border: `3px solid ${alertColor}`,
        boxShadow: `0 0 20px ${alertColor}30`,
        animation: 'pulse 2s infinite',
      };
    } else if (hasAlert) {
      // Tag marcado para vigilancia pero presente
      return {
        background: darkMode ? '#2D1518' : '#FFFFFF',
        border: `2px solid ${primaryColor}`,
        borderLeft: `4px solid ${signalColor}`,
        boxShadow: `0 0 12px ${primaryColor}15`,
      };
    }
    
    // Tag normal
    return {
      background: darkMode ? '#2D1518' : '#FFFFFF',
      border: `1px solid ${signalColor}40`,
      borderLeft: `4px solid ${signalColor}`,
      boxShadow: darkMode 
        ? '0 2px 8px rgba(0, 0, 0, 0.3)'
        : '0 1px 3px rgba(26, 14, 19, 0.12), 0 1px 2px rgba(26, 14, 19, 0.24)',
    };
  };

  // Función para formatear el hex ID de forma más legible
  const formatHexId = (hexId) => {
    if (!hexId) return 'N/A';
    // Dividir en grupos de 4 caracteres (compatible con Safari)
    const groups = hexId.match(/.{1,4}/g);
    return groups ? groups.join(' ') : hexId;
  };

  // Convertir hex a texto si es posible
  const hexToText = (hex) => {
    try {
      const str = hex.replace(/^0x/, '');
      let result = '';
      for (let i = 0; i < str.length; i += 2) {
        const byte = parseInt(str.substr(i, 2), 16);
        if (byte >= 32 && byte <= 126) {
          result += String.fromCharCode(byte);
        }
      }
      return result.length > 2 ? result : null;
    } catch (error) {
      return null;
    }
  };

  const textContent = hexToText(tag.idHex);

  // Layout de lista para móvil - optimizado y minimalista
  if (layout === 'list') {
    return (
      <Card 
        sx={{ 
          width: '100%',
          borderRadius: 1,
          transition: 'all 0.2s ease',
          ...getCardColor(tag.peakRssi)
        }}
      >
        <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {/* Contenido principal - sin iconos innecesarios */}
            <Box flex={1} minWidth={0} mr={1}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: '"Roboto Mono", "Courier New", monospace',
                  fontSize: '0.85rem',
                  color: 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: 500,
                  mb: 0.5
                }}
              >
                {formatHexId(tag.idHex)}
              </Typography>
              
              {/* Línea secundaria con info compacta */}
              <Box display="flex" alignItems="center" gap={1}>
                {textContent && (
                  <Typography variant="caption" sx={{ 
                    color: 'primary.main', 
                    fontWeight: 500,
                    fontSize: '0.7rem'
                  }}>
                    {textContent}
                  </Typography>
                )}
                
                {/* Indicador de señal compacto - solo color */}
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: tag.peakRssi >= -40 ? '#4CAF50' : 
                                   tag.peakRssi >= -50 ? '#FF9800' : '#F44336',
                  }}
                />
                
                <Typography variant="caption" sx={{ 
                  color: 'text.secondary',
                  fontSize: '0.7rem'
                }}>
                  {tag.peakRssi} dBm
                </Typography>
              </Box>
            </Box>

            {/* Solo botón de alerta - más compacto */}
            <IconButton
              onClick={hasAlert ? onRemoveAlert : onAddAlert}
              size="small"
              sx={{
                width: 36,
                height: 36,
                backgroundColor: hasAlert 
                  ? (isAlerting ? 'rgba(244, 67, 54, 0.15)' : 'rgba(233, 30, 99, 0.1)')
                  : 'rgba(0, 0, 0, 0.05)',
                border: hasAlert 
                  ? (isAlerting ? '1px solid rgba(244, 67, 54, 0.4)' : '1px solid rgba(233, 30, 99, 0.3)')
                  : '1px solid rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  backgroundColor: hasAlert 
                    ? (isAlerting ? 'rgba(244, 67, 54, 0.2)' : 'rgba(233, 30, 99, 0.15)')
                    : 'rgba(0, 0, 0, 0.08)',
                },
              }}
            >
              {hasAlert ? (
                <NotificationsActiveIcon sx={{ 
                  fontSize: 20, 
                  color: isAlerting ? 'error.main' : 'primary.main',
                  animation: isAlerting ? 'pulse 1.5s infinite' : 'none'
                }} />
              ) : (
                <NotificationsOffIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              )}
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Layout de tarjeta para desktop
  return (
    <Card 
      sx={{ 
        minWidth: 280, 
        maxWidth: 320,
        textAlign: 'center', 
        m: 1, 
        borderRadius: 1,
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: darkMode
            ? '0 4px 12px rgba(0, 0, 0, 0.4)'
            : '0 2px 6px rgba(26, 14, 19, 0.15), 0 2px 4px rgba(26, 14, 19, 0.3)',
        },
        ...getCardColor(tag.peakRssi)
      }}
    >
      <CardContent sx={{ position: 'relative', pb: 2 }}>
        {/* Alert Button */}
        <Tooltip title={hasAlert ? `${isAlerting ? 'Alertando - ' : ''}Remover alerta` : "Añadir alerta de desaparición"}>
          <IconButton
            onClick={hasAlert ? onRemoveAlert : onAddAlert}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              width: 40,
              height: 40,
              backgroundColor: hasAlert 
                ? (isAlerting ? 'rgba(244, 67, 54, 0.15)' : 'rgba(233, 30, 99, 0.1)')
                : 'rgba(0, 0, 0, 0.05)',
              border: hasAlert 
                ? (isAlerting ? '1px solid rgba(244, 67, 54, 0.4)' : '1px solid rgba(233, 30, 99, 0.3)')
                : '1px solid rgba(0, 0, 0, 0.1)',
              '&:hover': {
                backgroundColor: hasAlert 
                  ? (isAlerting ? 'rgba(244, 67, 54, 0.2)' : 'rgba(233, 30, 99, 0.15)')
                  : 'rgba(0, 0, 0, 0.08)',
              },
            }}
          >
            {hasAlert ? (
              <NotificationsActiveIcon sx={{ 
                fontSize: 20, 
                color: isAlerting ? 'error.main' : 'primary.main',
                animation: isAlerting ? 'pulse 1.5s infinite' : 'none'
              }} />
            ) : (
              <NotificationsOffIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            )}
          </IconButton>
        </Tooltip>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 1 }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <NfcIcon sx={{ fontSize: 42, color: 'primary.main' }} />
            {getSignalIcon(tag.peakRssi)}
          </Box>
          
          <Typography sx={{ fontSize: 14, fontWeight: 500 }} color="text.secondary" gutterBottom>
            Tag RFID
          </Typography>
          
          <Typography 
            variant="body2" 
            component="div" 
            sx={{ 
              fontFamily: '"Roboto Mono", "Courier New", monospace', 
              fontSize: '0.85rem',
              wordBreak: 'break-all',
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              color: 'text.primary',
              padding: '8px 12px',
              borderRadius: 1,
              width: '100%',
              border: '1px solid',
              borderColor: 'divider',
              fontWeight: 500
            }}
          >
            {formatHexId(tag.idHex)}
          </Typography>

          {textContent && (
            <Chip 
              label={textContent}
              size="small"
              sx={{ 
                fontSize: '0.75rem', 
                maxWidth: '100%',
                backgroundColor: 'rgba(233, 30, 99, 0.1)',
                color: 'primary.main',
                border: '1px solid',
                borderColor: 'primary.main',
                fontWeight: 500
              }}
              variant="outlined"
            />
          )}

          <Box display="flex" gap={1.5} flexWrap="wrap" justifyContent="center">
            <Chip 
              label={`${tag.peakRssi} dBm`}
              size="small"
              variant="outlined"
              sx={{
                backgroundColor: tag.peakRssi >= -40 ? 'rgba(76, 175, 80, 0.1)' : 
                                tag.peakRssi >= -50 ? 'rgba(255, 152, 0, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                color: tag.peakRssi >= -40 ? '#4CAF50' : 
                       tag.peakRssi >= -50 ? '#FF9800' : '#F44336',
                borderColor: tag.peakRssi >= -40 ? '#4CAF50' : 
                             tag.peakRssi >= -50 ? '#FF9800' : '#F44336',
                fontWeight: 500
              }}
            />
            {tag.eventNum && (
              <Chip 
                label={`#${tag.eventNum}`}
                size="small"
                variant="outlined"
                sx={{
                  backgroundColor: 'rgba(109, 76, 65, 0.1)',
                  color: 'secondary.main',
                  borderColor: 'secondary.main',
                  fontWeight: 500
                }}
              />
            )}
          </Box>

          {tag.timestamp && (
            <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 400 }}>
              {new Date(tag.timestamp).toLocaleTimeString('es-ES')}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default InventoryItem;
