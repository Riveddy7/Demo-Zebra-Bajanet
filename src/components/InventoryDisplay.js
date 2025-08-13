
'use client';

import React from 'react';
import { Grid, Typography, Box, Card, CardContent, Chip, Divider } from '@mui/material';
import InventoryItem from './InventoryItem';
import InboxIcon from '@mui/icons-material/Inbox';
import RouterIcon from '@mui/icons-material/Router';

const InventoryDisplay = ({ antennaData = [], alertedTags = new Set(), activeAlerts = new Set(), onAddAlert, onRemoveAlert, darkMode = false }) => {
  if (antennaData.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 10, color: 'text.secondary' }}>
        <InboxIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 500, mb: 1 }}>
          No hay items en el inventario.
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Esperando datos de la lectora RFID...
        </Typography>
      </Box>
    );
  }

  const totalTags = antennaData.reduce((sum, antenna) => sum + (antenna.tags?.length || 0), 0);

  return (
    <Box>

      {/* Datos por antena */}
      {antennaData.map((antennaGroup) => (
        <Card key={antennaGroup.antenna} sx={{ mb: { xs: 2, md: 4 } }}>
          <CardContent sx={{ pb: { xs: 1, md: 2 } }}>
            <Box display="flex" alignItems="center" gap={{ xs: 1.5, md: 2 }} mb={{ xs: 2, md: 3 }}>
              <RouterIcon color="primary" sx={{ fontSize: { xs: 20, md: 24 } }} />
              <Typography variant={{ xs: 'subtitle1', md: 'h6' }} component="h3" color="primary" sx={{ fontWeight: 500 }}>
                Antena {antennaGroup.antenna}
              </Typography>
              <Chip 
                label={`${antennaGroup.tags?.length || 0} tags`} 
                size="small" 
                variant="outlined"
                color="primary"
                sx={{ fontWeight: 500, fontSize: { xs: '0.7rem', md: '0.75rem' } }}
              />
            </Box>
            
            {antennaGroup.tags && antennaGroup.tags.length > 0 ? (
              <>
                {/* Desktop Layout - Grid */}
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <Grid container spacing={3}>
                    {antennaGroup.tags
                      .sort((a, b) => (b.peakRssi || -999) - (a.peakRssi || -999)) // Ordenar por RSSI descendente
                      .map((tag) => (
                        <Grid item key={`${antennaGroup.antenna}-${tag.idHex}`}>
                          <InventoryItem 
                            tag={tag} 
                            hasAlert={alertedTags.has(tag.idHex)}
                            isAlerting={activeAlerts.has(tag.idHex)}
                            onAddAlert={() => onAddAlert(tag)}
                            onRemoveAlert={() => onRemoveAlert(tag.idHex)}
                            layout="card"
                            darkMode={darkMode}
                          />
                        </Grid>
                      ))}
                  </Grid>
                </Box>

                {/* Mobile Layout - List compacto */}
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                  {antennaGroup.tags
                    .sort((a, b) => (b.peakRssi || -999) - (a.peakRssi || -999)) // Ordenar por RSSI descendente
                    .map((tag) => (
                      <Box key={`${antennaGroup.antenna}-${tag.idHex}`} sx={{ mb: 0.5 }}>
                        <InventoryItem 
                          tag={tag} 
                          hasAlert={alertedTags.has(tag.idHex)}
                          isAlerting={activeAlerts.has(tag.idHex)}
                          onAddAlert={() => onAddAlert(tag)}
                          onRemoveAlert={() => onRemoveAlert(tag.idHex)}
                          layout="list"
                          darkMode={darkMode}
                        />
                      </Box>
                    ))}
                </Box>
              </>
            ) : (
              <Typography color="text.secondary" sx={{ fontStyle: 'italic', py: 2 }}>
                No hay tags detectados en esta antena
              </Typography>
            )}
          </CardContent>
          {antennaData.indexOf(antennaGroup) < antennaData.length - 1 && <Divider />}
        </Card>
      ))}
    </Box>
  );
};

export default InventoryDisplay;
