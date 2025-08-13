
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

const InventoryItem = ({ tag, hasAlert = false, onAddAlert, onRemoveAlert }) => {
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

  // Función para obtener color de card basado en RSSI con tema oscuro
  const getCardColor = (rssi) => {
    const baseStyle = {
      background: 'rgba(28, 28, 30, 0.8)',
      backdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    };
    
    if (hasAlert) {
      return {
        ...baseStyle,
        border: '2px solid #FF9F0A',
        boxShadow: '0 0 20px rgba(255, 159, 10, 0.3)',
      };
    }
    
    if (rssi >= -30) return { ...baseStyle, borderLeft: '4px solid #30D158' };
    if (rssi >= -40) return { ...baseStyle, borderLeft: '4px solid #FF9F0A' };
    if (rssi >= -50) return { ...baseStyle, borderLeft: '4px solid #FFCC02' };
    return { ...baseStyle, borderLeft: '4px solid #FF3B30' };
  };

  // Función para formatear el hex ID de forma más legible
  const formatHexId = (hexId) => {
    if (!hexId) return 'N/A';
    // Dividir en grupos de 4 caracteres
    return hexId.match(/.{1,4}/g)?.join(' ') || hexId;
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
    } catch {
      return null;
    }
  };

  const textContent = hexToText(tag.idHex);

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
                ? 'rgba(255, 159, 10, 0.2)' 
                : 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: hasAlert 
                ? '1px solid rgba(255, 159, 10, 0.3)' 
                : '1px solid rgba(255, 255, 255, 0.2)',
              '&:hover': {
                background: hasAlert 
                  ? 'rgba(255, 159, 10, 0.3)' 
                  : 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            {hasAlert ? (
              <NotificationsActiveIcon sx={{ fontSize: 20, color: '#FF9F0A' }} />
            ) : (
              <NotificationsOffIcon sx={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.6)' }} />
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
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'rgba(255, 255, 255, 0.9)',
              padding: '6px 10px',
              borderRadius: 2,
              width: '100%',
              border: '1px solid rgba(255, 255, 255, 0.1)'
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
                backgroundColor: 'rgba(0, 122, 255, 0.2)',
                color: '#5AC8FA',
                border: '1px solid rgba(90, 200, 250, 0.3)'
              }}
              variant="outlined"
            />
          )}

          <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
            <Chip 
              label={`${tag.peakRssi} dBm`}
              size="small"
              sx={{
                backgroundColor: tag.peakRssi >= -40 ? 'rgba(48, 209, 88, 0.2)' : 
                                tag.peakRssi >= -50 ? 'rgba(255, 159, 10, 0.2)' : 'rgba(255, 59, 48, 0.2)',
                color: tag.peakRssi >= -40 ? '#30D158' : 
                       tag.peakRssi >= -50 ? '#FF9F0A' : '#FF3B30',
                border: tag.peakRssi >= -40 ? '1px solid rgba(48, 209, 88, 0.3)' : 
                        tag.peakRssi >= -50 ? '1px solid rgba(255, 159, 10, 0.3)' : '1px solid rgba(255, 59, 48, 0.3)',
              }}
            />
            {tag.eventNum && (
              <Chip 
                label={`#${tag.eventNum}`}
                size="small"
                variant="outlined"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              />
            )}
          </Box>

          {tag.timestamp && (
            <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.5)' }}>
              {new Date(tag.timestamp).toLocaleTimeString('es-ES')}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default InventoryItem;
