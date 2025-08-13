
'use client';

import React from 'react';
import { Grid, Typography, Box, Card, CardContent, Chip, Divider } from '@mui/material';
import InventoryItem from './InventoryItem';
import InboxIcon from '@mui/icons-material/Inbox';
import RouterIcon from '@mui/icons-material/Router';

const InventoryDisplay = ({ antennaData = [], alertedTags = new Set(), onAddAlert, onRemoveAlert }) => {
  if (antennaData.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 10, color: 'text.secondary' }}>
        <InboxIcon sx={{ fontSize: 60 }} />
        <Typography variant="h5">No hay items en el inventario.</Typography>
        <Typography>Esperando datos de la lectora RFID...</Typography>
      </Box>
    );
  }

  const totalTags = antennaData.reduce((sum, antenna) => sum + (antenna.tags?.length || 0), 0);

  return (
    <Box>

      {/* Datos por antena */}
      {antennaData.map((antennaGroup) => (
        <Card key={antennaGroup.antenna} sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <RouterIcon color="primary" />
              <Typography variant="h6" component="h3" color="primary">
                Antena {antennaGroup.antenna}
              </Typography>
              <Chip 
                label={`${antennaGroup.tags?.length || 0} tags`} 
                size="small" 
                color="primary" 
              />
            </Box>
            
            {antennaGroup.tags && antennaGroup.tags.length > 0 ? (
              <Grid container spacing={2}>
                {antennaGroup.tags.map((tag) => (
                  <Grid item key={`${antennaGroup.antenna}-${tag.idHex}`}>
                    <InventoryItem 
                      tag={tag} 
                      hasAlert={alertedTags.has(tag.idHex)}
                      onAddAlert={() => onAddAlert(tag)}
                      onRemoveAlert={() => onRemoveAlert(tag.idHex)}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
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
