
'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import NfcIcon from '@mui/icons-material/Nfc';
import SignalWifiIcon from '@mui/icons-material/SignalWifi4Bar';
import SignalWifi3BarIcon from '@mui/icons-material/SignalWifi3Bar';
import SignalWifi2BarIcon from '@mui/icons-material/SignalWifi2Bar';
import SignalWifi1BarIcon from '@mui/icons-material/SignalWifi1Bar';

const InventoryItem = ({ tag }) => {
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
    if (rssi >= -30) return { backgroundColor: 'rgba(76, 175, 80, 0.1)', borderLeft: '4px solid #4CAF50' };
    if (rssi >= -40) return { backgroundColor: 'rgba(255, 152, 0, 0.1)', borderLeft: '4px solid #FF9800' };
    if (rssi >= -50) return { backgroundColor: 'rgba(255, 193, 7, 0.1)', borderLeft: '4px solid #FFC107' };
    return { backgroundColor: 'rgba(244, 67, 54, 0.1)', borderLeft: '4px solid #F44336' };
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
        minWidth: 250, 
        maxWidth: 300,
        textAlign: 'center', 
        m: 1, 
        boxShadow: 3, 
        borderRadius: 2,
        ...getCardColor(tag.peakRssi)
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <NfcIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            {getSignalIcon(tag.peakRssi)}
          </Box>
          
          <Typography sx={{ fontSize: 12 }} color="text.secondary" gutterBottom>
            Tag RFID
          </Typography>
          
          <Typography 
            variant="body2" 
            component="div" 
            sx={{ 
              fontFamily: 'monospace', 
              fontSize: '0.8rem',
              wordBreak: 'break-all',
              backgroundColor: 'rgba(0,0,0,0.05)',
              padding: '4px 8px',
              borderRadius: 1,
              width: '100%'
            }}
          >
            {formatHexId(tag.idHex)}
          </Typography>

          {textContent && (
            <Chip 
              label={textContent}
              size="small"
              color="secondary"
              variant="outlined"
              sx={{ fontSize: '0.7rem', maxWidth: '100%' }}
            />
          )}

          <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
            <Chip 
              label={`${tag.peakRssi} dBm`}
              size="small"
              color={tag.peakRssi >= -40 ? "success" : tag.peakRssi >= -50 ? "warning" : "error"}
            />
            {tag.eventNum && (
              <Chip 
                label={`#${tag.eventNum}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>

          {tag.timestamp && (
            <Typography sx={{ fontSize: 10 }} color="text.secondary">
              {new Date(tag.timestamp).toLocaleTimeString('es-ES')}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default InventoryItem;
