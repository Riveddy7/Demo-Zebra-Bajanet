
'use client';

import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import InventoryItem from './InventoryItem';
import InboxIcon from '@mui/icons-material/Inbox';

const InventoryDisplay = ({ items = [] }) => {
  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 10, color: 'text.secondary' }}>
        <InboxIcon sx={{ fontSize: 60 }} />
        <Typography variant="h5">No hay items en el inventario.</Typography>
        <Typography>Esperando datos de la lectora RFID...</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      {items.map((tagId) => (
        <Grid item key={tagId}>
          <InventoryItem tagId={tagId} />
        </Grid>
      ))}
    </Grid>
  );
};

export default InventoryDisplay;
