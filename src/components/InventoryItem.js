
'use client';

import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import NfcIcon from '@mui/icons-material/Nfc';

const InventoryItem = ({ tagId }) => {
  return (
    <Card sx={{ minWidth: 220, textAlign: 'center', m: 1, boxShadow: 3, borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <NfcIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            ID del Tag
          </Typography>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {tagId}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InventoryItem;
