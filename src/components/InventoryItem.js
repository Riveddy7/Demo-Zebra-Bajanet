
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

const InventoryItem = ({ tag, hasAlert = false, onAddAlert, onRemoveAlert, layout = 'card' }) => {
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

  // Función para obtener color de card basado en RSSI
  const getCardColor = (rssi) => {
    const getSignalColor = (rssi) => {
      if (rssi >= -30) return '#30D158';
      if (rssi >= -40) return '#FF9F0A';
      if (rssi >= -50) return '#FFCC02';
      return '#FF3B30';
    };

    const signalColor = getSignalColor(rssi);
    
    if (hasAlert) {
      return {
        background: '#FFFFFF',
        border: `3px solid ${signalColor}`,
        boxShadow: `0 0 20px ${signalColor}30`,
      };
    }
    
    return {
      background: '#FFFFFF',
      border: `3px solid ${signalColor}`,
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
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

  // Layout de lista para móvil
  if (layout === 'list') {
    return (
      <Card 
        sx={{ 
          width: '100%',
          borderRadius: 2,
          transition: 'all 0.2s ease',
          ...getCardColor(tag.peakRssi)
        }}
      >
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1} flex={1}>
              <NfcIcon sx={{ fontSize: 24, color: '#007AFF' }} />
              {getSignalIcon(tag.peakRssi)}
              
              <Box flex={1} minWidth={0}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Mono", Monaco, monospace',
                    fontSize: '0.75rem',
                    color: '#1D1D1F',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {formatHexId(tag.idHex)}
                </Typography>
                {textContent && (
                  <Typography variant="caption" sx={{ color: '#007AFF' }}>
                    {textContent}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <Chip 
                label={`${tag.peakRssi} dBm`}
                size="small"
                sx={{
                  backgroundColor: tag.peakRssi >= -40 ? 'rgba(48, 209, 88, 0.1)' : 
                                  tag.peakRssi >= -50 ? 'rgba(255, 159, 10, 0.1)' : 'rgba(255, 59, 48, 0.1)',
                  color: tag.peakRssi >= -40 ? '#30D158' : 
                         tag.peakRssi >= -50 ? '#FF9F0A' : '#FF3B30',
                  fontSize: '0.7rem'
                }}
              />
              
              <IconButton
                onClick={hasAlert ? onRemoveAlert : onAddAlert}
                size="small"
                sx={{
                  width: 28,
                  height: 28,
                  background: hasAlert ? 'rgba(255, 159, 10, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                }}
              >
                {hasAlert ? (
                  <NotificationsActiveIcon sx={{ fontSize: 16, color: '#FF9F0A' }} />
                ) : (
                  <NotificationsOffIcon sx={{ fontSize: 16, color: 'rgba(0, 0, 0, 0.4)' }} />
                )}
              </IconButton>
            </Box>
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
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
        },
        ...getCardColor(tag.peakRssi)
      }}
    >
      <CardContent sx={{ position: 'relative', pb: 2 }}>
        {/* Alert Button */}
        <Tooltip title={hasAlert ? "Remover alerta" : "Añadir alerta de desaparición"}>
          <IconButton
            onClick={hasAlert ? onRemoveAlert : onAddAlert}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 36,
              height: 36,
              background: hasAlert 
                ? 'rgba(255, 159, 10, 0.1)' 
                : 'rgba(0, 0, 0, 0.05)',
              border: hasAlert 
                ? '1px solid rgba(255, 159, 10, 0.2)' 
                : '1px solid rgba(0, 0, 0, 0.1)',
              '&:hover': {
                background: hasAlert 
                  ? 'rgba(255, 159, 10, 0.2)' 
                  : 'rgba(0, 0, 0, 0.08)',
              },
            }}
          >
            {hasAlert ? (
              <NotificationsActiveIcon sx={{ fontSize: 20, color: '#FF9F0A' }} />
            ) : (
              <NotificationsOffIcon sx={{ fontSize: 20, color: 'rgba(0, 0, 0, 0.4)' }} />
            )}
          </IconButton>
        </Tooltip>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <NfcIcon sx={{ fontSize: 40, color: '#007AFF' }} />
            {getSignalIcon(tag.peakRssi)}
          </Box>
          
          <Typography sx={{ fontSize: 12 }} color="text.secondary" gutterBottom>
            Tag RFID
          </Typography>
          
          <Typography 
            variant="body2" 
            component="div" 
            sx={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Mono", Monaco, monospace', 
              fontSize: '0.8rem',
              wordBreak: 'break-all',
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              color: '#1D1D1F',
              padding: '6px 10px',
              borderRadius: 2,
              width: '100%',
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }}
          >
            {formatHexId(tag.idHex)}
          </Typography>

          {textContent && (
            <Chip 
              label={textContent}
              size="small"
              sx={{ 
                fontSize: '0.7rem', 
                maxWidth: '100%',
                backgroundColor: 'rgba(0, 122, 255, 0.1)',
                color: '#007AFF',
                border: '1px solid rgba(0, 122, 255, 0.2)'
              }}
              variant="outlined"
            />
          )}

          <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
            <Chip 
              label={`${tag.peakRssi} dBm`}
              size="small"
              sx={{
                backgroundColor: tag.peakRssi >= -40 ? 'rgba(48, 209, 88, 0.1)' : 
                                tag.peakRssi >= -50 ? 'rgba(255, 159, 10, 0.1)' : 'rgba(255, 59, 48, 0.1)',
                color: tag.peakRssi >= -40 ? '#30D158' : 
                       tag.peakRssi >= -50 ? '#FF9F0A' : '#FF3B30',
                border: tag.peakRssi >= -40 ? '1px solid rgba(48, 209, 88, 0.2)' : 
                        tag.peakRssi >= -50 ? '1px solid rgba(255, 159, 10, 0.2)' : '1px solid rgba(255, 59, 48, 0.2)',
              }}
            />
            {tag.eventNum && (
              <Chip 
                label={`#${tag.eventNum}`}
                size="small"
                variant="outlined"
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  color: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid rgba(0, 0, 0, 0.1)'
                }}
              />
            )}
          </Box>

          {tag.timestamp && (
            <Typography sx={{ fontSize: '0.65rem', color: 'rgba(0, 0, 0, 0.4)' }}>
              {new Date(tag.timestamp).toLocaleTimeString('es-ES')}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default InventoryItem;
